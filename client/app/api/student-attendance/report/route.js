import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, Attendance } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || searchParams.get('class') || '';
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const month = searchParams.get('month') || ''; // Optional e.g. "2026-11"

    // Build Student Filter
    const studentQuery = {};
    if (className && className !== 'All Classes' && className !== 'All') {
      const cleanClass = className.replace(/^Class\s*/i, '').trim();
      studentQuery.className = { $regex: new RegExp(`^(Class\\s*)?${cleanClass}$`, 'i') };
    }

    const students = await Student.find(studentQuery).select('-studentPhoto -photo').sort({ rollNumber: 1, admissionNo: 1 }).lean();

    // Date range if month specified, otherwise all-time / academic year
    let attendanceDateFilter = {};
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      attendanceDateFilter.date = { $gte: start, $lte: end };
    }

    const allAttendance = await Attendance.find({
      userType: 'Student',
      ...attendanceDateFilter
    }).lean();

    // Group attendance by student ID or Name
    const attMap = new Map();
    allAttendance.forEach(a => {
      const keyId = a.recordId ? String(a.recordId) : null;
      const keyName = a.name ? a.name.trim().toLowerCase() : null;

      const keysToUpdate = [keyId, keyName].filter(Boolean);
      keysToUpdate.forEach(k => {
        if (!attMap.has(k)) {
          attMap.set(k, { present: 0, absent: 0, late: 0, halfDay: 0, total: 0 });
        }
        const stats = attMap.get(k);
        stats.total += 1;
        const st = (a.status || 'Present').toLowerCase();
        if (st.includes('present')) stats.present += 1;
        else if (st.includes('absent')) stats.absent += 1;
        else if (st.includes('late')) stats.late += 1;
        else if (st.includes('half')) stats.halfDay += 1;
        else stats.present += 1;
      });
    });

    const reportList = students.map(st => {
      const idKey = String(st._id);
      const nameKey = `${st.firstName || ''} ${st.lastName || ''}`.trim().toLowerCase();
      const stats = attMap.get(idKey) || attMap.get(nameKey) || { present: 0, absent: 0, late: 0, halfDay: 0, total: 0 };

      const totalActive = stats.present + stats.absent + stats.late + stats.halfDay;
      const effectiveAtt = stats.present + (stats.late * 0.5) + (stats.halfDay * 0.5);
      const percentage = totalActive > 0 ? Math.round((effectiveAtt / totalActive) * 100) : 100;

      return {
        _id: st._id,
        admissionNo: st.admissionNo || st.rollNumber || 'N/A',
        name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.fullName || 'Student',
        className: st.className || 'General',
        section: st.section || 'A',
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        halfDay: stats.halfDay,
        totalDays: totalActive,
        percentage
      };
    });

    const filtered = search
      ? reportList.filter(r =>
          r.name.toLowerCase().includes(search) ||
          r.admissionNo.toLowerCase().includes(search) ||
          r.className.toLowerCase().includes(search) ||
          r.section.toLowerCase().includes(search)
        )
      : reportList;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('API /student-attendance/report error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch student attendance report' }, { status: 500 });
  }
}
