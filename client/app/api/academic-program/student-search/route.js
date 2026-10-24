import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, StudentEnrollment } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get('q') || searchParams.get('query') || '').trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const digitsOnly = q.replace(/\D/g, '');

    const orConditions = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { admissionNo: { $regex: q, $options: 'i' } },
      { rollNo: { $regex: q, $options: 'i' } },
      { studentCode: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];

    if (q.includes('-') || digitsOnly.length >= 5) {
      orConditions.push({ cnic: { $regex: q, $options: 'i' } });
      orConditions.push({ bForm: { $regex: q, $options: 'i' } });
    }
    if (digitsOnly.length >= 7) {
      orConditions.push({ phone: { $regex: digitsOnly, $options: 'i' } });
      orConditions.push({ whatsapp: { $regex: digitsOnly, $options: 'i' } });
    }

    const students = await Student.find({ $or: orConditions })
      .select('firstName lastName studentCode admissionNo rollNo cnic bForm phone email fatherName guardianName className section studentPhoto photo dob gender currentAddress permanentAddress city bloodGroup religion nationality')
      .limit(10)
      .lean();

    const studentIds = students.map(s => s._id);
    const enrollments = await StudentEnrollment.find({ studentId: { $in: studentIds } }).lean();

    const result = students.map(st => {
      const stEnrollments = enrollments.filter(e => String(e.studentId) === String(st._id));
      return {
        ...st,
        fullName: `${st.firstName || ''} ${st.lastName || ''}`.trim(),
        enrollments: stEnrollments
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
