import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostalDispatch } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const data = await PostalDispatch.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /postal-dispatch GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await PostalDispatch.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Postal dispatch recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /postal-dispatch POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
