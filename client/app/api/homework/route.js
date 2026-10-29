import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Homework } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || searchParams.get('class');
    const section = searchParams.get('section');
    const subject = searchParams.get('subject');

    const filter = {};
    if (className && className !== 'All Classes' && className !== 'All') {
      const cleanClass = className.replace(/^Class\s+/i, '').trim();
      filter.className = { $regex: cleanClass, $options: 'i' };
    }
    if (section && section !== 'All Sections' && section !== 'All') {
      const cleanSec = section.replace(/^Section\s+/i, '').trim();
      filter.section = { $in: [cleanSec, 'All', 'all'] };
    }
    if (subject && subject !== 'All Subjects' && subject !== 'All') {
      filter.subject = { $regex: subject.trim(), $options: 'i' };
    }

    const homeworks = await Homework.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: homeworks || []
    });
  } catch (err) {
    console.error('API /homework GET error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch homework' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.className || !body.subject || !body.description) {
      return NextResponse.json({ success: false, message: 'Class, Subject, and Description are required.' }, { status: 400 });
    }

    const created = await Homework.create({
      className: body.className,
      section: body.section || 'All',
      subject: body.subject,
      homeworkDate: body.homeworkDate ? new Date(body.homeworkDate) : new Date(),
      submissionDate: body.submissionDate ? new Date(body.submissionDate) : null,
      marks: Number(body.marks) || 0,
      file: body.file || '',
      description: body.description,
      completedBy: body.completedBy || [],
      evaluations: body.evaluations || []
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Homework assigned successfully'
    }, { status: 201 });
  } catch (err) {
    console.error('API /homework POST error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to assign homework' }, { status: 500 });
  }
}
