import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/lib/models';

// Student Submission
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const studentName = String(body.studentName || '').trim();
    if (!studentName) {
      return NextResponse.json({ success: false, message: 'Student name is required.' }, { status: 400 });
    }

    const item = await Content.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Assignment not found.' }, { status: 404 });
    }

    const now = new Date();
    const isLate = item.dueDate && new Date(item.dueDate) < now;

    const newSubmission = {
      studentId: body.studentId || undefined,
      studentName,
      rollNo: body.rollNo || 'N/A',
      submittedAt: now,
      fileUrl: body.fileUrl || '',
      fileName: body.fileName || 'assignment_submission.pdf',
      fileSize: body.fileSize || '1.0 MB',
      remarks: body.remarks || '',
      status: isLate ? 'Late' : 'Submitted',
      totalMarks: item.totalMarks || 100,
      marksObtained: 0
    };

    item.submissions.push(newSubmission);
    await item.save();

    return NextResponse.json({
      success: true,
      data: item.submissions[item.submissions.length - 1],
      message: 'Assignment submitted successfully!'
    }, { status: 201 });
  } catch (error) {
    console.error('API /study-material/[id]/submit POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Teacher Grading
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { submissionId, marksObtained, teacherFeedback, status } = body;

    const item = await Content.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Assignment not found.' }, { status: 404 });
    }

    const sub = item.submissions.id(submissionId);
    if (!sub) {
      return NextResponse.json({ success: false, message: 'Submission record not found.' }, { status: 404 });
    }

    if (marksObtained !== undefined) sub.marksObtained = Number(marksObtained);
    if (teacherFeedback !== undefined) sub.teacherFeedback = teacherFeedback;
    if (status !== undefined) sub.status = status;
    else sub.status = 'Graded';
    sub.gradedAt = new Date();
    sub.gradedBy = body.gradedBy || 'Faculty Evaluator';

    await item.save();

    return NextResponse.json({
      success: true,
      data: sub,
      message: 'Submission graded successfully!'
    });
  } catch (error) {
    console.error('API /study-material/[id]/submit PATCH error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
