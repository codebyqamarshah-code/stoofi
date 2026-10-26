import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Section } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await Section.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('API /section/[id] GET error:', error);
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
    if (body.capacity !== undefined) {
      updateData.capacity = parseInt(body.capacity, 10) || 40;
    }

    const updated = await Section.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Section updated successfully.'
    });
  } catch (error) {
    console.error('API /section/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update section.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Section.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully.',
      data: {}
    });
  } catch (error) {
    console.error('API /section/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete section.' }, { status: 500 });
  }
}
