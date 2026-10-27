import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemReceive, StockMovement } from '@/lib/models';
import { recalculateItemStock } from '@/lib/inventoryService';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const reason = String(body.reason || 'Authorized managerial reversal').trim();

    const doc = await ItemReceive.findById(id);
    if (!doc) return NextResponse.json({ success: false, message: 'Receipt not found.' }, { status: 404 });

    if (doc.status !== 'Posted') {
      return NextResponse.json({ success: false, message: `Only posted receipts can be reversed. Current status is ${doc.status}.` }, { status: 400 });
    }

    // Create offsetting reversal movements for each item
    for (const row of doc.items) {
      await StockMovement.create({
        itemId: row.itemId,
        itemName: row.itemName,
        storeId: doc.storeId,
        storeName: doc.storeName,
        transactionType: 'REVERSAL',
        referenceType: 'ItemReceive',
        referenceId: doc._id,
        referenceNo: doc.receiptNo,
        quantityIn: 0,
        quantityOut: row.receivedQuantity,
        netQuantity: -row.receivedQuantity, // Offsets the original +receivedQuantity
        unitCost: row.unitCost,
        totalValue: row.lineTotal,
        date: new Date(),
        performedBy: body.reversedBy || 'Store Auditor',
        remarks: `Reversal of GRN ${doc.receiptNo}: ${reason}`
      });

      // Recalculate item stock
      await recalculateItemStock(row.itemId);
    }

    doc.status = 'Reversed';
    doc.reversalReason = reason;
    await doc.save();

    return NextResponse.json({
      success: true,
      data: doc,
      message: `Goods Received Note ${doc.receiptNo} reversed successfully. Inventory stock has been restored.`
    });
  } catch (error) {
    console.error('API /inventory/receive/[id]/reverse error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
