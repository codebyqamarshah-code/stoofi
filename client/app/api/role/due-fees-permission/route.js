import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const setting = await Setting.findOne({ key: 'dueFeesPermissions' }).lean();
    return NextResponse.json({ success: true, data: setting?.value || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const permissions = body.permissions || [];
    await Setting.findOneAndUpdate(
      { key: 'dueFeesPermissions' },
      { key: 'dueFeesPermissions', value: permissions },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, message: 'Due fees permissions updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
