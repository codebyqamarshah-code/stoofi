import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Homework } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || searchParams.get('class');
    const section = searchParams.get('section');
    const subject = searchParams.get('subject');

    const filter = {};
    if (className && className !== 'All Classes' && className !== 'All') {
      const cleanClass = className.replace(/^Class\s+/i, '').trim();
      filter.className = { $regex: cleanClass, $options: 'i' };
    }
    if (section && section !== 'All Sections' && section !== 'All') {
      const cleanSec = section.replace(/^Section\s+/i, '').trim();
      filter.section = { $in: [cleanSec, 'All', 'all'] };
    }
    if (subject && subject !== 'All Subjects' && subject !== 'All') {
      filter.subject = { $regex: subject.trim(), $options: 'i' };
    }

    const homeworks = await Homework.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: homeworks || []
    });
  } catch (err) {
    console.error('API /homework GET error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch homework' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    // Support JSON and multipart/form-data uploads
    let payload = {};
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      payload.className = form.get('className')?.toString() || '';
      payload.section = form.get('section')?.toString() || 'All';
      payload.subject = form.get('subject')?.toString() || '';
      payload.homeworkDate = form.get('homeworkDate')?.toString();
      payload.submissionDate = form.get('submissionDate')?.toString();
      payload.marks = form.get('marks')?.toString();
      payload.description = form.get('description')?.toString() || '';
      const file = form.get('file');
      if (file && typeof file !== 'string') {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const path = require('path');
        const fs = require('fs');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uniqueName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(filePath, buffer);
        payload.file = `/uploads/${uniqueName}`;
      } else {
        payload.file = '';
      }
    } else {
      payload = await req.json();
    }

    if (!payload.className || !payload.subject || !payload.description) {
      return NextResponse.json({ success: false, message: 'Class, Subject, and Description are required.' }, { status: 400 });
    }

    const created = await Homework.create({
      className: payload.className,
      section: payload.section || 'All',
      subject: payload.subject,
      homeworkDate: payload.homeworkDate ? new Date(payload.homeworkDate) : new Date(),
      submissionDate: payload.submissionDate ? new Date(payload.submissionDate) : null,
      marks: Number(payload.marks) || 0,
      file: payload.file || '',
      description: payload.description,
      completedBy: [],
      evaluations: []
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Homework assigned successfully'
    }, { status: 201 });
  } catch (err) {
    console.error('API /homework POST error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to assign homework' }, { status: 500 });
  }
}
