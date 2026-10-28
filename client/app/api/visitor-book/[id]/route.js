import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Visitor } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await Visitor.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Visitor not found' }, { status: 404 });
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
    const updated = await Visitor.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Visitor not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Visitor updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Visitor.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Visitor not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Visitor updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Visitor.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Visitor not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {}, message: 'Visitor deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
