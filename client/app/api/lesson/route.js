import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lesson } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('class');
    const subject = searchParams.get('subject');

    const filter = {};
    if (className && className !== 'All Classes' && className !== 'All') {
      const cleanClass = className.replace(/^Class\s*/i, '').trim();
      filter.class = { $regex: cleanClass, $options: 'i' };
    }
    if (subject && subject !== 'All Subjects' && subject !== 'All') {
      filter.subject = { $regex: subject.trim(), $options: 'i' };
    }

    const lessons = await Lesson.find(filter).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: lessons || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.class || !body.subject || !body.lesson) {
      return NextResponse.json({ success: false, message: 'Class, Subject, and Lesson name are required.' }, { status: 400 });
    }
    const created = await Lesson.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Lesson created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
