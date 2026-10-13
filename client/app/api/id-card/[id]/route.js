import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { IDCard } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const card = await IDCard.findById(id).lean();

    if (!card) {
      return NextResponse.json({ success: false, message: 'Card template not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await IDCard.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Card template not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Template updated successfully!', data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    await IDCard.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Template deleted successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
