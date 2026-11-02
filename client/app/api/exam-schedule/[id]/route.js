import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ExamSchedule } from '@/lib/models';

// DELETE /api/exam-schedule/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await ExamSchedule.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Schedule not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Schedule deleted.' });
  } catch (error) {
    console.error('API /exam-schedule/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
