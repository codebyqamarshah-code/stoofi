import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notice } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { title, description, audience, date, published } = body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return NextResponse.json({ success: false, message: 'Notice not found' }, { status: 404 });
    }

    if (title !== undefined) notice.title = title;
    if (description !== undefined) notice.description = description;
    if (audience !== undefined) notice.audience = audience;
    if (date) notice.date = new Date(date);
    if (published !== undefined) notice.published = published;

    await notice.save();
    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error('API /dashboard/notices/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error updating notice' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return NextResponse.json({ success: false, message: 'Notice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('API /dashboard/notices/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error deleting notice' }, { status: 500 });
  }
}
