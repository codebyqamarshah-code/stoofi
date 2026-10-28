import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PhoneCallLog } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const data = await PhoneCallLog.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /phone-call-log GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await PhoneCallLog.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Call log saved successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /phone-call-log POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
