import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Visitor } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const data = await Visitor.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /visitor-book GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const name = body.name || body.visitorName;
    if (!name || !String(name).trim()) {
      return NextResponse.json({ success: false, message: 'Visitor name is required' }, { status: 400 });
    }
    const created = await Visitor.create({
      ...body,
      name: String(name).trim(),
      visitorName: String(name).trim()
    });
    return NextResponse.json({ success: true, data: created, message: 'Visitor recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /visitor-book POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
