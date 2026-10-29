import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LabMaintenance } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const labName = searchParams.get('labName');
    const status = searchParams.get('status');
    const filter = {};
    if (labName && labName !== 'All') filter.labName = labName;
    if (status && status !== 'All') filter.status = status;
    const items = await LabMaintenance.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: items || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.labName) {
      return NextResponse.json({ success: false, message: 'Lab name is required.' }, { status: 400 });
    }
    const created = await LabMaintenance.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Maintenance record created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
