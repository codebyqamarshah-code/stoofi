import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemIssue, StockMovement } from '@/lib/models';
import { recalculateItemStock } from '@/lib/inventoryService';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { itemId, returnQuantity, returnedQty, remarks } = body;
    const qtyToReturn = Number(returnQuantity || returnedQty) || 0;

    if (qtyToReturn <= 0) {
      return NextResponse.json({ success: false, message: 'Return quantity must be at least 1.' }, { status: 400 });
    }

    const doc = await ItemIssue.findById(id);
    if (!doc) return NextResponse.json({ success: false, message: 'Issue voucher not found.' }, { status: 404 });

    const itemRow = doc.items.find(i => String(i.itemId) === String(itemId));
    if (!itemRow) {
      return NextResponse.json({ success: false, message: 'Item is not part of this issue voucher.' }, { status: 400 });
    }

    const maxReturnable = itemRow.quantity - (itemRow.returnedQuantity || 0);
    if (qtyToReturn > maxReturnable) {
      return NextResponse.json({
        success: false,
        message: `Cannot return ${qtyToReturn} units. Maximum remaining returnable quantity for this item is ${maxReturnable}.`
      }, { status: 400 });
    }

    // 1. Update line item returned quantity
    itemRow.returnedQuantity = (itemRow.returnedQuantity || 0) + qtyToReturn;

    // 2. Record Stock Movement for the returned quantity
    await StockMovement.create({
      itemId: itemRow.itemId,
      itemName: itemRow.itemName,
      storeId: doc.storeId,
      storeName: doc.storeName,
      transactionType: 'RETURN',
      referenceType: 'ItemIssue',
      referenceId: doc._id,
      referenceNo: doc.issueNo,
      quantityIn: qtyToReturn,
      quantityOut: 0,
      netQuantity: qtyToReturn, // Restores stock to store
      unitCost: 0,
      totalValue: 0,
      date: new Date(),
      performedBy: body.returnedBy || 'Store Incharge',
      remarks: `Return from Issue ${doc.issueNo}: ${remarks || 'Item returned in good condition'}`
    });

    // 3. Check overall issue status
    let allReturned = true;
    let anyReturned = false;

    doc.items.forEach(i => {
      const ret = i.returnedQuantity || 0;
      if (ret > 0) anyReturned = true;
      if (ret < i.quantity) allReturned = false;
    });

    if (allReturned) doc.status = 'Fully Returned';
    else if (anyReturned) doc.status = 'Partially Returned';

    await doc.save();
    await recalculateItemStock(itemRow.itemId);

    return NextResponse.json({
      success: true,
      data: doc,
      message: `Successfully returned ${qtyToReturn} ${itemRow.unit} of "${itemRow.itemName}". Stock restored to ${doc.storeName}.`
    });
  } catch (error) {
    console.error('API /inventory/issue/[id]/return error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
