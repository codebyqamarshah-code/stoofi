import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeePayment } from '@/lib/models';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { studentName, amount, paymentMethod, note } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, message: 'Valid amount is required' }, { status: 400 });
    }

    const fee = await FeePayment.create({
      studentName: studentName || 'Student',
      amount: Number(amount),
      netAmount: Number(amount),
      paymentMethod: paymentMethod || 'Cash',
      note: note || 'Monthly Tuition Fee'
    });

    return NextResponse.json({ success: true, data: fee }, { status: 201 });
  } catch (error) {
    console.error('API /dashboard/collect-fee error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error collecting fee' }, { status: 500 });
  }
}
