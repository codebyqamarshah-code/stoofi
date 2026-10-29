import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ClassRoutine } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || searchParams.get('class');
    const sectionName = searchParams.get('sectionName') || searchParams.get('section');
    const day = searchParams.get('day');

    const filter = {};
    if (className && className !== 'All Classes' && className !== 'All') {
      filter.className = { $regex: className.replace(/^Class\s+/i, '').trim(), $options: 'i' };
    }
    if (sectionName && sectionName !== 'All Sections' && sectionName !== 'All') {
      filter.sectionName = { $regex: sectionName.replace(/^Section\s+/i, '').trim(), $options: 'i' };
    }
    if (day && day !== 'All') {
      filter.day = day;
    }

    const routines = await ClassRoutine.find(filter).sort({ day: 1, startTime: 1 }).lean();
    return NextResponse.json({
      success: true,
      data: routines || []
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.className || !body.sectionName || !body.subject || !body.day || !body.startTime || !body.endTime) {
      return NextResponse.json({ success: false, message: 'Class, Section, Subject, Day, and Times are required.' }, { status: 400 });
    }

    const created = await ClassRoutine.create(body);
    return NextResponse.json({
      success: true,
      data: created,
      message: 'Class routine created successfully'
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
