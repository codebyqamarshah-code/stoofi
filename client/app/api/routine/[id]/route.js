import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ClassRoutine } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const routine = await ClassRoutine.findById(id).lean();
    if (!routine) return NextResponse.json({ success: false, message: 'Routine not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: routine });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await ClassRoutine.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Routine not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Routine updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { user, error } = await authenticateRequest(req, {
      requireCanDelete: true,
      allowedRoles: ['Super Admin', 'Admin']
    });
    if (error) return error;

    const { id } = await params;
    const deleted = await ClassRoutine.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Routine not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Routine deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
