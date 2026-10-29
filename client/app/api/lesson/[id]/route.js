import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lesson } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const lesson = await Lesson.findById(id).lean();
    if (!lesson) return NextResponse.json({ success: false, message: 'Lesson not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: lesson });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Lesson.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Lesson not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Lesson updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { user, error } = await authenticateRequest(req, {
      requireCanDelete: true,
      allowedRoles: ['Super Admin', 'Admin', 'Teacher']
    });
    if (error) return error;

    const { id } = await params;
    const deleted = await Lesson.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Lesson not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
