import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LibrarySubject } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const subject = await LibrarySubject.findById(id).lean();
    if (!subject) {
      return NextResponse.json({ success: false, message: 'Library subject not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error fetching library subject' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await LibrarySubject.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Library subject not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Library subject updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error updating library subject' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await LibrarySubject.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Library subject not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Library subject deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error deleting library subject' }, { status: 500 });
  }
}
