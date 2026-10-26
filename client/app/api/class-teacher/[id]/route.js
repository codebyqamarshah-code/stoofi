import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ClassTeacher } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await ClassTeacher.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('API /class-teacher/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await ClassTeacher.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Class Teacher assignment updated successfully.'
    });
  } catch (error) {
    console.error('API /class-teacher/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update record.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await ClassTeacher.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Class Teacher assignment deleted successfully.',
      data: {}
    });
  } catch (error) {
    console.error('API /class-teacher/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete record.' }, { status: 500 });
  }
}
