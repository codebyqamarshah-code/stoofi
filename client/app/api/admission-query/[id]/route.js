import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdmissionQuery } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const query = await AdmissionQuery.findById(id).lean();
    if (!query) {
      return NextResponse.json({ success: false, message: 'Query not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: query });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updateData = { ...body };
    if (updateData.queryDate) updateData.queryDate = new Date(updateData.queryDate);
    if (updateData.lastFollowUpDate) updateData.lastFollowUpDate = new Date(updateData.lastFollowUpDate);
    if (updateData.nextFollowUpDate) updateData.nextFollowUpDate = new Date(updateData.nextFollowUpDate);

    const updated = await AdmissionQuery.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Query not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Admission query updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await AdmissionQuery.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Query not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admission query deleted successfully',
      data: {}
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
