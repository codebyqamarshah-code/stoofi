import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesGroup } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const data = await FeesGroup.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /fees/group GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch fee groups' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, message: 'Group name is required' }, { status: 400 });
    }
    const created = await FeesGroup.create({
      name: String(body.name).trim(),
      description: String(body.description || '').trim()
    });
    return NextResponse.json({ success: true, data: created, message: 'Fee group created successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /fees/group POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create fee group' }, { status: 500 });
  }
}
