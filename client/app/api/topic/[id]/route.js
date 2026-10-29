import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Topic } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const topic = await Topic.findById(id).lean();
    if (!topic) return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: topic });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Topic.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Topic updated successfully' });
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
    const deleted = await Topic.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Topic deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
