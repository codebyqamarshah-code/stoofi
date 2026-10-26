import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, Class } from '@/lib/models';

const extractRollSeq = (r) => {
  if (!r) return 0;
  const str = String(r).trim();
  const prcYearMatch = str.match(/^PRC\d{2}(\d+)$/i);
  if (prcYearMatch) return parseInt(prcYearMatch[1], 10);
  const prcMatch = str.match(/^PRC(\d+)$/i);
  if (prcMatch) return parseInt(prcMatch[1], 10);
  const plain = str.match(/^(\d+)$/);
  if (plain) return parseInt(plain[1], 10);
  return 0;
};

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
    const rawList = Array.isArray(body.students) ? body.students : (Array.isArray(body) ? body : []);

    if (!rawList.length) {
      return NextResponse.json({ success: false, message: 'No students provided for import.' }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const rollPrefix = 'PRC';

    // 1. Pre-load existing students' roll numbers and admission numbers
    const existingStudents = await Student.find({}, 'rollNo admissionNo').lean();
    
    let maxRollSeq = 0;
    let maxAdmNum = 0;
    const assignedRolls = new Set();
    const assignedAdmissionNos = new Set();

    existingStudents.forEach(st => {
      if (st.rollNo) {
        assignedRolls.add(String(st.rollNo).trim().toLowerCase());
        const seq = extractRollSeq(st.rollNo);
        if (seq > maxRollSeq) maxRollSeq = seq;
      }
      if (st.admissionNo) {
        assignedAdmissionNos.add(String(st.admissionNo).trim().toLowerCase());
        const match = String(st.admissionNo).match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxAdmNum) maxAdmNum = num;
        }
      }
    });

    let nextRollSeq = maxRollSeq;
    let nextAdmNum = maxAdmNum;

    // 2. Prepare and sanitize each student record
    const prepared = [];

    for (let idx = 0; idx < rawList.length; idx++) {
      const s = rawList[idx];
      if (!s || typeof s !== 'object') continue;

      const studentObj = { ...s };

      // Delete any client-provided pseudo _id (e.g. "stu-17721...") so MongoDB assigns a valid ObjectId
      delete studentObj._id;

      // Clean invalid ObjectIds
      if (!studentObj.classId || String(studentObj.classId).length !== 24) delete studentObj.classId;
      if (!studentObj.studentGroup || String(studentObj.studentGroup).length !== 24) delete studentObj.studentGroup;
      if (!studentObj.user || String(studentObj.user).length !== 24) delete studentObj.user;

      // Parse Name
      if (studentObj.fullName || studentObj.name || studentObj.studentName) {
        const full = String(studentObj.fullName || studentObj.name || studentObj.studentName).trim();
        if (!studentObj.firstName) studentObj.firstName = full;
      }
      if (studentObj.firstName && (!studentObj.lastName || !String(studentObj.lastName).trim())) {
        const parts = String(studentObj.firstName).trim().split(/\s+/);
        if (parts.length > 1) {
          studentObj.firstName = parts[0];
          studentObj.lastName = parts.slice(1).join(' ');
        }
      }
      if (!studentObj.firstName || !String(studentObj.firstName).trim()) {
        studentObj.firstName = `Student ${idx + 1}`;
      } else {
        studentObj.firstName = String(studentObj.firstName).trim();
      }
      if (studentObj.lastName) {
        studentObj.lastName = String(studentObj.lastName).trim();
      } else {
        studentObj.lastName = '';
      }

      const bulkFullName = [studentObj.firstName, studentObj.lastName].filter(Boolean).join(' ').trim();
      studentObj.studentName = bulkFullName;
      studentObj.name = bulkFullName;
      studentObj.fullName = bulkFullName;

      // Sensible defaults
      studentObj.gender = studentObj.gender && String(studentObj.gender).trim() ? String(studentObj.gender).trim() : 'Male';
      studentObj.dob = cleanDateStr(studentObj.dob) || '2010-01-01';
      studentObj.className = studentObj.className && String(studentObj.className).trim() ? String(studentObj.className).trim() : 'FSC OTT';
      studentObj.section = studentObj.section && String(studentObj.section).trim() ? String(studentObj.section).trim() : 'A';
      studentObj.academicYear = studentObj.academicYear && String(studentObj.academicYear).trim() ? String(studentObj.academicYear).trim() : `${currentYear}`;
      studentObj.type = studentObj.type && String(studentObj.type).trim() ? String(studentObj.type).trim() : 'Regular';

      // Unique Admission Number: if provided in file, preserve it!
      const rawAdm = studentObj.admissionNo ? String(studentObj.admissionNo).trim() : '';
      if (!rawAdm) {
        do {
          nextAdmNum += 1;
          const candidateAdm = `ADM${String(currentYear).slice(-2)}${String(nextAdmNum).padStart(4, '0')}`;
          if (!assignedAdmissionNos.has(candidateAdm.toLowerCase())) {
            studentObj.admissionNo = candidateAdm;
            assignedAdmissionNos.add(candidateAdm.toLowerCase());
            break;
          }
        } while (true);
      } else {
        studentObj.admissionNo = rawAdm;
        assignedAdmissionNos.add(rawAdm.toLowerCase());
      }

      // Unique Roll Number (PRC0001 format)
      const rawRoll = studentObj.rollNo ? String(studentObj.rollNo).trim() : '';
      if (!rawRoll) {
        do {
          nextRollSeq += 1;
          const candidateRoll = `${rollPrefix}${String(nextRollSeq).padStart(4, '0')}`;
          if (!assignedRolls.has(candidateRoll.toLowerCase())) {
            studentObj.rollNo = candidateRoll;
            assignedRolls.add(candidateRoll.toLowerCase());
            break;
          }
        } while (true);
      } else {
        studentObj.rollNo = rawRoll;
        assignedRolls.add(rawRoll.toLowerCase());
      }

      // Clean string fields
      if (studentObj.phone) studentObj.phone = String(studentObj.phone).trim();
      if (studentObj.email) studentObj.email = String(studentObj.email).trim();
      if (studentObj.fatherPhone) studentObj.fatherPhone = String(studentObj.fatherPhone).trim();
      if (studentObj.motherPhone) studentObj.motherPhone = String(studentObj.motherPhone).trim();
      if (studentObj.guardianPhone) studentObj.guardianPhone = String(studentObj.guardianPhone).trim();
      if (studentObj.emergencyContact) studentObj.emergencyContact = String(studentObj.emergencyContact).trim();
      if (studentObj.cnic) studentObj.cnic = String(studentObj.cnic).trim();
      if (studentObj.bForm) studentObj.bForm = String(studentObj.bForm).trim();
      if (!studentObj.bForm && studentObj.cnic) studentObj.bForm = studentObj.cnic;
      if (!studentObj.cnic && studentObj.bForm) studentObj.cnic = studentObj.bForm;

      studentObj.joiningDate = cleanDateStr(studentObj.joiningDate);
      studentObj.admissionDate = cleanDateStr(studentObj.admissionDate);
      if (!studentObj.admissionDate && studentObj.joiningDate) studentObj.admissionDate = studentObj.joiningDate;
      if (!studentObj.joiningDate && studentObj.admissionDate) studentObj.joiningDate = studentObj.admissionDate;

      if (studentObj.fatherOccupation) studentObj.fatherOccupation = String(studentObj.fatherOccupation).trim();
      if (studentObj.motherOccupation) studentObj.motherOccupation = String(studentObj.motherOccupation).trim();
      if (studentObj.fatherCnic) studentObj.fatherCnic = String(studentObj.fatherCnic).trim();
      if (studentObj.fatherName) studentObj.fatherName = String(studentObj.fatherName).trim();
      if (studentObj.motherName) studentObj.motherName = String(studentObj.motherName).trim();
      if (studentObj.bloodGroup) studentObj.bloodGroup = String(studentObj.bloodGroup).trim();
      if (studentObj.religion) studentObj.religion = String(studentObj.religion).trim();

      if (studentObj.city) studentObj.city = String(studentObj.city).trim();
      if (studentObj.address) studentObj.address = String(studentObj.address).trim();
      if (studentObj.currentAddress) studentObj.currentAddress = String(studentObj.currentAddress).trim();
      if (studentObj.permanentAddress) studentObj.permanentAddress = String(studentObj.permanentAddress).trim();
      if (!studentObj.address && studentObj.currentAddress) studentObj.address = studentObj.currentAddress;
      if (!studentObj.currentAddress && studentObj.address) studentObj.currentAddress = studentObj.address;
      if (!studentObj.permanentAddress && studentObj.currentAddress) studentObj.permanentAddress = studentObj.currentAddress;

      // Sync nested father/mother/guardian objects
      if (studentObj.fatherName || studentObj.fatherPhone || studentObj.fatherCnic || studentObj.fatherOccupation) {
        studentObj.father = {
          name: studentObj.fatherName || studentObj.father?.name || '',
          phone: studentObj.fatherPhone || studentObj.father?.phone || '',
          cnic: studentObj.fatherCnic || studentObj.father?.cnic || '',
          occupation: studentObj.fatherOccupation || studentObj.father?.occupation || ''
        };
      }

      // ID Card appearance defaults
      studentObj.cardTemplate = studentObj.cardTemplate || 'classic-navy';
      studentObj.cardLayout = studentObj.cardLayout || 'horizontal';
      studentObj.themeStyle = studentObj.themeStyle || 'classic-navy';
      studentObj.status = studentObj.status || 'Active';

      prepared.push(studentObj);
    }

    if (!prepared.length) {
      return NextResponse.json({ success: false, message: 'No valid student rows to import.' }, { status: 400 });
    }

    // Auto-create any missing Class definitions so newly imported classes show in dropdowns
    const uniqueClasses = [...new Set(prepared.map(p => p.className).filter(Boolean))];
    for (const cName of uniqueClasses) {
      try {
        const found = await Class.findOne({ name: { $regex: '^' + cName.trim() + '$', $options: 'i' } });
        if (!found) {
          await Class.create({ name: cName.trim(), status: 'Active' });
        }
      } catch (_) {}
    }

    // Upsert students by admissionNo so re-importing cleanly updates existing students without duplicate key errors
    const operations = prepared.map(st => ({
      updateOne: {
        filter: { admissionNo: st.admissionNo },
        update: { $set: st },
        upsert: true
      }
    }));
    await Student.bulkWrite(operations, { ordered: true });

    const result = await Student.find({
      admissionNo: { $in: prepared.map(p => p.admissionNo) }
    }).lean();

    result.sort((a, b) =>
      String(a.admissionNo || '').localeCompare(String(b.admissionNo || ''), undefined, { numeric: true, sensitivity: 'base' })
    );

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${prepared.length} student(s).`,
      count: prepared.length,
      data: result
    }, { status: 201 });
  } catch (error) {
    console.error('API /student/bulk POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Bulk import failed' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const rawIds = body?.ids || body?.studentIds || body;
    const ids = Array.isArray(rawIds) ? rawIds : [];
    if (!ids.length) {
      return NextResponse.json({ success: false, message: 'No student IDs provided for deletion.' }, { status: 400 });
    }

    const result = await Student.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} student(s).`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('API /student/bulk DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
