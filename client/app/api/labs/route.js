import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lab } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const labs = await Lab.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: labs || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: 'Lab name is required.' }, { status: 400 });
    }
    const count = await Lab.countDocuments();
    const code = body.code || `LAB-${String(count + 1).padStart(3, '0')}`;
    const created = await Lab.create({ ...body, code });
    return NextResponse.json({ success: true, data: created, message: 'Lab created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
