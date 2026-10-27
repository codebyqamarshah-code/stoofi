import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemSell } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await ItemSell.findById(id).lean();
    if (!doc) return NextResponse.json({ success: false, message: 'Sale invoice not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const doc = await ItemSell.findById(id);
    if (!doc) return NextResponse.json({ success: false, message: 'Sale invoice not found.' }, { status: 404 });

    if (doc.status === 'Posted') {
      return NextResponse.json({
        success: false,
        message: 'A posted sales invoice cannot be deleted. Please use the Reverse action to restore stock safely.'
      }, { status: 400 });
    }

    await ItemSell.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Draft sale invoice removed.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
