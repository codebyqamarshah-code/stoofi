import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { StudentEnrollment } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = {};
    const studentId = searchParams.get('studentId');
    const offeringId = searchParams.get('offeringId');
    const admissionYear = searchParams.get('admissionYear');
    const enrollmentStatus = searchParams.get('enrollmentStatus');
    const search = searchParams.get('search');

    if (studentId) query.studentId = studentId;
    if (offeringId) query.offeringId = offeringId;
    if (admissionYear) query.admissionYear = parseInt(admissionYear, 10);
    if (enrollmentStatus) query.enrollmentStatus = enrollmentStatus;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { studentName: { $regex: s, $options: 'i' } },
        { admissionNumber: { $regex: s, $options: 'i' } },
        { rollNumber: { $regex: s, $options: 'i' } },
        { programName: { $regex: s, $options: 'i' } }
      ];
    }

    const enrollments = await StudentEnrollment.find(query)
      .populate('studentId', 'firstName lastName cnic phone studentPhoto dob gender')
      .populate('offeringId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: enrollments });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
