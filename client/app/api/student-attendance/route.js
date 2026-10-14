import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Attendance, Student } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('class');
    const section = searchParams.get('section');
    const studentId = searchParams.get('studentId');
    const dateParam = searchParams.get('date');

    // 1. If searching for student's own attendance history
    if (studentId) {
      const records = await Attendance.find({
        $or: [
          { recordId: studentId },
          { name: studentId }
        ]
      }).sort({ date: -1 }).lean();

      return NextResponse.json({
        success: true,
        data: records
      });
    }

    // 2. If searching for class attendance
    if (className) {
      const cleanClass = className.replace(/^Class\s*/i, '').trim();
      const studentQuery = {
        className: { $regex: new RegExp(`^(Class\\s*)?${cleanClass}$`, 'i') }
      };

      if (section && section !== 'All' && section !== 'All Sections') {
        const cleanSec = section.replace(/^Section\s*/i, '').trim();
        studentQuery.section = { $regex: new RegExp(`^(Section\\s*)?${cleanSec}$`, 'i') };
      }

      const students = await Student.find(studentQuery).lean();

      const targetDate = dateParam ? new Date(dateParam) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const attendanceRecords = await Attendance.find({
        date: { $gte: startOfDay, $lte: endOfDay }
      }).lean();

      const attendanceMap = {};
      attendanceRecords.forEach(att => {
        if (att.recordId) attendanceMap[att.recordId.toString()] = att;
        if (att.name) attendanceMap[att.name.toLowerCase()] = att;
      });

      const data = students.map(st => {
        const att = attendanceMap[st._id.toString()] || attendanceMap[`${st.firstName} ${st.lastName}`.trim().toLowerCase()] || null;
        return {
          studentId: st._id,
          studentName: `${st.firstName} ${st.lastName || ''}`.trim(),
          rollNo: st.rollNo || '',
          admissionNo: st.admissionNo || '',
          className: st.className,
          section: st.section,
          status: att ? att.status : 'Present',
          note: att ? att.note || '' : '',
          attendanceId: att ? att._id : null
        };
      });

      return NextResponse.json({
        success: true,
        data
      });
    }

    // Default: return recent attendance records
    const recent = await Attendance.find().sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({
      success: true,
      data: recent
    });
  } catch (error) {
    console.error('API /student-attendance GET error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { attendance, date, className, section } = body;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (Array.isArray(attendance)) {
      for (const item of attendance) {
        const studentId = item.studentId || item._id;
        const studentName = item.studentName || item.name || '';
        const status = item.status || 'Present';

        if (studentId) {
          await Attendance.findOneAndUpdate(
            {
              recordId: studentId,
              date: { $gte: startOfDay, $lte: endOfDay }
            },
            {
              recordId: studentId,
              name: studentName,
              userType: 'Student',
              date: targetDate,
              status
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Student attendance saved successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('API /student-attendance POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error saving attendance' }, { status: 500 });
  }
}
