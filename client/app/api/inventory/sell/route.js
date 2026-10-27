import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemSell, ItemStore, InventoryItem, StockMovement } from '@/lib/models';
import { recalculateItemStock, getStoreAvailableStock, seedInventoryIfEmpty } from '@/lib/inventoryService';

export async function GET(req) {
  try {
    await connectDB();
    await seedInventoryIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const storeId = searchParams.get('storeId');
    const customerType = searchParams.get('customerType');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query = {};
    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    }
    if (storeId && storeId !== 'All' && storeId !== 'all') {
      query.storeId = storeId;
    }
    if (customerType && customerType !== 'All' && customerType !== 'all') {
      query.customerType = customerType;
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
        { invoiceNo: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerContact: { $regex: search, $options: 'i' } },
        { referenceNo: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
        { 'items.itemName': { $regex: search, $options: 'i' } }
      ];
    }

    const sales = await ItemSell.find(query).sort({ date: -1, createdAt: -1 }).lean();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const posted = sales.filter(s => s.status === 'Posted');
    const stats = {
      totalSales: sales.length,
      salesToday: sales.filter(s => new Date(s.date) >= startOfToday).length,
      salesThisMonth: sales.filter(s => new Date(s.date) >= startOfMonth).length,
      totalQuantitySold: posted.reduce((sum, s) => sum + (Number(s.totalQuantity) || 0), 0),
      totalRevenue: posted.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0)
    };

    return NextResponse.json({
      success: true,
      data: sales,
      total: sales.length,
      stats
    });
  } catch (error) {
    console.error('API /inventory/sell GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const storeId = body.storeId;
    const customerName = String(body.customerName || '').trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!storeId) {
      return NextResponse.json({ success: false, message: 'Please select a source store.' }, { status: 400 });
    }
    if (!customerName) {
      return NextResponse.json({ success: false, message: 'Customer name or student identity is required.' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'Please add at least one item row to sell.' }, { status: 400 });
    }

    const store = await ItemStore.findById(storeId);
    if (!store) return NextResponse.json({ success: false, message: 'Selected store not found.' }, { status: 404 });

    // Validate available stock for each line item in this specific store!
    const parsedItems = [];
    let subtotal = 0;
    let totalQuantity = 0;

    for (const row of items) {
      const itm = await InventoryItem.findById(row.itemId);
      if (!itm) {
        return NextResponse.json({ success: false, message: `Item ID "${row.itemId}" not found.` }, { status: 400 });
      }

      const qty = Number(row.quantity) || 0;
      if (qty <= 0) {
        return NextResponse.json({ success: false, message: `Invalid quantity for item "${itm.name}". Must be at least 1.` }, { status: 400 });
      }

      // Check available stock in this store
      const availableInStore = await getStoreAvailableStock(itm._id, store._id);
      if (qty > availableInStore) {
        return NextResponse.json({
          success: false,
          message: `Insufficient stock for "${itm.name}" in ${store.name}. Available: ${availableInStore} ${itm.unit}, Requested: ${qty} ${itm.unit}.`
        }, { status: 400 });
      }

      const price = Number(row.unitPrice) || Number(itm.sellingPrice) || 0;
      const discount = Number(row.discount) || 0;
      const lineTotal = Math.max(0, qty * price - discount);

      parsedItems.push({
        itemId: itm._id,
        itemName: itm.name,
        itemCode: itm.code,
        unit: itm.unit,
        quantity: qty,
        unitPrice: price,
        discount,
        lineTotal
      });

      subtotal += lineTotal;
      totalQuantity += qty;
    }

    const overallDiscount = Number(body.discount) || 0;
    const grandTotal = Math.max(0, subtotal - overallDiscount);
    const paidAmount = body.paidAmount !== undefined ? Number(body.paidAmount) : grandTotal;

    const count = await ItemSell.countDocuments();
    const invoiceNo = body.invoiceNo || `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const status = body.status === 'Draft' ? 'Draft' : 'Posted';

    const sellDoc = await ItemSell.create({
      invoiceNo,
      date: body.date ? new Date(body.date) : new Date(),
      storeId: store._id,
      storeName: store.name,
      customerType: body.customerType || 'Student',
      customerId: body.customerId || undefined,
      customerName,
      customerContact: body.customerContact || '',
      paymentMethod: body.paymentMethod || 'Cash',
      referenceNo: body.referenceNo || '',
      items: parsedItems,
      subtotal,
      discount: overallDiscount,
      grandTotal,
      paidAmount,
      totalItems: parsedItems.length,
      totalQuantity,
      status,
      soldByName: body.soldByName || 'Store Officer',
      notes: body.notes || ''
    });

    // If posted, deduct stock by recording negative stock movements
    if (status === 'Posted') {
      for (const row of parsedItems) {
        await StockMovement.create({
          itemId: row.itemId,
          itemName: row.itemName,
          storeId: store._id,
          storeName: store.name,
          transactionType: 'SELL',
          referenceType: 'ItemSell',
          referenceId: sellDoc._id,
          referenceNo: sellDoc.invoiceNo,
          quantityIn: 0,
          quantityOut: row.quantity,
          netQuantity: -row.quantity,
          unitCost: 0,
          totalValue: row.lineTotal,
          date: sellDoc.date,
          performedBy: sellDoc.soldByName,
          remarks: `Sale to ${customerName}`
        });

        // Reconcile item stock
        await recalculateItemStock(row.itemId);
      }
    }

    return NextResponse.json({
      success: true,
      data: sellDoc,
      message: `Sale Invoice ${invoiceNo} posted successfully! Inventory updated.`
    }, { status: 201 });
  } catch (error) {
    console.error('API /inventory/sell POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
