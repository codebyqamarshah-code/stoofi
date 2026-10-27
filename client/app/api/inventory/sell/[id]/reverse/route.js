import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemSell, StockMovement } from '@/lib/models';
import { recalculateItemStock } from '@/lib/inventoryService';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const reason = String(body.reason || 'Authorized sales reversal / return').trim();

    const doc = await ItemSell.findById(id);
    if (!doc) return NextResponse.json({ success: false, message: 'Sale invoice not found.' }, { status: 404 });

    if (doc.status !== 'Posted') {
      return NextResponse.json({ success: false, message: `Only posted sales can be reversed. Current status is ${doc.status}.` }, { status: 400 });
    }

    // Restore stock by creating offsetting positive movements
    for (const row of doc.items) {
      await StockMovement.create({
        itemId: row.itemId,
        itemName: row.itemName,
        storeId: doc.storeId,
        storeName: doc.storeName,
        transactionType: 'REVERSAL',
        referenceType: 'ItemSell',
        referenceId: doc._id,
        referenceNo: doc.invoiceNo,
        quantityIn: row.quantity,
        quantityOut: 0,
        netQuantity: row.quantity, // Restores stock back into store
        unitCost: 0,
        totalValue: row.lineTotal,
        date: new Date(),
        performedBy: body.reversedBy || 'Store Auditor',
        remarks: `Reversal of Sale ${doc.invoiceNo}: ${reason}`
      });

      await recalculateItemStock(row.itemId);
    }

    doc.status = 'Reversed';
    doc.reversalReason = reason;
    await doc.save();

    return NextResponse.json({
      success: true,
      data: doc,
      message: `Sale invoice ${doc.invoiceNo} reversed successfully. Inventory stock has been restored.`
    });
  } catch (error) {
    console.error('API /inventory/sell/[id]/reverse error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
