import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AssignSubject } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await AssignSubject.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('API /assign-subject/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await AssignSubject.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Subject assignment updated successfully.'
    });
  } catch (error) {
    console.error('API /assign-subject/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update record.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await AssignSubject.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subject assignment deleted successfully.',
      data: {}
    });
  } catch (error) {
    console.error('API /assign-subject/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete record.' }, { status: 500 });
  }
}
