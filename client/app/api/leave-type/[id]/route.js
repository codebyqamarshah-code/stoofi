import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LeaveType } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await LeaveType.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Leave type not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await LeaveType.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Leave type not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Leave type updated successfully' });
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
    const deleted = await LeaveType.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Leave type not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Leave type deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
