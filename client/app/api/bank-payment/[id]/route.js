import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BankPayment } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await BankPayment.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Bank payment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Bank payment updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await BankPayment.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Bank payment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Bank payment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
