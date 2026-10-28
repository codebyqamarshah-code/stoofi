import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Staff, Teacher } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ success: false, message: 'Invalid staff ID' }, { status: 400 });
    }

    let staff = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      staff = await Staff.findById(id).lean();
    }
    if (!staff) {
      staff = await Staff.findOne({
        $or: [
          { staffNo: id },
          { email: id },
          { mobile: id },
          { phone: id }
        ]
      }).lean();
    }

    // Fallback: check Teacher collection if not found in Staff
    if (!staff && mongoose.Types.ObjectId.isValid(id)) {
      const teacher = await Teacher.findById(id).lean();
      if (teacher) {
        staff = {
          ...teacher,
          role: 'Teacher',
          designation: teacher.designation || 'Senior Faculty',
          department: teacher.department || (teacher.assignedClass ? `${teacher.assignedClass} Academic Dept` : 'Academics')
        };
      }
    }

    if (!staff) {
      return NextResponse.json({ success: false, message: 'Staff not found' }, { status: 404 });
    }

    const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.name || 'Staff Member';
    const photo = staff.staffPhoto || staff.photo || null;
    const phone = staff.mobile || staff.phone || staff.emergencyMobile || '';

    const normalized = {
      ...staff,
      name: fullName,
      phone,
      mobile: phone,
      photo,
      staffPhoto: photo,
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error('API /staff/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ success: false, message: 'Invalid staff ID' }, { status: 400 });
    }

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

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Staff.findByIdAndUpdate(id, body, { new: true });
    }
    if (!updated) {
      updated = await Staff.findOneAndUpdate({ staffNo: id }, body, { new: true });
    }

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Staff updated successfully'
    });
  } catch (error) {
    console.error('API /staff/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ success: false, message: 'Invalid staff ID' }, { status: 400 });
    }

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Staff.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Staff.findOneAndDelete({ staffNo: id });
    }

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Staff not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Staff removed successfully',
      data: {}
    });
  } catch (error) {
    console.error('API /staff/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
