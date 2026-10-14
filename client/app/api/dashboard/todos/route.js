import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Todo } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const todos = await Todo.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: todos });
  } catch (error) {
    console.error('API /dashboard/todos GET error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const todo = await Todo.create({
      title,
      completed: false
    });

    return NextResponse.json({ success: true, data: todo }, { status: 201 });
  } catch (error) {
    console.error('API /dashboard/todos POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error creating todo' }, { status: 500 });
  }
}
