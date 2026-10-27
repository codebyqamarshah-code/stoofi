import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Certificate } from '@/lib/models';

export const DEFAULT_CERTIFICATE_TEMPLATES = [
  {
    title: 'Classical Gold Academic Excellence & Merit',
    type: 'Academic Excellence / Merit',
    description: 'Imperial ornate gold border certificate recognizing top scholastic standing and academic brilliance.',
    headerTitle: 'CERTIFICATE OF ACADEMIC EXCELLENCE',
    headerSubtitle: 'FOR OUTSTANDING SCHOLASTIC DISTINCTION',
    templateBody: 'In recognition of outstanding academic brilliance, diligence, and distinguished performance, this Certificate of Merit is proudly presented to [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], of Class [class_name] (Section [section]) for the Academic Session [academic_session]. Their unwavering commitment to learning and exemplary achievement serve as an inspiration to all.',
    footerLeft: 'Date of Award',
    footerCenter: 'Dean of Academics',
    footerRight: 'Principal & Authorized Seal',
    themeStyle: 'classic-gold',
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Modern Emerald Character & Conduct Certificate',
    type: 'Character Certificate',
    description: 'Official certification of exemplary student conduct, discipline, and moral standing.',
    headerTitle: 'CHARACTER & CONDUCT CERTIFICATE',
    headerSubtitle: 'TO WHOM IT MAY CONCERN',
    templateBody: 'This is to certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], has been a regular student of Class [class_name] (Section [section]) in this institution during the Academic Session [academic_session]. To the best of our knowledge and official records, their character, moral conduct, and discipline have been commendable and exemplary. They actively participated in institutional activities and demonstrated utmost respect and responsibility. We wish them grand success in all future pursuits.',
    footerLeft: 'Date of Issue',
    footerCenter: 'Class In-charge',
    footerRight: 'Principal / Head of Institution',
    themeStyle: 'stoofi-emerald',
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Royal Navy School Leaving & Transfer Diploma',
    type: 'Transfer Certificate',
    description: 'Formal transfer and school clearance certificate for student relocation or higher education advancement.',
    headerTitle: 'SCHOOL LEAVING / TRANSFER CERTIFICATE',
    headerSubtitle: 'OFFICIAL RECORD OF CLEARANCE & ADVANCEMENT',
    templateBody: 'This is to certify that [student_name], Son/Daughter of [father_name], bearing Admission No [admission_no] and Roll No [roll_no], was a bona fide student of Class [class_name] (Section [section]) of [school_name]. Their Date of Birth according to the School Admission Register is [dob]. All institutional dues and fees have been fully cleared. Their attendance record was satisfactory and conduct was exemplary. We wish them prosperity in their educational journey.',
    footerLeft: 'Prepared By / Date',
    footerCenter: 'Checked By Administration',
    footerRight: 'Principal / Authorized Seal',
    themeStyle: 'royal-navy',
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Crimson Laurel Sports & Extracurricular Champion',
    type: 'Sports & Extracurricular',
    description: 'Commendation with gold laurel wreath for athletic prowess, tournament victory, and sportsmanship.',
    headerTitle: 'CERTIFICATE OF SPORTS CHAMPIONSHIP',
    headerSubtitle: 'EXCELLENCE IN ATHLETICS & SPORTSMANSHIP',
    templateBody: 'This certificate is proudly awarded to [student_name], Admission No [admission_no], Class [class_name] (Section [section]), in recognition of exceptional athletic talent, commendable sportsmanship, and spirited victory during the Annual Sports Championship for the Academic Year [academic_session].',
    footerLeft: 'Date of Event',
    footerCenter: 'Sports Director / Coach',
    footerRight: 'Principal / Patron in Chief',
    themeStyle: 'crimson-merit',
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Minimalist Digital Verified Certificate of Appreciation',
    type: 'Appreciation Certificate',
    description: 'Modern Swiss minimalist digital certificate with verified security ID and institutional badge.',
    headerTitle: 'CERTIFICATE OF APPRECIATION',
    headerSubtitle: 'IN RECOGNITION OF VALUABLE CONTRIBUTIONS',
    templateBody: 'This certificate is bestowed upon [student_name], Admission No [admission_no], Class [class_name], in grateful appreciation for outstanding dedication, active participation, and valuable contributions to institutional events and student leadership during the Academic Session [academic_session].',
    footerLeft: 'Date of Presentation',
    footerCenter: 'Activity Coordinator',
    footerRight: 'Principal / Authorized Digital Seal',
    themeStyle: 'minimal-tech',
    status: 'Active',
    isDefault: true
  }
];

