import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Class } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await Class.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Class not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('API /class/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updateData = {};
    if (body.name && String(body.name).trim()) {
      updateData.name = String(body.name).trim();
    }
    if (Array.isArray(body.sections)) {
      updateData.sections = body.sections.map(s => String(s).trim()).filter(Boolean);
    }

    const updated = await Class.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Class updated successfully.'
    });
  } catch (error) {
    console.error('API /class/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update class.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Class.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully.',
      data: {}
    });
  } catch (error) {
    console.error('API /class/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete class.' }, { status: 500 });
  }
}
