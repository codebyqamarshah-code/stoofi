import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LabEquipment } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const lab = searchParams.get('lab');
    const filter = {};
    if (lab && lab !== 'All') filter.lab = lab;
    const items = await LabEquipment.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: items || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: 'Equipment name is required.' }, { status: 400 });
    }
    const created = await LabEquipment.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Equipment added successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
