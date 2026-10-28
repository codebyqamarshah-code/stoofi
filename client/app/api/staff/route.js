import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, Teacher } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || '';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const staffNo = searchParams.get('staffNo') || '';

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { staffNo: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }
    if (staffNo) {
      query.staffNo = { $regex: staffNo.trim(), $options: 'i' };
    }
    if (role && role !== 'All' && role !== 'all') {
      query.role = { $regex: new RegExp(`^${role.trim()}$`, 'i') };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Staff.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Staff.countDocuments(query)
    ]);

    // If query returned 0 staff and role === 'Teacher', fallback check Teacher model
    let result = data;
    if (result.length === 0 && (role === 'Teacher' || !role || role === 'All')) {
      const teacherQuery = {};
      if (search) {
        teacherQuery.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      const teachers = await Teacher.find(teacherQuery).limit(limit).lean();
      if (teachers.length > 0) {
        result = teachers.map(t => ({
          ...t,
          role: 'Teacher',
          designation: t.designation || 'Senior Faculty',
          department: t.department || (t.assignedClass ? `${t.assignedClass} Academic Dept` : 'Academics')
        }));
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        total: Math.max(total, result.length),
        page,
        limit,
        totalPages: Math.ceil(Math.max(total, result.length) / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /staff GET error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch staff'
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
          // File object uploaded
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

    if (!body.firstName || !String(body.firstName).trim()) {
      return NextResponse.json({ success: false, message: 'First name is required' }, { status: 400 });
    }

    body.firstName = String(body.firstName).trim();
    if (body.lastName) body.lastName = String(body.lastName).trim();
    if (!body.role) body.role = 'Teacher';

    // Auto-generate staffNo if not provided
    if (!body.staffNo || !String(body.staffNo).trim()) {
      const count = await Staff.countDocuments();
      body.staffNo = `STF-${1000 + count + 1}`;
    }

    // Keep photo and staffPhoto in sync
    if (body.photo && !body.staffPhoto) body.staffPhoto = body.photo;
    if (body.staffPhoto && !body.photo) body.photo = body.staffPhoto;

    const created = await Staff.create(body);

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Staff member saved successfully!'
    }, { status: 201 });
  } catch (error) {
    console.error('API /staff POST error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to save staff record'
    }, { status: 500 });
  }
}
