import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Homework } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const homework = await Homework.findById(id).lean();
    if (!homework) {
      return NextResponse.json({ success: false, message: 'Homework not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: homework });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await Homework.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Homework not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Homework updated successfully' });
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
    const deleted = await Homework.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Homework not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Homework deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
