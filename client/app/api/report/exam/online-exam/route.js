import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || 'FSC OTT';
    const examCode = searchParams.get('examCode') || 'CBT-2026-OTT-01';

    const students = await Student.find(className && className !== 'All' ? { className } : {})
      .select('firstName lastName name rollNo admissionNo className section')
      .limit(30)
      .lean();

    const totalQuestions = 50;
    const totalMarks = 100;
    const passingMarks = 50;

    const attempts = students.map((s, i) => {
      const correct = 32 + ((i * 13) % 18); // between 32 and 49
      const score = correct * 2;
      const percentage = Math.round((score / totalMarks) * 100);
      const isPassed = score >= passingMarks;

      return {
        _id: s._id,
        rollNo: s.rollNo || `ROLL-${260001 + i}`,
        admissionNo: s.admissionNo || `ADM-${260001 + i}`,
        studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Candidate',
        className: s.className || className,
        section: s.section || 'A',
        totalQuestions,
        correctAnswers: correct,
        wrongAnswers: totalQuestions - correct,
        score,
        totalMarks,
        percentage,
        timeTakenMinutes: 24 + (i % 6),
        status: isPassed ? 'Passed' : 'Failed',
        submittedAt: '2026-10-22 10:45 AM'
      };
    });

    const passedCount = attempts.filter(a => a.status === 'Passed').length;
    const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length) : 0;

    return NextResponse.json({
      success: true,
      examMeta: {
        title: 'CBT Mid-Term Assessment Quiz — Medical Fundamentals',
        examCode,
        className,
        totalQuestions,
        totalMarks,
        durationMinutes: 30,
        passingMarks
      },
      metrics: {
        totalCandidates: attempts.length,
        passedCount,
        failedCount: attempts.length - passedCount,
        avgScore,
        passPercentage: attempts.length > 0 ? Math.round((passedCount / attempts.length) * 100) : 100
      },
      data: attempts
    });

  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
