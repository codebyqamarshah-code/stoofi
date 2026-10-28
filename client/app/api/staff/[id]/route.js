import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const staff = await Staff.findById(id).lean();
    if (!staff) {
      return NextResponse.json({ success: false, message: 'Staff not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const contentType = req.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
          try {
            const bytes = await value.arrayBuffer();
            if (bytes.byteLength > 0) {
              const buffer = Buffer.from(bytes);
              const mime = value.type || 'image/jpeg';
              const base64 = buffer.toString('base64');
              const dataUrl = `data:${mime};base64,${base64}`;
              body[key] = dataUrl;
              if (key === 'photo') body.staffPhoto = dataUrl;
            }
          } catch (_) {}
        } else if (value !== undefined && value !== null && value !== '') {
          body[key] = value;
        }
      }
    } else {
      body = await req.json();
    }

    if (body.photo && !body.staffPhoto) body.staffPhoto = body.photo;
    if (body.staffPhoto && !body.photo) body.photo = body.staffPhoto;

    const updated = await Staff.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Staff updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Staff not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Staff removed successfully',
      data: {}
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
