import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { IssueBook, Book } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const issue = await IssueBook.findById(id).lean();
    if (!issue) {
      return NextResponse.json({ success: false, message: 'Issue record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error fetching issue record' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const existing = await IssueBook.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Issue record not found' }, { status: 404 });
    }

    // If status changing to returned, increment book stock back
    if (body.status === 'returned' && existing.status !== 'returned') {
      try {
        await Book.findByIdAndUpdate(existing.bookId, { $inc: { quantity: 1 } });
      } catch (_) {}
    }

    const updated = await IssueBook.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: updated, message: 'Issue record updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error updating issue record' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await IssueBook.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Issue record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Issue record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error deleting issue record' }, { status: 500 });
  }
}
