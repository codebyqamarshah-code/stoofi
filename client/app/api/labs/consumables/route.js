import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LabConsumable } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const lab = searchParams.get('lab');
    const filter = {};
    if (lab && lab !== 'All') filter.lab = lab;
    const items = await LabConsumable.find(filter).sort({ createdAt: -1 }).lean();
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
      return NextResponse.json({ success: false, message: 'Consumable name is required.' }, { status: 400 });
    }
    const created = await LabConsumable.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Consumable added successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
