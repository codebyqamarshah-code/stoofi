import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LabMaintenance } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    let item = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await LabMaintenance.findById(id).lean();
    }
    if (!item) {
      item = await LabMaintenance.findOne({ $or: [{ id }, { requestId: id }] }).lean();
    }
    if (!item) return NextResponse.json({ success: false, message: 'Maintenance record not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await LabMaintenance.findByIdAndUpdate(id, body, { new: true });
    }
    if (!updated) {
      updated = await LabMaintenance.findOneAndUpdate(
        { $or: [{ id }, { requestId: id }] },
        body,
        { new: true }
      );
    }

    if (!updated) {
      // If not found, create new record
      updated = await LabMaintenance.create({
        ...body,
        id: body.id || id,
        requestId: body.requestId || body.id || id
      });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Maintenance record updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { user, error } = await authenticateRequest(req, {
      requireCanDelete: true,
      allowedRoles: ['Super Admin', 'Admin']
    });
    if (error) return error;

    const { id } = await params;
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await LabMaintenance.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await LabMaintenance.findOneAndDelete({ $or: [{ id }, { requestId: id }] });
    }
    return NextResponse.json({ success: true, message: 'Maintenance record deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
