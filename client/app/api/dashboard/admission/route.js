import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { firstName, lastName, gender, dateOfBirth, contactNumber, email, className, section, academicYear } = body;

    if (!firstName) {
      return NextResponse.json({ success: false, message: 'First name is required' }, { status: 400 });
    }

    const count = await Student.countDocuments();
    const admissionNo = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const student = await Student.create({
      academicYear: academicYear || '2026',
      className: className || 'FSC OTT',
      section: section || 'A',
      admissionNo,
      rollNo: String(100 + count + 1),
      firstName,
      lastName: lastName || '',
      gender: gender || 'Male',
      dob: dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : '2012-01-01',
      phone: contactNumber || '',
      currentAddress: email ? `Email: ${email}` : '',
      status: 'Active'
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    console.error('API /dashboard/admission error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error processing admission' }, { status: 500 });
  }
}
