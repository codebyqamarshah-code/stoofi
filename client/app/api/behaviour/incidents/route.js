import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BehaviourIncident } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const incidents = await BehaviourIncident.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: incidents || []
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.title || body.point === undefined) {
      return NextResponse.json({ success: false, message: 'Incident title and point value are required.' }, { status: 400 });
    }

    const cleanPoint = Math.abs(Number(body.point));
    const calculatedPoint = body.pointType === 'negative' ? -cleanPoint : cleanPoint;

    const created = await BehaviourIncident.create({
      title: body.title.trim(),
      point: calculatedPoint,
      pointType: body.pointType || (calculatedPoint < 0 ? 'negative' : 'positive'),
      description: body.description || '',
      status: body.status || 'active'
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Behaviour incident created successfully'
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
