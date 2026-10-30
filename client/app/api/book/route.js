import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Book } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { bookNo: { $regex: search, $options: 'i' } },
        { isbnNo: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (categoryId && categoryId !== 'ALL') {
      query.categoryId = categoryId;
    }

    const books = await Book.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: books });
  } catch (error) {
    console.error('API /book GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.title || !String(body.title).trim()) {
      return NextResponse.json({ success: false, message: 'Book title is required' }, { status: 400 });
    }

    const created = await Book.create({
      ...body,
      title: String(body.title).trim(),
      quantity: Number(body.quantity) || 1,
      price: Number(body.price) || 0
    });

    return NextResponse.json({ success: true, data: created, message: 'Book created successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /book POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create book' }, { status: 500 });
  }
}
