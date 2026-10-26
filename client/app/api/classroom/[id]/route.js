import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ClassRoom } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await ClassRoom.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Classroom not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('API /classroom/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updateData = {};
    if (body.roomNo !== undefined) updateData.roomNo = String(body.roomNo).trim();
    if (body.capacity !== undefined) updateData.capacity = parseInt(body.capacity, 10) || 40;

    const updated = await ClassRoom.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Classroom not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Classroom updated successfully.'
    });
  } catch (error) {
    console.error('API /classroom/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update classroom.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await ClassRoom.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Classroom not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Classroom deleted successfully.',
      data: {}
    });
  } catch (error) {
    console.error('API /classroom/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete classroom.' }, { status: 500 });
  }
}
