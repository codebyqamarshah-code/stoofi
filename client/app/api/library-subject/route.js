import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LibrarySubject } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const subjects = await LibrarySubject.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    console.error('API /library-subject GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch library subjects' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, message: 'Subject name is required' }, { status: 400 });
    }

    const created = await LibrarySubject.create({
      name: String(body.name).trim(),
      category: body.category ? String(body.category).trim() : '',
      code: body.code ? String(body.code).trim() : '',
      subjectCode: body.subjectCode || body.code || ''
    });

    return NextResponse.json({ success: true, data: created, message: 'Library subject created successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /library-subject POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create library subject' }, { status: 500 });
  }
}
