import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payroll } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const filter = {};
    if (role && role !== 'All') filter.role = role;
    if (month && month !== 'All') filter.month = month;
    if (year && year !== 'All') filter.year = year;

    const payrolls = await Payroll.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: payrolls || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await Payroll.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Payroll record created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