async function seedDefaultTemplatesIfEmpty() {
  try {
    const count = await Certificate.countDocuments();
    if (count < 5) {
      for (const tpl of DEFAULT_CERTIFICATE_TEMPLATES) {
        const exists = await Certificate.findOne({ title: tpl.title });
        if (!exists) {
          await Certificate.create(tpl);
        }
      }
    }
  } catch (err) {
    console.error('Error seeding default certificate templates:', err.message);
  }
}

export async function GET(req) {
  try {
    await connectDB();
    await seedDefaultTemplatesIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const all = searchParams.get('all') === 'true';

    const query = {};

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: regex },
        { type: regex },
        { description: regex },
        { headerTitle: regex }
      ];
    }

    if (type && type !== 'All' && type.trim()) {
      query.type = type.trim();
    }

    if (status && status !== 'All' && status.trim()) {
      query.status = status.trim();
    }

    if (all) {
      const data = await Certificate.find(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, data });
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Certificate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Certificate.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /certificate GET error:', error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_CERTIFICATE_TEMPLATES.map((t, idx) => ({ ...t, _id: `fallback-${idx}` })),
      pagination: {
        total: DEFAULT_CERTIFICATE_TEMPLATES.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      title,
      type,
      description = '',
      headerTitle = '',
      headerSubtitle = 'TO WHOM IT MAY CONCERN',
      templateBody,
      footerLeft = 'Date of Issue',
      footerCenter = 'Class Teacher / Checked By',
      footerRight = 'Principal / Authorized Seal',
      themeStyle = 'classic-gold',
      status = 'Active',
      showStudentPhoto = true,
      showAdmissionNo = true,
      showRollNo = true,
      showClass = true,
      showSection = true,
      showFatherName = true,
      showDob = true,
      showGender = true,
      showIssueDate = true,
      showQrBarcode = true,
      showSeal = true,
      showSignatureLeft = true,
      showSignatureCenter = true,
      showSignatureRight = true,
      showSchoolHeader = true,
      uploadedBackground = ''
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Certificate title is required' }, { status: 400 });
    }

    if (!type || !type.trim()) {
      return NextResponse.json({ success: false, message: 'Certificate type is required' }, { status: 400 });
    }

    if (!templateBody || !templateBody.trim()) {
      return NextResponse.json({ success: false, message: 'Certificate template body is required' }, { status: 400 });
    }

    const existing = await Certificate.findOne({ title: title.trim() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A certificate template with this title already exists' }, { status: 400 });
    }

    const newCert = await Certificate.create({
      title: title.trim(),
      type: type.trim(),
      description: description.trim(),
      headerTitle: headerTitle.trim() || title.trim().toUpperCase(),
      headerSubtitle: headerSubtitle.trim(),
      templateBody: templateBody.trim(),
      footerLeft: footerLeft.trim(),
      footerCenter: footerCenter.trim(),
      footerRight: footerRight.trim(),
      themeStyle,
      status,
      showStudentPhoto,
      showAdmissionNo,
      showRollNo,
      showClass,
      showSection,
      showFatherName,
      showDob,
      showGender,
      showIssueDate,
      showQrBarcode,
      showSeal,
      showSignatureLeft,
      showSignatureCenter,
      showSignatureRight,
      showSchoolHeader,
      uploadedBackground
    });

    return NextResponse.json({
      success: true,
      data: newCert,
      message: 'Certificate template created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /certificate POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
