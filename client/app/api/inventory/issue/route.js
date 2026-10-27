import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemIssue, ItemStore, InventoryItem, StockMovement } from '@/lib/models';
import { recalculateItemStock, getStoreAvailableStock, seedInventoryIfEmpty } from '@/lib/inventoryService';

export async function GET(req) {
  try {
    await connectDB();
    await seedInventoryIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const storeId = searchParams.get('storeId');
    const recipientType = searchParams.get('recipientType');
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
    if (recipientType && recipientType !== 'All' && recipientType !== 'all') {
      query.recipientType = recipientType;
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
        { issueNo: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
        { 'items.itemName': { $regex: search, $options: 'i' } }
      ];
    }

    const issues = await ItemIssue.find(query).sort({ date: -1, createdAt: -1 }).lean();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const stats = {
      totalIssues: issues.length,
      issuesToday: issues.filter(i => new Date(i.date) >= startOfToday).length,
      totalQuantityIssued: issues.filter(i => i.status !== 'Cancelled').reduce((sum, i) => sum + (Number(i.totalQuantity) || 0), 0),
      partiallyReturnedCount: issues.filter(i => i.status === 'Partially Returned').length,
      fullyReturnedCount: issues.filter(i => i.status === 'Fully Returned').length
    };

    return NextResponse.json({
      success: true,
      data: issues,
      total: issues.length,
      stats
    });
  } catch (error) {
    console.error('API /inventory/issue GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const storeId = body.storeId;
    const recipientType = body.recipientType || 'Department';
    const recipientName = String(body.recipientName || '').trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!storeId) {
      return NextResponse.json({ success: false, message: 'Please select a source store.' }, { status: 400 });
    }
    if (!recipientName) {
      return NextResponse.json({ success: false, message: 'Recipient name or department is required.' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'Please add at least one item row to issue.' }, { status: 400 });
    }

    const store = await ItemStore.findById(storeId);
    if (!store) return NextResponse.json({ success: false, message: 'Selected store not found.' }, { status: 404 });

    // Validate available stock for each line item in this specific store!
    const parsedItems = [];
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

      parsedItems.push({
        itemId: itm._id,
        itemName: itm.name,
        itemCode: itm.code,
        unit: itm.unit,
        quantity: qty,
        condition: row.condition || 'Good / New',
        returnedQuantity: 0,
        remarks: row.remarks || ''
      });

      totalQuantity += qty;
    }

    const count = await ItemIssue.countDocuments();
    const issueNo = body.issueNo || `ISS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const issueDoc = await ItemIssue.create({
      issueNo,
      date: body.date ? new Date(body.date) : new Date(),
      storeId: store._id,
      storeName: store.name,
      recipientType,
      recipientId: body.recipientId || undefined,
      recipientName,
      department: body.department || '',
      purpose: body.purpose || 'Campus Requisition',
      issuedByName: body.issuedByName || 'Store Incharge',
      items: parsedItems,
      totalItems: parsedItems.length,
      totalQuantity,
      status: 'Issued',
      notes: body.notes || ''
    });

    // Deduct stock via StockMovement entries
    for (const row of parsedItems) {
      await StockMovement.create({
        itemId: row.itemId,
        itemName: row.itemName,
        storeId: store._id,
        storeName: store.name,
        transactionType: 'ISSUE',
        referenceType: 'ItemIssue',
        referenceId: issueDoc._id,
        referenceNo: issueDoc.issueNo,
        quantityIn: 0,
        quantityOut: row.quantity,
        netQuantity: -row.quantity,
        unitCost: 0,
        totalValue: 0,
        date: issueDoc.date,
        performedBy: issueDoc.issuedByName,
        remarks: `Issued to ${recipientName} (${recipientType})`
      });

      await recalculateItemStock(row.itemId);
    }

    return NextResponse.json({
      success: true,
      data: issueDoc,
      message: `Issue Voucher ${issueNo} generated and stock dispatched successfully!`
    }, { status: 201 });
  } catch (error) {
    console.error('API /inventory/issue POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
