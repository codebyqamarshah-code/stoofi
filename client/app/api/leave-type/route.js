import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LeaveType } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const types = await LeaveType.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: types || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: 'Leave type name is required' }, { status: 400 });
    }
    const created = await LeaveType.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Leave type created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
