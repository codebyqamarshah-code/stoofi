import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AssignSubject } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || searchParams.get('class');
    const section = searchParams.get('section');

    const query = {};
    if (className && className !== 'All') query.className = className;
    if (section && section !== 'All') query.section = section;

    const list = await AssignSubject.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: list || [] });
  } catch (error) {
    console.error('API /assign-subject GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const className = String(body.className || '').trim();
    const section = String(body.section || '').trim();
    const subject = String(body.subject || '').trim();
    const teacher = String(body.teacher || '').trim();

    if (!className || !section || !subject || !teacher) {
      return NextResponse.json({ success: false, message: 'Class, Section, Subject, and Teacher are required.' }, { status: 400 });
    }

    const created = await AssignSubject.create({
      className,
      section,
      subject,
      teacher,
      type: body.type || 'Theory'
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Subject assigned to teacher successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('API /assign-subject POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to assign subject.' }, { status: 500 });
  }
}
