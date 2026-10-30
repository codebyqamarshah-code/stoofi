import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { IssueBook, Book } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const issues = await IssueBook.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: issues });
  } catch (error) {
    console.error('API /issue-book GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch issued books' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.bookId || !body.memberId) {
      return NextResponse.json({ success: false, message: 'Both Book and Member are required' }, { status: 400 });
    }

    const created = await IssueBook.create({
      bookId: body.bookId,
      memberId: body.memberId,
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: body.status || 'issued',
      fine: Number(body.fine) || 0,
      note: body.note || ''
    });

    // Optionally decrement book quantity if > 0
    try {
      await Book.findByIdAndUpdate(body.bookId, { $inc: { quantity: -1 } });
    } catch (_) {}

    return NextResponse.json({ success: true, data: created, message: 'Book issued successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /issue-book POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to issue book' }, { status: 500 });
  }
}
