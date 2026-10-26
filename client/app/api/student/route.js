import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';
import { extractYear, generateAdmissionNumber, generateRollNumber } from '@/lib/admissionSequence.service';

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

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '100', 10) || 100;
    const search = searchParams.get('search') || '';
    const className = searchParams.get('className') || '';
    const section = searchParams.get('section') || '';
    const rollNo = searchParams.get('rollNo') || '';
    const name = searchParams.get('name') || '';

    const query = {};
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { firstName: { $regex: s, $options: 'i' } },
        { lastName: { $regex: s, $options: 'i' } },
        { admissionNo: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { rollNo: { $regex: s, $options: 'i' } }
      ];
    }

    if (name && name.trim()) {
      const n = name.trim();
      query.$or = [
        { firstName: { $regex: n, $options: 'i' } },
        { lastName: { $regex: n, $options: 'i' } }
      ];
    }

    if (className && className !== 'All Classes' && className !== 'All' && className.trim()) {
      const c = className.replace(/^Class\s+/i, '').trim();
      query.className = { $regex: '^(' + className + '|' + c + '|Class\\s*' + c + ')$', $options: 'i' };
    }

    if (section && section !== 'All Sections' && section !== 'All' && section.trim()) {
      const sec = section.replace(/^Section\s+/i, '').trim();
      query.section = { $regex: '^(' + section + '|' + sec + '|Section\\s*' + sec + ')$', $options: 'i' };
    }

    if (rollNo && rollNo.trim()) {
      query.rollNo = { $regex: rollNo.trim(), $options: 'i' };
    }

    const skip = (page - 1) * limit;

    // Fetch lightweight metadata first so MongoDB never sorts large base64 photos in memory
    const metaDocs = await Student.find(query)
      .select('_id admissionNo rollNo createdAt')
      .lean();

    metaDocs.sort((a, b) => {
      const admA = String(a.admissionNo || '').trim();
      const admB = String(b.admissionNo || '').trim();
      if (admA && admB && admA !== admB) {
        return admA.localeCompare(admB, undefined, { numeric: true, sensitivity: 'base' });
      }
      const rollA = String(a.rollNo || '').trim();
      const rollB = String(b.rollNo || '').trim();
      if (rollA && rollB && rollA !== rollB) {
        return rollA.localeCompare(rollB, undefined, { numeric: true, sensitivity: 'base' });
      }
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    const total = metaDocs.length;
    const pageIds = metaDocs.slice(skip, skip + limit).map(m => m._id);

    const rawStudents = pageIds.length > 0
      ? await Student.find({ _id: { $in: pageIds } }).lean()
      : [];

    const docMap = new Map(rawStudents.map(st => [String(st._id), st]));
    const students = pageIds
      .map(id => docMap.get(String(id)))
      .filter(Boolean)
      .map(st => ({
        ...st,
        dob: cleanDateStr(st.dob),
        admissionDate: cleanDateStr(st.admissionDate),
        joiningDate: cleanDateStr(st.joiningDate)
      }));

    return NextResponse.json({
      success: true,
      data: students || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /student GET error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch students'
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const dataObj = { ...body };
    const currentYear = new Date().getFullYear();

    if (!dataObj.studentGroup || dataObj.studentGroup === '' || dataObj.studentGroup === 'undefined' || dataObj.studentGroup === 'null') {
      delete dataObj.studentGroup;
    }
    if (!dataObj.classId || dataObj.classId === '' || dataObj.classId === 'undefined' || dataObj.classId === 'null') {
      delete dataObj.classId;
    }

    if (dataObj.name || dataObj.fullName) {
      const rawName = String(dataObj.fullName || dataObj.name).trim();
      if (!dataObj.firstName) dataObj.firstName = rawName;
    }
    if (dataObj.firstName && (!dataObj.lastName || !dataObj.lastName.trim())) {
      const trimmed = String(dataObj.firstName).trim();
      const parts = trimmed.split(/\s+/);
      if (parts.length > 1) {
        dataObj.firstName = parts[0];
        dataObj.lastName = parts.slice(1).join(' ');
      }
    }

    if (!dataObj.firstName || !String(dataObj.firstName).trim()) {
      return NextResponse.json({ success: false, message: 'Student first name is required' }, { status: 400 });
    }

    const targetYear = extractYear(dataObj.admissionYear || dataObj.admissionDate);

    if (!dataObj.admissionNo || String(dataObj.admissionNo).trim() === '') {
      const admRes = await generateAdmissionNumber(targetYear);
      dataObj.admissionNo = admRes.admissionNumber;
    } else {
      const existingAdm = await Student.findOne({ admissionNo: String(dataObj.admissionNo).trim() });
      if (existingAdm) {
        const admRes = await generateAdmissionNumber(targetYear);
        dataObj.admissionNo = admRes.admissionNumber;
      }
    }

    if (!dataObj.rollNo || String(dataObj.rollNo).trim() === '') {
      const rollRes = await generateRollNumber(targetYear);
      dataObj.rollNo = rollRes.rollNumber;
    } else {
      const rollStr = String(dataObj.rollNo).trim();
      const existingRoll = await Student.findOne({
        rollNo: { $regex: '^' + rollStr + '$', $options: 'i' }
      });
      if (existingRoll) {
        return NextResponse.json({
          success: false,
          message: `Roll Number (${rollStr}) is already assigned in system.`
        }, { status: 400 });
      }
    }

    const student = await Student.create({
      ...dataObj,
      firstName: String(dataObj.firstName).trim(),
      lastName: String(dataObj.lastName || '').trim(),
      className: dataObj.className || 'FSC OTT',
      section: dataObj.section || 'A',
      gender: dataObj.gender || 'Male',
      dob: dataObj.dob || '2008-01-01',
      cardTemplate: dataObj.cardTemplate || 'classic-navy',
      cardLayout: dataObj.cardLayout || 'horizontal',
      themeStyle: dataObj.themeStyle || 'classic-navy',
      status: dataObj.status || 'Active'
    });

    return NextResponse.json({
      success: true,
      data: student,
      message: 'Student created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /student POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error creating student' }, { status: 500 });
  }
}
