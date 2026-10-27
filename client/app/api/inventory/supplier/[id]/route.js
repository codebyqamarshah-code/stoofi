import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Supplier, ItemReceive } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const supplier = await Supplier.findById(id).lean();
    if (!supplier) return NextResponse.json({ success: false, message: 'Supplier not found.' }, { status: 404 });

    // Fetch recent receipts from this supplier
    const recentReceipts = await ItemReceive.find({ supplierId: supplier._id })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...supplier,
        recentReceipts
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const supplier = await Supplier.findById(id);
    if (!supplier) return NextResponse.json({ success: false, message: 'Supplier not found.' }, { status: 404 });

    if (body.name || body.supplierName) {
      supplier.name = String(body.name || body.supplierName).trim();
      // Update supplierName in posted item receives
      await ItemReceive.updateMany({ supplierId: id }, { supplierName: supplier.name });
    }

    if (body.code !== undefined) supplier.code = String(body.code).trim().toUpperCase();
    if (body.contactPerson !== undefined) supplier.contactPerson = body.contactPerson;
    if (body.phone !== undefined) supplier.phone = body.phone;
    if (body.email !== undefined) supplier.email = body.email ? String(body.email).trim().toLowerCase() : '';
    if (body.address !== undefined) supplier.address = body.address;
    if (body.city !== undefined) supplier.city = body.city;
    if (body.companyName !== undefined) supplier.companyName = body.companyName;
    if (body.taxNumber !== undefined) supplier.taxNumber = body.taxNumber;
    if (body.paymentTerms !== undefined) supplier.paymentTerms = body.paymentTerms;
    if (body.notes !== undefined) supplier.notes = body.notes;
    if (body.status !== undefined) supplier.status = body.status;

    await supplier.save();

    return NextResponse.json({
      success: true,
      data: supplier,
      message: 'Supplier updated successfully.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Check if supplier has any receipt history
    const receiptCount = await ItemReceive.countDocuments({ supplierId: id });
    if (receiptCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete supplier: ${receiptCount} purchase receipts are recorded for this supplier. Please deactivate instead.`
      }, { status: 400 });
    }

    const deleted = await Supplier.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Supplier not found.' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Supplier deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
