import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { StudentEnrollment } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { enrollmentStatus, applicationStatus, externalRegistrationStatus, externalRegistrationNumber, academicStage, reason } = body;

    const enrollment = await StudentEnrollment.findById(id);
    if (!enrollment) return NextResponse.json({ success: false, message: 'Enrollment not found.' }, { status: 404 });

    const prevStatus = enrollment.enrollmentStatus;

    if (enrollmentStatus) enrollment.enrollmentStatus = enrollmentStatus;
    if (applicationStatus) enrollment.applicationStatus = applicationStatus;
    if (externalRegistrationStatus) enrollment.externalRegistrationStatus = externalRegistrationStatus;
    if (externalRegistrationNumber) enrollment.externalRegistrationNumber = externalRegistrationNumber;
    if (academicStage) enrollment.academicStage = academicStage;

    enrollment.history.push({
      action: `Status updated to ${enrollmentStatus || applicationStatus}`,
      fromStatus: prevStatus,
      toStatus: enrollmentStatus || prevStatus,
      actor: 'Administrator',
      timestamp: new Date(),
      reason: reason || 'Administrative status change'
    });

    await enrollment.save();

    return NextResponse.json({ success: true, data: enrollment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
