import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostalDispatch } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await PostalDispatch.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Postal dispatch not found' }, { status: 404 });
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
    const updated = await PostalDispatch.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Postal dispatch not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Postal dispatch updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await PostalDispatch.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Postal dispatch not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {}, message: 'Postal dispatch deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
