import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemReceive, StockMovement } from '@/lib/models';
import { recalculateItemStock } from '@/lib/inventoryService';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await ItemReceive.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Receipt not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await ItemReceive.findById(id);
    if (!doc) return NextResponse.json({ success: false, message: 'Receipt not found.' }, { status: 404 });

    // If it was already posted, it must be reversed, not deleted
    if (doc.status === 'Posted') {
      return NextResponse.json({
        success: false,
        message: 'A posted Goods Received Note cannot be deleted. Please use the Reverse / Cancel action to reverse inventory movements safely.'
      }, { status: 400 });
    }

    await ItemReceive.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Draft receipt removed.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
