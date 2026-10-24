import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Affiliation, ProgramOffering } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const aff = await Affiliation.findByIdAndUpdate(id, body, { new: true });
    if (!aff) return NextResponse.json({ success: false, message: 'Affiliation not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: aff });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const count = await ProgramOffering.countDocuments({ affiliationId: id });
    if (count > 0) {
      return NextResponse.json({ success: false, message: `Cannot delete: ${count} offerings use this affiliation.` }, { status: 400 });
    }
    await Affiliation.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Affiliation deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
