import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { user, error } = await authenticateRequest(req);
    
    let query = {};
    if (user && user.role !== 'Super Admin') {
      query = { $or: [{ userId: user._id }, { adminEmail: user.email }] };
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      payments: payments || []
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
