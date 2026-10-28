import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostalReceive } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await PostalReceive.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Postal receive not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await PostalReceive.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Postal receive not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Postal receive updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await PostalReceive.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Postal receive not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {}, message: 'Postal receive deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
