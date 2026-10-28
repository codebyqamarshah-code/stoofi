import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { StaffAttendance, Staff, Teacher } from '@/lib/models';

function parseDateRange(dateStr) {
  let d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end, dateObj: d };
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const { start, end } = parseDateRange(dateParam);

    // 1. Fetch real staff from database
    const [staffList, teacherList] = await Promise.all([
      Staff.find().sort({ createdAt: 1 }).lean(),
      Teacher.find().sort({ createdAt: 1 }).lean()
    ]);

    // Map all unique staff members
    const staffMap = new Map();

    (staffList || []).forEach(s => {
      const id = String(s._id || s.id);
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Staff Member';
      staffMap.set(id, {
        staffId: id,
        staffNo: s.staffNo || '',
        name: fullName,
        role: s.role || 'Staff',
        department: s.department || 'Administration',
        designation: s.designation || 'Staff',
        photo: s.staffPhoto || s.photo || s.avatar || null,
        status: 'Present',
        note: ''
      });
    });

    // Also include any teachers not already in staff
    (teacherList || []).forEach(t => {
      const id = String(t._id || t.id);
      if (!staffMap.has(id)) {
        const fullName = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || 'Teacher';
        staffMap.set(id, {
          staffId: id,
          staffNo: t.staffNo || t.employeeId || '',
          name: fullName,
          role: 'Teacher',
          department: t.department || 'Academics',
          designation: t.designation || 'Teacher',
          photo: t.photo || t.avatar || null,
          status: 'Present',
          note: ''
        });
      }
    });

    const allRegisteredStaff = Array.from(staffMap.values());

    // 2. Fetch existing attendance records for the date
    const attendanceRecords = await StaffAttendance.find({
      date: { $gte: start, $lte: end }
    }).lean();

    // Map existing attendance by staffId
    const attendanceMap = new Map();
    (attendanceRecords || []).forEach(rec => {
      attendanceMap.set(String(rec.staffId), rec);
    });

    // 3. Merge: if an attendance record exists, use its status & note/remarks
    const result = allRegisteredStaff.map(st => {
      const existing = attendanceMap.get(st.staffId);
      if (existing) {
        return {
          ...st,
          status: existing.status || 'Present',
          note: existing.note || existing.remarks || ''
        };
      }
      return st;
    });

    return NextResponse.json({
      success: true,
      data: result,
      totalStaff: result.length,
      hasSavedAttendance: attendanceRecords.length > 0
    });
  } catch (error) {
    console.error('API /staff-attendance GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch staff attendance' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { date, attendanceData } = body;

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return NextResponse.json({ success: false, message: 'No attendance data provided' }, { status: 400 });
    }

    const { start, end, dateObj } = parseDateRange(date);

    const ops = attendanceData.map(item => {
      const staffId = String(item.staffId || item.id || item._id);
      const status = item.status || 'Present';
      const note = item.note || item.remarks || '';
      const name = item.name || '';
      const department = item.department || '';
      const designation = item.designation || '';
      const staffNo = item.staffNo || '';

      return {
        updateOne: {
          filter: {
            staffId,
            date: { $gte: start, $lte: end }
          },
          update: {
            $set: {
              staffId,
              staffNo,
              name,
              department,
              designation,
              date: dateObj,
              status,
              note,
              remarks: note
            }
          },
          upsert: true
        }
      };
    });

    await StaffAttendance.bulkWrite(ops);

    return NextResponse.json({
      success: true,
      message: 'Staff attendance recorded successfully!'
    });
  } catch (error) {
    console.error('API /staff-attendance POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to save staff attendance' }, { status: 500 });
  }
}
