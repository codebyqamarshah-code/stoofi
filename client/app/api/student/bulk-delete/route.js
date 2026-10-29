import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export async function POST(req) {
  try {
    await connectDB();

    // Server-side authentication and deletion restriction guard
    const { user, error } = await authenticateRequest(req, {
      requireCanDelete: true,
      allowedRoles: ['Super Admin', 'Admin']
    });
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const rawIds = body?.ids || body?.studentIds || body;
    const ids = Array.isArray(rawIds) ? rawIds : [];
    if (!ids.length) {
      return NextResponse.json({ success: false, message: 'No student IDs provided for deletion.' }, { status: 400 });
    }

    const result = await Student.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} student(s).`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('API /student/bulk-delete POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
