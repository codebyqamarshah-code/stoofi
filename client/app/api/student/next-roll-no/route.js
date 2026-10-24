import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';
import { extractYear, previewNextRollNumber } from '@/lib/admissionSequence.service';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const year = extractYear(searchParams.get('year') || searchParams.get('admissionDate'));
    const nextRollNo = await previewNextRollNumber(year);

    const allStudents = await Student.find({}, 'rollNo firstName lastName admissionNo').lean();
    const usedRolls = [];
    allStudents.forEach(s => {
      if (s.rollNo) {
        const rStr = String(s.rollNo).trim();
        usedRolls.push({
          rollNo: rStr,
          studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
          admissionNo: s.admissionNo || ''
        });
      }
    });

    return NextResponse.json({
      success: true,
      nextRollNo,
      year,
      usedRollNumbers: usedRolls.map(u => u.rollNo),
      usedRolls
    });
  } catch (error) {
    const fallbackYear = new Date().getFullYear();
    return NextResponse.json({
      success: true,
      nextRollNo: `ROLL-${fallbackYear}-0001`,
      year: fallbackYear,
      usedRollNumbers: [],
      usedRolls: []
    });
  }
}
