import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BookCategory } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const category = await BookCategory.findById(id).lean();
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error fetching category' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await BookCategory.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Category updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error updating category' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await BookCategory.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error deleting category' }, { status: 500 });
  }
}
