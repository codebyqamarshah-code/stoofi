import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ExamSchedule } from '@/lib/models';

// GET /api/exam-schedule?examId=...&classId=...&sectionId=...
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filter = {};
    if (searchParams.get('examId')) filter.examId = searchParams.get('examId');
    if (searchParams.get('classId')) filter.classId = searchParams.get('classId');
    if (searchParams.get('sectionId')) filter.sectionId = searchParams.get('sectionId');

    const schedules = await ExamSchedule.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    console.error('API /exam-schedule GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/exam-schedule
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { examId, classId, sectionId, scheduleItems } = body;

    if (!examId || !classId) {
      return NextResponse.json({ success: false, message: 'examId and classId are required.' }, { status: 400 });
    }

    const schedule = await ExamSchedule.create({ examId, classId, sectionId, scheduleItems });
    return NextResponse.json({ success: true, data: schedule }, { status: 201 });
  } catch (error) {
    console.error('API /exam-schedule POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
