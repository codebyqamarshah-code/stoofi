import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LeaveDefine } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const defines = await LeaveDefine.find().sort({ role: 1, leaveType: 1 }).lean();
    return NextResponse.json({ success: true, data: defines || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.role || !body.leaveType) {
      return NextResponse.json({ success: false, message: 'Role and leave type are required' }, { status: 400 });
    }
    const created = await LeaveDefine.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Leave definition created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
