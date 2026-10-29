import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lab } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const lab = await Lab.findById(id).lean();
    if (!lab) return NextResponse.json({ success: false, message: 'Lab not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: lab });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Lab.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Lab not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Lab updated successfully' });
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
    const deleted = await Lab.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Lab not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Lab deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
