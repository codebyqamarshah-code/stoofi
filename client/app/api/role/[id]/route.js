import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Role } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const role = await Role.findById(id).lean();
    if (!role) return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: role });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Role.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Role updated successfully' });
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
    const role = await Role.findById(id);
    if (!role) return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    if (role.type === 'System' || role.name === 'Super Admin' || role.name === 'Admin') {
      return NextResponse.json({ success: false, message: 'Core system roles cannot be deleted' }, { status: 400 });
    }
    await Role.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
