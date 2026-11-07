import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TeacherEvaluation } from '@/lib/models';

export const dynamic = 'force-dynamic';

const INITIAL_EVALUATIONS = [
  {
    teacherName: 'Mudassir Bajwa',
    subject: 'Physics',
    classSection: 'FSC OTT-A',
    evaluatedBy: 'Academic Coordinator',
    score: 82,
    date: '2026-10-10',
    approvedOn: '2026-10-12',
    status: 'Approved',
    comment: 'Excellent command of subject and classroom control.',
    criteria: [
      { name: 'Communication Skills', score: 9, max: 10 },
      { name: 'Subject Knowledge', score: 9, max: 10 },
      { name: 'Classroom Management', score: 8, max: 10 },
      { name: 'Punctuality & Attendance', score: 8, max: 10 },
      { name: 'Student Engagement', score: 7, max: 10 }
    ]
  },
  {
    teacherName: 'Fatima Zahra',
    subject: 'Mathematics',
    classSection: 'BS Psychology-A',
    evaluatedBy: 'Principal Office',
    score: 74,
    date: '2026-10-08',
    status: 'Pending',
    comment: 'Good classroom management, encouraged to pace lectures better.',
    criteria: [
      { name: 'Communication Skills', score: 8, max: 10 },
      { name: 'Subject Knowledge', score: 8, max: 10 },
      { name: 'Classroom Management', score: 7, max: 10 },
      { name: 'Punctuality & Attendance', score: 7, max: 10 },
      { name: 'Student Engagement', score: 7, max: 10 }
    ]
  },
  {
    teacherName: 'Dr. Bilal Siddiqui',
    subject: 'Chemistry',
    classSection: 'DPT-A',
    evaluatedBy: 'HOD Science',
    score: 91,
    date: '2026-10-05',
    status: 'Pending',
    comment: 'Outstanding student engagement and practical demonstrations.',
    criteria: [
      { name: 'Communication Skills', score: 10, max: 10 },
      { name: 'Subject Knowledge', score: 10, max: 10 },
      { name: 'Classroom Management', score: 9, max: 10 },
      { name: 'Punctuality & Attendance', score: 9, max: 10 },
      { name: 'Student Engagement', score: 9, max: 10 }
    ]
  },
  {
    teacherName: 'Ahmed Khan',
    subject: 'English Language',
    classSection: 'FSC NURSING-B',
    evaluatedBy: 'Vice Principal',
    score: 58,
    date: '2026-10-01',
    status: 'Pending',
    comment: 'Needs improvement in syllabus coverage and punctuality.',
    criteria: [
      { name: 'Communication Skills', score: 6, max: 10 },
      { name: 'Subject Knowledge', score: 6, max: 10 },
      { name: 'Classroom Management', score: 5, max: 10 },
      { name: 'Punctuality & Attendance', score: 6, max: 10 },
      { name: 'Student Engagement', score: 6, max: 10 }
    ]
  }
];

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const teacherName = searchParams.get('teacherName');
    const search = searchParams.get('search');

    // Seed initial records if empty
    const count = await TeacherEvaluation.countDocuments();
    if (count === 0) {
      await TeacherEvaluation.insertMany(INITIAL_EVALUATIONS);
    }

    const filter = {};
    if (status && status !== 'All') {
      filter.status = new RegExp(`^${status}$`, 'i');
    }
    if (teacherName && teacherName !== 'All') {
      filter.teacherName = teacherName;
    }
    if (search) {
      filter.$or = [
        { teacherName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { evaluatedBy: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await TeacherEvaluation.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: records });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await TeacherEvaluation.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Evaluation created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
