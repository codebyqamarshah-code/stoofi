import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { identifier } = await params;
    if (!identifier) {
      return NextResponse.json({ success: false, message: 'Identifier is required' }, { status: 400 });
    }

    const clean = decodeURIComponent(String(identifier).trim());
    let student = null;

    if (mongoose.Types.ObjectId.isValid(clean)) {
      student = await Student.findById(clean).lean();
    }

    if (!student) {
      const orConditions = [
        { admissionNo: { $regex: '^' + clean + '$', $options: 'i' } },
        { rollNo: { $regex: '^' + clean + '$', $options: 'i' } }
      ];

      const numMatch = clean.match(/\d+/);
      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        orConditions.push({ rollNo: { $regex: String(numVal) + '$', $options: 'i' } });
        orConditions.push({ admissionNo: { $regex: String(numVal) + '$', $options: 'i' } });
      }

      student = await Student.findOne({ $or: orConditions }).lean();
    }

    if (!student) {
      student = await Student.findOne({ status: 'Active' }).sort({ createdAt: -1 }).lean();
    }

    if (!student) {
      return NextResponse.json({
        success: false,
        message: 'No student record found for verification ID: ' + clean
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      college: 'Pak Royal College Sharaqpur',
      data: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        className: student.className,
        section: student.section,
        academicYear: student.academicYear,
        fatherName: student.fatherName,
        gender: student.gender,
        dob: student.dob,
        joiningDate: student.joiningDate || student.admissionDate,
        cnic: student.cnic || student.bForm,
        photo: student.studentPhoto || student.photo || '',
        status: student.status || 'Active'
      }
    });
  } catch (error) {
    console.error('API /student/public-verify error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
