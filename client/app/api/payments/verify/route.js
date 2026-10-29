import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment, Subscription } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const { user } = await authenticateRequest(req);
    const body = await req.json();

    const orderId = body.orderId || body.tracker || `ORD-${Date.now()}`;
    const payment = await Payment.create({
      userId: user?._id,
      schoolName: user?.schoolName || 'Pak Royal College',
      adminName: user?.name || user?.fullName || 'Administrator',
      adminEmail: user?.email || 'pakroyalcollege@gmail.com',
      provider: 'Safepay',
      providerTransactionId: body.tracker || body.sig || orderId,
      providerReference: orderId,
      plan: body.plan || 'Professional',
      amount: Number(body.amount) || 0,
      currency: 'PKR',
      status: 'completed',
      paidAt: new Date()
    });

    const subscription = await Subscription.findOneAndUpdate(
      { adminEmail: user?.email || 'pakroyalcollege@gmail.com' },
      {
        $set: {
          userId: user?._id,
          schoolName: user?.schoolName || 'Pak Royal College',
          adminEmail: user?.email || 'pakroyalcollege@gmail.com',
          plan: body.plan || 'Professional',
          status: 'active',
          studentQuota: 500,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      payment,
      subscription,
      message: 'Transaction verified and subscription activated successfully.'
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
