import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Expense } from '@/lib/models';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, amount, category, paymentMethod, description } = body;

    if (!title || !amount) {
      return NextResponse.json({ success: false, message: 'Title and amount are required' }, { status: 400 });
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category: category || 'Utilities',
      paymentMethod: paymentMethod || 'Cash',
      description: description || ''
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error('API /dashboard/expense error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error adding expense' }, { status: 500 });
  }
}
