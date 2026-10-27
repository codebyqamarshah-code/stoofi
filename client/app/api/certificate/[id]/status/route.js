import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Certificate } from '@/lib/models';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const cert = await Certificate.findById(id);
    if (!cert) {
      return NextResponse.json({ success: false, message: 'Certificate template not found' }, { status: 404 });
    }

    cert.status = cert.status === 'Active' ? 'Inactive' : 'Active';
    await cert.save();

    return NextResponse.json({
      success: true,
      data: cert,
      message: `Template status changed to ${cert.status}`
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
