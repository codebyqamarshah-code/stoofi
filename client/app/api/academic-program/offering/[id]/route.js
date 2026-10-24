import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProgramOffering, Batch, StudentEnrollment } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const offering = await ProgramOffering.findById(id)
      .populate('programId')
      .populate('categoryId')
      .populate('campusId')
      .populate('affiliationId')
      .populate('sessionId')
      .lean();

    if (!offering) return NextResponse.json({ success: false, message: 'Offering not found.' }, { status: 404 });

    const batches = await Batch.find({ offeringId: offering._id, status: 'Active' }).lean();

    return NextResponse.json({ success: true, data: { ...offering, batches } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const offering = await ProgramOffering.findByIdAndUpdate(id, body, { new: true });
    if (!offering) return NextResponse.json({ success: false, message: 'Offering not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: offering });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const enrolled = await StudentEnrollment.countDocuments({ offeringId: id });
    if (enrolled > 0) {
      return NextResponse.json({ success: false, message: `Cannot delete offering: ${enrolled} students are already enrolled.` }, { status: 400 });
    }
    await ProgramOffering.findByIdAndDelete(id);
    await Batch.deleteMany({ offeringId: id });
    return NextResponse.json({ success: true, message: 'Offering deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
