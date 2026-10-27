import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemIssue, StockMovement } from '@/lib/models';
import { recalculateItemStock } from '@/lib/inventoryService';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await ItemIssue.findById(id).lean();
    if (!doc) return NextResponse.json({ success: false, message: 'Issue voucher not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await ItemIssue.findById(id);
    if (!doc) return NextResponse.json({ success: false, message: 'Issue voucher not found.' }, { status: 404 });

    if (doc.status === 'Cancelled') {
      return NextResponse.json({ success: false, message: 'Voucher is already cancelled.' }, { status: 400 });
    }

    // Restore unreturned stock back into the store
    for (const row of doc.items) {
      const remainingIssued = Math.max(0, row.quantity - (row.returnedQuantity || 0));
      if (remainingIssued > 0) {
        await StockMovement.create({
          itemId: row.itemId,
          itemName: row.itemName,
          storeId: doc.storeId,
          storeName: doc.storeName,
          transactionType: 'REVERSAL',
          referenceType: 'ItemIssue',
          referenceId: doc._id,
          referenceNo: doc.issueNo,
          quantityIn: remainingIssued,
          quantityOut: 0,
          netQuantity: remainingIssued, // Restores stock
          unitCost: 0,
          totalValue: 0,
          date: new Date(),
          performedBy: 'Store Auditor',
          remarks: `Cancellation of Issue ${doc.issueNo}`
        });

        await recalculateItemStock(row.itemId);
      }
    }

    doc.status = 'Cancelled';
    await doc.save();

    return NextResponse.json({
      success: true,
      data: doc,
      message: `Issue voucher ${doc.issueNo} cancelled and unreturned items restored to store.`
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
