import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Attendance } from '@/lib/models';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userType, count, status } = body;
    const today = new Date();
    const markCount = Number(count) || 1;

    for (let i = 0; i < markCount; i++) {
      await Attendance.create({
        date: today,
        userType: userType || 'Student',
        name: `${userType || 'Student'} Quick Attendee`,
        status: status || 'Present'
      });
    }

    return NextResponse.json({
      success: true,
      message: `${markCount} Attendance marked successfully`
    }, { status: 201 });
  } catch (error) {
    console.error('API /dashboard/attendance error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error marking attendance' }, { status: 500 });
  }
}
