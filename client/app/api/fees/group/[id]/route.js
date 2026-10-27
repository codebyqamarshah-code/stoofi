import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesGroup } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updateData = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = String(body.description || '').trim();

    const updated = await FeesGroup.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Fee group not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Fee group updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await FeesGroup.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Fee group not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Fee group deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
