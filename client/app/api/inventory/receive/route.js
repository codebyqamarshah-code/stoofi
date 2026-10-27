import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemReceive, Supplier, ItemStore, InventoryItem, StockMovement } from '@/lib/models';
import { recalculateItemStock, seedInventoryIfEmpty } from '@/lib/inventoryService';

export async function GET(req) {
  try {
    await connectDB();
    await seedInventoryIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const supplierId = searchParams.get('supplierId');
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query = {};
    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    }
    if (supplierId && supplierId !== 'All' && supplierId !== 'all') {
      query.supplierId = supplierId;
    }
    if (storeId && storeId !== 'All' && storeId !== 'all') {
      query.storeId = storeId;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        query.date.$lte = e;
      }
    }
    if (search) {
      query.$or = [
        { receiptNo: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
        { supplierInvoiceNo: { $regex: search, $options: 'i' } },
        { referenceNo: { $regex: search, $options: 'i' } },
        { 'items.itemName': { $regex: search, $options: 'i' } }
      ];
    }

    const receives = await ItemReceive.find(query).sort({ date: -1, createdAt: -1 }).lean();

    // Calculate metrics
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const posted = receives.filter(r => r.status === 'Posted');
    const stats = {
      totalReceipts: receives.length,
      receiptsToday: receives.filter(r => new Date(r.date) >= startOfToday).length,
      receiptsThisMonth: receives.filter(r => new Date(r.date) >= startOfMonth).length,
      totalQuantityReceived: posted.reduce((sum, r) => sum + (Number(r.totalQuantity) || 0), 0),
      totalValueReceived: posted.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0),
      draftCount: receives.filter(r => r.status === 'Draft').length
    };

    return NextResponse.json({
      success: true,
      data: receives,
      total: receives.length,
      stats
    });
  } catch (error) {
    console.error('API /inventory/receive GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const supplierId = body.supplierId;
    const storeId = body.storeId;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!supplierId) {
      return NextResponse.json({ success: false, message: 'Please select a supplier.' }, { status: 400 });
    }
    if (!storeId) {
      return NextResponse.json({ success: false, message: 'Please select a destination store.' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'Please add at least one item to receive.' }, { status: 400 });
    }

    const [supplier, store] = await Promise.all([
      Supplier.findById(supplierId),
      ItemStore.findById(storeId)
    ]);
    if (!supplier) return NextResponse.json({ success: false, message: 'Selected supplier not found.' }, { status: 404 });
    if (!store) return NextResponse.json({ success: false, message: 'Selected store not found.' }, { status: 404 });

    // Validate line items
    const parsedItems = [];
    let subtotal = 0;
    let totalQuantity = 0;

    for (const row of items) {
      const itm = await InventoryItem.findById(row.itemId);
      if (!itm) {
        return NextResponse.json({ success: false, message: `Item ID "${row.itemId}" not found in inventory.` }, { status: 400 });
      }
      const qty = Number(row.receivedQuantity || row.quantity) || 0;
      if (qty <= 0) {
        return NextResponse.json({ success: false, message: `Invalid quantity for item "${itm.name}". Must be at least 1.` }, { status: 400 });
      }
      const cost = Number(row.unitCost) || Number(itm.unitCost) || 0;
      const discount = Number(row.discount) || 0;
      const lineTotal = Math.max(0, qty * cost - discount);

      parsedItems.push({
        itemId: itm._id,
        itemName: itm.name,
        itemCode: itm.code,
        unit: itm.unit,
        orderedQuantity: Number(row.orderedQuantity) || qty,
        receivedQuantity: qty,
        unitCost: cost,
        discount,
        lineTotal
      });

      subtotal += lineTotal;
      totalQuantity += qty;
    }

    const overallDiscount = Number(body.discount) || 0;
    const grandTotal = Math.max(0, subtotal - overallDiscount);

    // Auto-generate receipt number
    const count = await ItemReceive.countDocuments();
    const receiptNo = body.receiptNo || `GRN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const status = body.status === 'Draft' ? 'Draft' : 'Posted';

    const receiveDoc = await ItemReceive.create({
      receiptNo,
      date: body.date ? new Date(body.date) : new Date(),
      supplierId: supplier._id,
      supplierName: supplier.name,
      storeId: store._id,
      storeName: store.name,
      supplierInvoiceNo: body.supplierInvoiceNo || '',
      referenceNo: body.referenceNo || '',
      receivedByName: body.receivedByName || 'Store Officer',
      items: parsedItems,
      subtotal,
      discount: overallDiscount,
      grandTotal,
      totalItems: parsedItems.length,
      totalQuantity,
      status,
      notes: body.notes || ''
    });

    // If posted, create stock movements and reconcile stock!
    if (status === 'Posted') {
      for (const row of parsedItems) {
        await StockMovement.create({
          itemId: row.itemId,
          itemName: row.itemName,
          storeId: store._id,
          storeName: store.name,
          transactionType: 'RECEIVE',
          referenceType: 'ItemReceive',
          referenceId: receiveDoc._id,
          referenceNo: receiveDoc.receiptNo,
          quantityIn: row.receivedQuantity,
          quantityOut: 0,
          netQuantity: row.receivedQuantity,
          unitCost: row.unitCost,
          totalValue: row.lineTotal,
          date: receiveDoc.date,
          performedBy: receiveDoc.receivedByName,
          remarks: `GRN from ${supplier.name}`
        });

        // Reconcile item stock
        await recalculateItemStock(row.itemId);
      }
    }

    return NextResponse.json({
      success: true,
      data: receiveDoc,
      message: status === 'Posted' ? `Goods Received Note ${receiptNo} posted successfully!` : `GRN Draft ${receiptNo} saved.`
    }, { status: 201 });
  } catch (error) {
    console.error('API /inventory/receive POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
