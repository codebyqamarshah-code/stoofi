import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Designation } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updateData = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.departmentId !== undefined) updateData.departmentId = String(body.departmentId || '');
    if (body.department !== undefined) updateData.department = String(body.department || '').trim();
    if (body.description !== undefined) updateData.description = String(body.description || '').trim();

    const updated = await Designation.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Designation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Designation updated successfully'
    });
  } catch (error) {
    console.error('API /designation/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update designation' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Designation.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Designation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Designation deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('API /designation/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete designation' }, { status: 500 });
  }
}
