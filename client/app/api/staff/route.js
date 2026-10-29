import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, Teacher, Department, Designation } from '@/lib/models';

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
    let rawList = data;
    if (rawList.length === 0 && (role === 'Teacher' || !role || role === 'All')) {
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
        rawList = teachers.map(t => ({
          ...t,
          role: 'Teacher',
          designation: t.designation || 'Senior Faculty',
          department: t.department || (t.assignedClass ? `${t.assignedClass} Academic Dept` : 'Academics')
        }));
      }
    }

    // Fetch departments and designations to resolve any empty fields/IDs
    const [depts, desigs] = await Promise.all([
      Department.find().select('_id name').lean().catch(() => []),
      Designation.find().select('_id name').lean().catch(() => [])
    ]);
    const deptMap = {};
    (depts || []).forEach(d => { deptMap[String(d._id)] = d.name; });
    const desigMap = {};
    (desigs || []).forEach(d => { desigMap[String(d._id)] = d.name; });

    // Normalize each staff record for consistent consumption across all components
    const result = rawList.map(s => {
      const id = (s._id || s.id || '').toString();
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Staff Member';
      const phone = s.mobile || s.phone || s.emergencyMobile || '';
      const hasImg = Boolean((s.staffPhoto && typeof s.staffPhoto === 'string' && s.staffPhoto.trim()) ||
                             (s.photo && typeof s.photo === 'string' && s.photo.trim()));
      const photo = hasImg ? `/api/staff/${id}/photo` : null;
      const department = s.department || deptMap[String(s.departmentId)] || (s.role === 'Super Admin' || s.role === 'Admin' ? 'Administration' : 'Academics');
      const designation = s.designation || desigMap[String(s.designationId)] || s.role || 'Staff Member';

      return {
        ...s,
        id,
        _id: id,
        name: fullName,
        fullName,
        department,
        designation,
        phone,
        mobile: phone,
        photo,
        staffPhoto: photo,
        hasPhoto: hasImg,
        status: s.status || 'Active',
      };
    });

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
      const [allStaff, allTeachers] = await Promise.all([
        Staff.find({}, 'staffNo').lean().catch(() => []),
        Teacher.find({}, 'staffNo teacherId').lean().catch(() => [])
      ]);
      let maxNum = 0;
      const scanNum = (str) => {
        if (!str) return;
        const m = String(str).match(/PRCS(\d+)/i) || String(str).match(/(\d+)/);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxNum) maxNum = num;
        }
      };
      (allStaff || []).forEach(s => scanNum(s.staffNo));
      (allTeachers || []).forEach(t => { scanNum(t.staffNo); scanNum(t.teacherId); });
      body.staffNo = `PRCS${String(maxNum + 1).padStart(4, '0')}`;
    }

    // Keep photo and staffPhoto in sync
    if (body.photo && !body.staffPhoto) body.staffPhoto = body.photo;
    if (body.staffPhoto && !body.photo) body.photo = body.staffPhoto;

    // Resolve department name if only departmentId was sent
    if (body.departmentId && (!body.department || !String(body.department).trim())) {
      try {
        const dept = await Department.findById(body.departmentId).lean();
        if (dept?.name) body.department = dept.name;
      } catch (_) {}
    }

    // Resolve designation name if only designationId was sent
    if (body.designationId && (!body.designation || !String(body.designation).trim())) {
      try {
        const desig = await Designation.findById(body.designationId).lean();
        if (desig?.name) body.designation = desig.name;
      } catch (_) {}
    }

    const created = await Staff.create(body);
    const createdObj = created.toObject ? created.toObject() : created;
    const id = createdObj._id.toString();

    return NextResponse.json({
      success: true,
      data: {
        ...createdObj,
        id,
        _id: id,
        name: `${createdObj.firstName || ''} ${createdObj.lastName || ''}`.trim() || 'Staff Member',
        phone: createdObj.mobile || createdObj.phone || '',
        photo: createdObj.staffPhoto || createdObj.photo || null,
        staffPhoto: createdObj.staffPhoto || createdObj.photo || null
      },
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
