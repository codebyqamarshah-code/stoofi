import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ClassTeacher } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const list = await ClassTeacher.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: list || [] });
  } catch (error) {
    console.error('API /class-teacher GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const className = String(body.className || '').trim();
    const section = String(body.section || '').trim();
    const teacher = String(body.teacher || '').trim();

    if (!className || !section || !teacher) {
      return NextResponse.json({ success: false, message: 'Class, Section, and Teacher are required.' }, { status: 400 });
    }

    const created = await ClassTeacher.create({
      className,
      section,
      teacher,
      teacherId: body.teacherId || undefined
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Class Teacher assigned successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('API /class-teacher POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to assign class teacher.' }, { status: 500 });
  }
}
