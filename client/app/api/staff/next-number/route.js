import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, Teacher } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const [staffList, teacherList] = await Promise.all([
      Staff.find({}, 'staffNo').lean().catch(() => []),
      Teacher.find({}, 'staffNo teacherId').lean().catch(() => [])
    ]);

    let maxNum = 0;
    const scanNum = (str) => {
      if (!str) return;
      const m = String(str).match(/PRCS(\d+)/i) || String(str).match(/(\d+)/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (num > maxNum) maxNum = num;
      }
    };

    (staffList || []).forEach(s => scanNum(s.staffNo));
    (teacherList || []).forEach(t => { scanNum(t.staffNo); scanNum(t.teacherId); });

    const nextStaffNo = `PRCS${String(maxNum + 1).padStart(4, '0')}`;

    return NextResponse.json({
      success: true,
      nextStaffNo,
      currentCount: (staffList || []).length,
      maxNum
    });
  } catch (error) {
    console.error('API /staff/next-number GET error:', error);
    return NextResponse.json({
      success: false,
      nextStaffNo: 'PRCS0001',
      message: error.message
    }, { status: 500 });
  }
}
