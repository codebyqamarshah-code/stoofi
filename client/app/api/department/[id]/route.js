import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Department } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updateData = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = String(body.description || '').trim();

    const updated = await Department.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Department updated successfully'
    });
  } catch (error) {
    console.error('API /department/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Department.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('API /department/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete department' }, { status: 500 });
  }
}
