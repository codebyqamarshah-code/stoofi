import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesInvoice } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await FeesInvoice.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Auto calculate balance if paid / waiver modified
    if (body.amount !== undefined || body.paid !== undefined) {
      const existing = await FeesInvoice.findById(id);
      if (existing) {
        const amt = body.amount !== undefined ? Number(body.amount) : existing.amount;
        const pd = body.paid !== undefined ? Number(body.paid) : existing.paid;
        const wf = body.waiver !== undefined ? Number(body.waiver) : existing.waiver;
        const fn = body.fine !== undefined ? Number(body.fine) : existing.fine;
        body.balance = Math.max(0, (amt + fn) - (pd + wf));
        if (body.balance <= 0) body.status = 'Paid';
        else if (pd > 0) body.status = 'Partial';
        else body.status = 'Unpaid';
      }
    }

    const updated = await FeesInvoice.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Invoice updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await FeesInvoice.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {}, message: 'Invoice deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
