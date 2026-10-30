import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, Teacher, Department, Designation } from '@/lib/models';

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

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const rawList = Array.isArray(body.staff) ? body.staff : (Array.isArray(body) ? body : []);

    if (!rawList.length) {
      return NextResponse.json({ success: false, message: 'No staff members provided for import.' }, { status: 400 });
    }

    // 1. Pre-load existing staff numbers to ensure clean sequence generation
    const [existingStaff, existingTeachers] = await Promise.all([
      Staff.find({}, 'staffNo email mobile phone').lean().catch(() => []),
      Teacher.find({}, 'staffNo teacherId email').lean().catch(() => [])
    ]);

    let maxNum = 0;
    const assignedStaffNos = new Set();
    const existingEmails = new Set();

    const scanNum = (str) => {
      if (!str) return;
      assignedStaffNos.add(String(str).trim().toUpperCase());
      const m = String(str).match(/PRCS(\d+)/i) || String(str).match(/(\d+)/);
      if (m) {
        const num = parseInt(m[1], 10);
        if (num > maxNum) maxNum = num;
      }
    };

    (existingStaff || []).forEach(s => {
      scanNum(s.staffNo);
      if (s.email) existingEmails.add(String(s.email).trim().toLowerCase());
    });
    (existingTeachers || []).forEach(t => {
      scanNum(t.staffNo);
      scanNum(t.teacherId);
      if (t.email) existingEmails.add(String(t.email).trim().toLowerCase());
    });

    // 2. Map & validate each staff record
    const staffToInsert = [];
    const skippedRecords = [];

    for (let i = 0; i < rawList.length; i++) {
      const row = rawList[i];
      let firstName = (row.firstName || row.name || '').trim();
      let lastName = (row.lastName || '').trim();

      // If only single name was provided, split into first and last
      if (firstName && !lastName && firstName.includes(' ')) {
        const parts = firstName.split(/\s+/);
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }

      if (!firstName) {
        skippedRecords.push({ row: i + 1, reason: 'First name / Full name is required' });
        continue;
      }

      // Resolve staffNo
      let staffNo = (row.staffNo || row.employeeId || '').trim();
      if (staffNo) {
        if (assignedStaffNos.has(staffNo.toUpperCase())) {
          // If collision, assign next available PRCS number
          maxNum++;
          staffNo = `PRCS${String(maxNum).padStart(4, '0')}`;
        }
      } else {
        maxNum++;
        staffNo = `PRCS${String(maxNum).padStart(4, '0')}`;
      }
      assignedStaffNos.add(staffNo.toUpperCase());

      const phone = (row.phone || row.mobile || row.contact || '').trim();
      const email = (row.email || '').trim().toLowerCase();
      const role = (row.role || 'Teacher').trim();
      const designation = (row.designation || (role === 'Teacher' ? 'Lecturer' : 'Staff')).trim();
      const department = (row.department || 'Academics').trim();
      const gender = (row.gender || 'Male').trim();
      const fatherName = (row.fatherName || '').trim();
      const cnic = (row.cnic || '').trim();
      const dateOfBirth = cleanDateStr(row.dateOfBirth || row.dob);
      const dateOfJoining = cleanDateStr(row.dateOfJoining || row.joiningDate || new Date().toISOString().split('T')[0]);
      const basicSalary = parseFloat(row.basicSalary || row.salary) || 0;
      const currentAddress = (row.currentAddress || row.address || '').trim();
      const qualifications = (row.qualifications || row.qualification || '').trim();
      const experience = (row.experience || '').trim();

      staffToInsert.push({
        staffNo,
        firstName,
        lastName,
        fatherName,
        name: `${firstName} ${lastName}`.trim(),
        role,
        designation,
        department,
        gender,
        email,
        phone,
        mobile: phone,
        emergencyMobile: (row.emergencyMobile || '').trim(),
        cnic,
        dateOfBirth,
        dob: dateOfBirth,
        dateOfJoining,
        joiningDate: new Date(),
        basicSalary,
        salary: basicSalary,
        currentAddress,
        permanentAddress: (row.permanentAddress || currentAddress).trim(),
        qualifications,
        experience,
        maritalStatus: row.maritalStatus || 'Single',
        status: row.status || 'Active'
      });
    }

    if (!staffToInsert.length) {
      return NextResponse.json({
        success: false,
        message: 'No valid staff records found to import.',
        skipped: skippedRecords
      }, { status: 400 });
    }

    // 3. Batch insert using Staff.create
    const createdStaff = await Staff.create(staffToInsert);
    const count = Array.isArray(createdStaff) ? createdStaff.length : 1;

    return NextResponse.json({
      success: true,
      count,
      data: createdStaff,
      skipped: skippedRecords,
      message: `Successfully imported ${count} staff member(s)!`
    }, { status: 201 });

  } catch (error) {
    console.error('API /staff/bulk POST error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to bulk import staff records'
    }, { status: 500 });
  }
}
