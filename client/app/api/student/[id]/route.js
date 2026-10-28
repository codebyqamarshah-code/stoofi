import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cleanDateStr = (val) => {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    const dd = String(val.getUTCDate()).padStart(2, '0');
    const mm = String(val.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = val.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  const str = String(val).trim();
  if (!str || str === '—' || str === '-' || str === 'null' || str === 'undefined') return '';

  const excelSerialToDMY = (serial) => {
    if (serial >= 1000 && serial <= 80000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const msPerDay = 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + serial * msPerDay);
      if (!isNaN(date.getTime()) && date.getUTCFullYear() > 1900 && date.getUTCFullYear() < 2100) {
        const dd = String(date.getUTCDate()).padStart(2, '0');
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = date.getUTCFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    return null;
  };

  if (/^\d{4,6}(\.\d+)?$/.test(str)) {
    const conv = excelSerialToDMY(Math.floor(parseFloat(str)));
    if (conv) return conv;
  }

  const parts = str.split(/[-/.]/);
  if (parts.length === 3) {
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (n > 2100 && n <= 80000) {
        const conv = excelSerialToDMY(n);
        if (conv) return conv;
      }
    }
  }

  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const yyyy = isoMatch[1];
    const mm = isoMatch[2].padStart(2, '0');
    const dd = isoMatch[3].padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  }

  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const dd = dmyMatch[1].padStart(2, '0');
    const mm = dmyMatch[2].padStart(2, '0');
    const yyyy = dmyMatch[3];
    return `${dd}/${mm}/${yyyy}`;
  }

  return str;
};

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await Student.findById(id).lean();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    const formatted = {
      ...student,
      dob: cleanDateStr(student.dob),
      admissionDate: cleanDateStr(student.admissionDate),
      joiningDate: cleanDateStr(student.joiningDate)
    };

    return NextResponse.json(
      { success: true, data: formatted },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error) {
    console.error('API /student/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const dataObj = { ...body };

    // Normalize emergencyContact if sent as an object
    if (dataObj.emergencyContact && typeof dataObj.emergencyContact === 'object') {
      if (!dataObj.emergencyContactPhone) dataObj.emergencyContactPhone = dataObj.emergencyContact.phone || '';
      if (!dataObj.emergencyContactName) dataObj.emergencyContactName = dataObj.emergencyContact.name || '';
      if (!dataObj.emergencyContactRelation) dataObj.emergencyContactRelation = dataObj.emergencyContact.relationship || dataObj.emergencyContact.relation || '';
      dataObj.emergencyContact = dataObj.emergencyContact.phone || dataObj.emergencyContact.name || '';
    }

    // Keep studentPhoto and photo synchronized
    if (dataObj.studentPhoto || dataObj.photo) {
      const p = dataObj.studentPhoto || dataObj.photo;
      dataObj.studentPhoto = p;
      dataObj.photo = p;
    }

    // Clean up empty ObjectId / optional fields
    if (!dataObj.studentGroup || dataObj.studentGroup === '' || dataObj.studentGroup === 'undefined' || dataObj.studentGroup === 'null') {
      delete dataObj.studentGroup;
    }
    if (!dataObj.classId || dataObj.classId === '' || dataObj.classId === 'undefined' || dataObj.classId === 'null') {
      delete dataObj.classId;
    }

    // Parse Full Name if single name field was submitted
    if (dataObj.name || dataObj.fullName || dataObj.studentName) {
      const rawName = String(dataObj.studentName || dataObj.fullName || dataObj.name).trim();
      if (!dataObj.firstName) dataObj.firstName = rawName;
    }
    if (dataObj.firstName && (!dataObj.lastName || !dataObj.lastName.trim())) {
      const parts = String(dataObj.firstName).trim().split(/\s+/);
      if (parts.length > 1) {
        dataObj.firstName = parts[0];
        dataObj.lastName = parts.slice(1).join(' ');
      }
    }

    // Keep studentName, name, and fullName in sync
    const computedName = [dataObj.firstName, dataObj.lastName].filter(Boolean).join(' ').trim();
    if (computedName) {
      dataObj.studentName = dataObj.studentName || computedName;
      dataObj.name = dataObj.name || computedName;
      dataObj.fullName = dataObj.fullName || computedName;
    }

    // Sync father/mother/guardian
    if (dataObj.fatherName || dataObj.fatherPhone || dataObj.fatherCnic || dataObj.fatherOccupation) {
      dataObj.father = {
        name: dataObj.fatherName || dataObj.father?.name || '',
        phone: dataObj.fatherPhone || dataObj.father?.phone || '',
        cnic: dataObj.fatherCnic || dataObj.father?.cnic || '',
        occupation: dataObj.fatherOccupation || dataObj.father?.occupation || ''
      };
    }

    const updated = await Student.findByIdAndUpdate(id, dataObj, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('API /student/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('API /student/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete student' }, { status: 500 });
  }
}
