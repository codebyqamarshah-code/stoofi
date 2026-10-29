import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AssignedIncident } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { user, error } = await authenticateRequest(req, {
      requireCanDelete: true,
      allowedRoles: ['Super Admin', 'Admin', 'Teacher']
    });
    if (error) return error;

    const { id } = await params;
    const deleted = await AssignedIncident.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Assigned incident not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Assigned incident deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
