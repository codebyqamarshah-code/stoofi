import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Visitor } from '@/lib/models';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Visitor.findByIdAndUpdate(id, { outTime: body.outTime || new Date().toLocaleTimeString() }, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Visitor not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Visitor checked out successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
