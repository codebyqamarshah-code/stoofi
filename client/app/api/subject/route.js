import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subject } from '@/lib/models';

const DEFAULT_SUBJECTS = [
  { name: 'English Compulsory', code: 'ENG-101', type: 'Theory', category: 'Compulsory' },
  { name: 'Urdu Language & Literature', code: 'URD-102', type: 'Theory', category: 'Compulsory' },
  { name: 'Mathematics', code: 'MTH-103', type: 'Theory', category: 'Compulsory' },
  { name: 'General Science', code: 'SCI-104', type: 'Both', category: 'Compulsory' },
  { name: 'Islamiyat / Ethics', code: 'ISL-105', type: 'Theory', category: 'Compulsory' },
  { name: 'Computer Science', code: 'CS-106', type: 'Both', category: 'Optional', isOptional: true },
  { name: 'Pakistan Studies', code: 'PST-107', type: 'Theory', category: 'Compulsory' }
];

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || searchParams.get('class');

    const query = {};
    if (className && className !== 'All') {
      const c = className.replace(/^Class\s*/i, '').trim();
      query.$or = [
        { className: { $regex: new RegExp(`^(Class\\s*)?${c}$`, 'i') } },
        { className: '' },
        { className: null }
      ];
    }

    let subjects = await Subject.find(query).lean();
    if (!subjects || subjects.length === 0) {
      const seeded = [];
      for (const s of DEFAULT_SUBJECTS) {
        const item = await Subject.create(s);
        seeded.push(item);
      }
      return NextResponse.json({ success: true, data: seeded });
    }

    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    console.error('API /subject GET error:', error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_SUBJECTS
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, message: 'Subject name is required.' }, { status: 400 });
    }

    const newSubject = await Subject.create({
      name,
      code: String(body.code || '').trim(),
      type: body.type || 'Theory',
      category: body.category || (body.isOptional ? 'Optional' : 'Compulsory'),
      author: String(body.author || '').trim(),
      className: String(body.className || '').trim(),
      section: String(body.section || '').trim(),
      isOptional: Boolean(body.isOptional || body.category === 'Optional')
    });

    return NextResponse.json({
      success: true,
      data: newSubject,
      message: 'Subject created successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('API /subject POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create subject.' }, { status: 500 });
  }
}
