import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Leave } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('staffId');
    const status = searchParams.get('status');

    const filter = {};
    if (staffId) filter.staffId = staffId;
    if (status && status !== 'All') filter.status = status;

    const leaves = await Leave.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: leaves || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await Leave.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Leave request submitted successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
