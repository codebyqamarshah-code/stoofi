import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BookCategory } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const categories = await BookCategory.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('API /book-category GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const name = body.name ? String(body.name).trim() : '';
    if (!name) {
      return NextResponse.json({ success: false, message: 'Category Name is required' }, { status: 400 });
    }

    const created = await BookCategory.create({
      name,
      description: body.description ? String(body.description).trim() : ''
    });

    return NextResponse.json({ success: true, data: created, message: 'Category created successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /book-category POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create category' }, { status: 500 });
  }
}
