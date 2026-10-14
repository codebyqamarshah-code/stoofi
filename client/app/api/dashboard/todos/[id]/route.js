import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Todo } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const todo = await Todo.findById(id);
    if (!todo) {
      return NextResponse.json({ success: false, message: 'Todo not found' }, { status: 404 });
    }

    todo.completed = !todo.completed;
    await todo.save();

    return NextResponse.json({ success: true, data: todo });
  } catch (error) {
    console.error('API /dashboard/todos/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error updating todo' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) {
      return NextResponse.json({ success: false, message: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('API /dashboard/todos/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error deleting todo' }, { status: 500 });
  }
}
