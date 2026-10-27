import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesType, FeesGroup } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const data = await FeesType.find().populate('feesGroup').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /fees/type GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch fee types' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, message: 'Fee type name is required' }, { status: 400 });
    }
    if (!body.feesGroup) {
      return NextResponse.json({ success: false, message: 'Fee group is required' }, { status: 400 });
    }
    const created = await FeesType.create({
      name: String(body.name).trim(),
      feesGroup: body.feesGroup,
      description: String(body.description || '').trim()
    });
    const populated = await FeesType.findById(created._id).populate('feesGroup').lean();
    return NextResponse.json({ success: true, data: populated || created, message: 'Fee type created successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /fees/type POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create fee type' }, { status: 500 });
  }
}
