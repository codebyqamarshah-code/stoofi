import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostalReceive } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const data = await PostalReceive.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /postal-receive GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await PostalReceive.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Postal receive recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /postal-receive POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
