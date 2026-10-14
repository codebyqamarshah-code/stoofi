import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Notice } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const notices = await Notice.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: notices });
  } catch (error) {
    console.error('API /dashboard/notices GET error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, audience, date } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const notice = await Notice.create({
      title,
      description: description || '',
      audience: audience || 'All',
      date: date ? new Date(date) : new Date(),
      published: true
    });

    return NextResponse.json({ success: true, data: notice }, { status: 201 });
  } catch (error) {
    console.error('API /dashboard/notices POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error creating notice' }, { status: 500 });
  }
}
