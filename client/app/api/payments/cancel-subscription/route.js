import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const { user, error } = await authenticateRequest(req, {
      allowedRoles: ['Super Admin', 'Admin']
    });
    if (error) return error;

    await Subscription.findOneAndUpdate(
      { $or: [{ userId: user._id }, { adminEmail: user.email }] },
      { $set: { status: 'cancelled' } }
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription has been cancelled.'
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
