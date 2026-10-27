import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Certificate, Student, Setting } from '@/lib/models';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { templateId, studentIds, certificateDate, academicSession } = body;

    if (!templateId) {
      return NextResponse.json({ success: false, message: 'Template ID is required' }, { status: 400 });
    }

    const template = await Certificate.findById(templateId);
    if (!template) {
      return NextResponse.json({ success: false, message: 'Certificate template not found' }, { status: 404 });
    }

    if (template.status !== 'Active') {
      return NextResponse.json({
        success: false,
        message: 'Selected certificate template is inactive and cannot be used for generation'
      }, { status: 400 });
    }

    const ids = Array.isArray(studentIds) ? studentIds : (studentIds ? [studentIds] : []);
    if (ids.length === 0) {
      return NextResponse.json({ success: false, message: 'At least one student must be selected' }, { status: 400 });
    }

    const [students, setting] = await Promise.all([
      Student.find({ _id: { $in: ids } }).lean(),
      Setting.findOne().lean()
    ]);

    const formattedDate = certificateDate 
      ? new Date(certificateDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const schoolName = setting?.schoolName || 'Pak Royal College Sharaqpur';
    const schoolAddress = 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';
    const schoolPhone = setting?.phone || '+92 300 1234567';

    const currentYear = new Date().getFullYear();
    const generatedCertificates = students.map((st, index) => {
      const stName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student';
      const fName = st.fatherName || '-';
      const admNo = st.admissionNo || '-';
      const rollNo = st.rollNo || '-';
      const clsName = st.className || 'FSC OTT';
      const secName = st.section || 'Section A';
      const session = academicSession || st.academicSession || `${currentYear}-${currentYear + 1}`;
      const certNo = `PRC-CERT-${currentYear}-${String(index + 101).padStart(4, '0')}`;

      let bodyText = template.templateBody || '';
      bodyText = bodyText
        .split('[student_name]').join(stName)
        .split('[father_name]').join(fName)
        .split('[admission_no]').join(admNo)
        .split('[roll_no]').join(rollNo)
        .split('[class_name]').join(clsName)
        .split('[section]').join(secName)
        .split('[school_name]').join(schoolName)
        .split('[academic_session]').join(session)
        .split('[academic_year]').join(session)
        .split('[certificate_date]').join(formattedDate)
        .split('[issue_date]').join(formattedDate)
        .split('[dob]').join(st.dob || '-')
        .split('[gender]').join(st.gender || '-');

      return {
        certificateNumber: certNo,
        date: formattedDate,
        templateTitle: template.title,
        templateType: template.type,
        themeStyle: template.themeStyle,
        headerTitle: template.headerTitle || template.title,
        headerSubtitle: template.headerSubtitle,
        bodyText,
        footerLeft: template.footerLeft,
        footerCenter: template.footerCenter,
        footerRight: template.footerRight,
        student: {
          _id: st._id,
          name: stName,
          fatherName: fName,
          admissionNo: admNo,
          rollNo: rollNo,
          className: clsName,
          section: secName,
          academicSession: session,
          dob: st.dob || '-',
          gender: st.gender || 'Male',
          photo: st.studentPhoto || st.photo || ''
        },
        school: {
          name: schoolName,
          address: schoolAddress,
          phone: schoolPhone
        }
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully prepared ${generatedCertificates.length} certificate(s)`,
      count: generatedCertificates.length,
      data: generatedCertificates
    });
  } catch (error) {
    console.error('API /certificate/generate error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
