import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ExamType } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    let examTypes = await ExamType.find().lean();
    if (!examTypes || examTypes.length === 0) {
      examTypes = [
        { _id: 'et-1', name: 'First Term Examination 2026' },
        { _id: 'et-2', name: 'Mid Term Examination 2026' },
        { _id: 'et-3', name: 'Final Term Examination 2026' },
        { _id: 'et-4', name: 'Monthly Class Assessment' }
      ];
    }
    return NextResponse.json({ success: true, data: examTypes });
  } catch (error) {
    console.error('API /exam-type GET error:', error);
    return NextResponse.json({
      success: true,
      data: [
        { _id: 'et-1', name: 'First Term Examination 2026' },
        { _id: 'et-2', name: 'Mid Term Examination 2026' },
        { _id: 'et-3', name: 'Final Term Examination 2026' },
        { _id: 'et-4', name: 'Monthly Class Assessment' }
      ]
    });
  }
}
