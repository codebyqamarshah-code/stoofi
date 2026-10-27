import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesGroup, FeesType, FeesInvoice } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const [groups, types, recentInvoices] = await Promise.all([
      FeesGroup.find().sort({ createdAt: -1 }).lean(),
      FeesType.find().populate('feesGroup').sort({ createdAt: -1 }).lean(),
      FeesInvoice.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        groups,
        types,
        recentInvoices
      }
    });
  } catch (error) {
    console.error('API /fees GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch fees overview' }, { status: 500 });
  }
}
