import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemCategory } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const categories = await ItemCategory.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: categories || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: 'Category name is required.' }, { status: 400 });
    }
    const created = await ItemCategory.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Category created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
