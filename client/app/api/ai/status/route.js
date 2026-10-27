import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting, Student, Teacher } from '@/lib/models';

/**
 * GET /api/ai/status
 * Health check & status for Stoofi AI Engine
 */
export async function GET() {
  try {
    await connectDB();
    const [setting, totalStudents, totalTeachers] = await Promise.all([
      Setting.findOne({}).lean().catch(() => null),
      Student.countDocuments().catch(() => 0),
      Teacher.countDocuments().catch(() => 0)
    ]);

    return NextResponse.json({
      success: true,
      status: 'online',
      version: '2.5.0',
      engine: 'Stoofi Live ERP Intelligence Engine',
      school: setting?.schoolName || 'Pak Royal College Sharaqpur',
      metrics: {
        totalStudents,
        totalTeachers
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      status: 'online',
      version: '2.5.0',
      fallback: true
    });
  }
}
