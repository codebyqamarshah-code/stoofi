import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LabPractical } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await LabPractical.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Practical not found' }, { status: 404 });
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
    const updated = await LabPractical.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Practical not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Practical updated successfully' });
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
    const deleted = await LabPractical.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Practical not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Practical deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
