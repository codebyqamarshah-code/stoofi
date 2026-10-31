import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Topic } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('class');
    const section = searchParams.get('section');
    const subject = searchParams.get('subject');
    const lesson = searchParams.get('lesson');

    const filter = {};
    if (className && className !== 'All Classes' && className !== 'All') {
      const cleanClass = className.replace(/^Class\s*/i, '').trim();
      filter.class = { $regex: cleanClass, $options: 'i' };
    }
    if (section && section !== 'All Sections' && section !== 'All') {
      const cleanSec = section.replace(/^Section\s*/i, '').trim();
      filter.section = { $regex: `^${cleanSec}$`, $options: 'i' };
    }
    if (subject && subject !== 'All Subjects' && subject !== 'All') {
      filter.subject = { $regex: subject.trim(), $options: 'i' };
    }
    if (lesson) {
      filter.lesson = { $regex: lesson.trim(), $options: 'i' };
    }

    const topics = await Topic.find(filter).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: topics || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.class || !body.subject || !body.lesson || !body.topic) {
      return NextResponse.json({ success: false, message: 'Class, Subject, Lesson, and Topic name are required.' }, { status: 400 });
    }
    const created = await Topic.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Topic created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
