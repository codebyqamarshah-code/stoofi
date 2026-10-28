import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Complaint } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const data = await Complaint.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /complaint GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const count = await Complaint.countDocuments();
    const complaintId = body.complaintId || `CMP-${new Date().getFullYear()}-${1001 + count}`;
    const created = await Complaint.create({
      ...body,
      complaintId
    });
    return NextResponse.json({ success: true, data: created, message: 'Complaint registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /complaint POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
