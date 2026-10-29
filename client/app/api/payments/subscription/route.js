import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { user, error } = await authenticateRequest(req);
    
    let sub = null;
    if (user) {
      sub = await Subscription.findOne({
        $or: [{ userId: user._id }, { adminEmail: user.email }]
      }).lean();
    }

    if (!sub) {
      // Default live active subscription for institution
      sub = {
        plan: 'Professional',
        status: 'active',
        studentQuota: 500,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };
    }

    return NextResponse.json({
      success: true,
      subscription: sub
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
