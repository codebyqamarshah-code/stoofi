import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Homework } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { user, error } = await authenticateRequest(req);
    if (error) return error;

    const { id } = await params;
    const homework = await Homework.findById(id);
    if (!homework) {
      return NextResponse.json({ success: false, message: 'Homework not found' }, { status: 404 });
    }

    // Add user._id to completedBy if not already present
    if (!homework.completedBy.some(cId => String(cId) === String(user._id))) {
      homework.completedBy.push(user._id);
    }

    // Add evaluation entry if not present
    if (!homework.evaluations.some(ev => String(ev.studentId) === String(user._id))) {
      homework.evaluations.push({
        studentId: String(user._id),
        studentName: user.name || user.fullName || user.username || 'Student',
        admissionNo: user.admissionNo || '',
        rollNo: user.rollNo || '',
        status: 'Submitted',
        marksObtained: 0,
        evaluatedAt: new Date()
      });
    }

    await homework.save();

    return NextResponse.json({
      success: true,
      message: 'Homework marked as completed successfully',
      data: homework
    });
  } catch (err) {
    console.error('Homework submit error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error submitting homework' }, { status: 500 });
  }
}
