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
    const staffId = searchParams.get('staffId');

    const filter = {};
    if (role && role !== 'All' && role !== 'all') {
      filter.role = new RegExp(`^${role.trim()}$`, 'i');
    }
    if (month && month !== 'All' && month !== 'all') {
      filter.month = month;
    }
    if (year && year !== 'All' && year !== 'all') {
      filter.year = String(year);
    }
    if (staffId) {
      filter.staffId = staffId;
    }

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
    
    // If staffId, month, and year are provided, upsert to avoid duplicate records
    let record;
    if (body.staffId && body.month && body.year) {
      record = await Payroll.findOneAndUpdate(
        { staffId: body.staffId, month: body.month, year: String(body.year) },
        { $set: body },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      record = await Payroll.create(body);
    }

    return NextResponse.json({
      success: true,
      data: record,
      message: 'Payroll record saved successfully'
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
