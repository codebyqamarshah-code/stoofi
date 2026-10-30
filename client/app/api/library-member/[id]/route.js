import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LibraryMember } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const member = await LibraryMember.findById(id).lean();
    if (!member) {
      return NextResponse.json({ success: false, message: 'Library member not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error fetching library member' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await LibraryMember.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Library member not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Library member updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error updating library member' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await LibraryMember.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Library member not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Library member deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Error deleting library member' }, { status: 500 });
  }
}
