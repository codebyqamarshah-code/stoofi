import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ClassRoutine } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const labId = searchParams.get('labId') || searchParams.get('labName');
    const day = searchParams.get('day');

    const filter = { isLab: true };
    if (labId && labId !== 'All') {
      filter.$or = [{ labId }, { labName: labId }, { room: labId }];
    }
    if (day && day !== 'All') {
      filter.day = day;
    }

    const items = await ClassRoutine.find(filter).sort({ day: 1, startTime: 1 }).lean();
    return NextResponse.json({ success: true, data: items || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const payload = { ...body, isLab: true };
    const created = await ClassRoutine.create(payload);
    return NextResponse.json({ success: true, data: created, message: 'Lab schedule slot created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
