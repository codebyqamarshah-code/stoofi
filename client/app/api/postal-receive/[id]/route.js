import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostalReceive } from '@/lib/models';
import { parseRequestBody } from '@/lib/parseRequestBody';

export const dynamic = 'force-dynamic';

function stripFile(doc) {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const { file, ...rest } = obj;
  return { ...rest, hasFile: Boolean(file) };
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await PostalReceive.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Postal receive not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await parseRequestBody(req);
    delete body._id;
    delete body.receiveId; // ID is immutable
    if (!body.file) delete body.file; // keep existing attachment when none re-uploaded
    const updated = await PostalReceive.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Postal receive not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: stripFile(updated), message: 'Postal receive updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await PostalReceive.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Postal receive not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {}, message: 'Postal receive deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
