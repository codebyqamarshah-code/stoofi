import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesType } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await FeesType.findByIdAndUpdate(id, body, { new: true }).populate('feesGroup').lean();
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Fee type not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Fee type updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await FeesType.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Fee type not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Fee type deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
