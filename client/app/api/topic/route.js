import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Topic } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('class');
    const subject = searchParams.get('subject');
    const lesson = searchParams.get('lesson');

    const filter = {};
    if (className) filter.class = { $regex: className.trim(), $options: 'i' };
    if (subject) filter.subject = { $regex: subject.trim(), $options: 'i' };
    if (lesson) filter.lesson = { $regex: lesson.trim(), $options: 'i' };

    const topics = await Topic.find(filter).sort({ createdAt: -1 }).lean();
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
