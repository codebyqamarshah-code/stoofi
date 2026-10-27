import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BankPayment } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const cls = searchParams.get('class');
    const section = searchParams.get('section');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    const query = {};
    if (cls) query.className = cls;
    if (section) query.section = section;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }

    const data = await BankPayment.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /bank-payment GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch bank payments' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const created = await BankPayment.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Bank payment recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /bank-payment POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to record bank payment' }, { status: 500 });
  }
}
