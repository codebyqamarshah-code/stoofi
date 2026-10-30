import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Book } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const book = await Book.findById(id).lean();
    if (!book) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error fetching book' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Book.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Book updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error updating book' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Book deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error deleting book' }, { status: 500 });
  }
}
