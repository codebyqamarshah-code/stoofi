import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TeacherEvaluation } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await TeacherEvaluation.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Evaluation not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await TeacherEvaluation.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Evaluation not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Evaluation updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  return PATCH(req, { params });
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await TeacherEvaluation.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Evaluation not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Evaluation deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
