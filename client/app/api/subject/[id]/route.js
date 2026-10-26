import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subject } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await Subject.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('API /subject/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updateData = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.code !== undefined) updateData.code = String(body.code).trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.author !== undefined) updateData.author = String(body.author).trim();
    if (body.className !== undefined) updateData.className = String(body.className).trim();
    if (body.section !== undefined) updateData.section = String(body.section).trim();
    if (body.isOptional !== undefined) updateData.isOptional = Boolean(body.isOptional);

    const updated = await Subject.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Subject updated successfully.'
    });
  } catch (error) {
    console.error('API /subject/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update subject.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Subject.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subject deleted successfully.',
      data: {}
    });
  } catch (error) {
    console.error('API /subject/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete subject.' }, { status: 500 });
  }
}
