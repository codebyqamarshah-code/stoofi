import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminSetup } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await AdminSetup.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }
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
    const { type, name, description, status } = body;

    const item = await AdminSetup.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }

    if (type && type.trim()) item.type = type.trim();
    if (name && name.trim()) item.name = name.trim();
    if (description !== undefined) item.description = (description || '').trim();
    if (status) item.status = status;

    const updated = await item.save();
    return NextResponse.json({ success: true, data: updated, message: 'Setup item updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await AdminSetup.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Setup item deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
