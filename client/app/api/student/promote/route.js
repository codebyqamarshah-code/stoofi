import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { promotions, promoteSession, promoteClass, promoteSection } = body;

    let updatedCount = 0;
    const updatedIds = [];

    if (Array.isArray(promotions) && promotions.length > 0) {
      for (const item of promotions) {
        if (!item.studentId) continue;
        const student = await Student.findById(item.studentId);
        if (student) {
          const updateFields = {
            previousClassCovered: student.className,
            className: item.promoteClass || promoteClass || student.className,
            section: item.promoteSection || promoteSection || student.section,
            academicYear: item.promoteSession || promoteSession || student.academicYear
          };
          if (item.rollNo) updateFields.rollNo = item.rollNo;
          await Student.findByIdAndUpdate(item.studentId, updateFields);
          updatedCount++;
          updatedIds.push(item.studentId);
        }
      }
    } else if (body.studentIds && Array.isArray(body.studentIds)) {
      for (const sId of body.studentIds) {
        const student = await Student.findById(sId);
        if (student) {
          const updateFields = {
            previousClassCovered: student.className,
            className: promoteClass || student.className,
            section: promoteSection || student.section,
            academicYear: promoteSession || student.academicYear
          };
          await Student.findByIdAndUpdate(sId, updateFields);
          updatedCount++;
          updatedIds.push(sId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully promoted ${updatedCount} student(s).`,
      count: updatedCount,
      updatedIds
    });
  } catch (error) {
    console.error('API /student/promote POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Promotion failed' }, { status: 500 });
  }
}
