import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BehaviourIncident } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await BehaviourIncident.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Incident not found' }, { status: 404 });
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

    if (body.point !== undefined) {
      const cleanPoint = Math.abs(Number(body.point));
      body.point = body.pointType === 'negative' ? -cleanPoint : cleanPoint;
    }

    const updated = await BehaviourIncident.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Incident not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Incident updated successfully' });
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
    const deleted = await BehaviourIncident.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Incident not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Incident deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
