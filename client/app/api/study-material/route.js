import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/lib/models';
import { jsPDF } from 'jspdf';

function generateSamplePdfDataUri(title, subtitle, details = []) {
  try {
    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(0, 153, 102); // #009966 Stoofi Emerald Green
    doc.rect(0, 0, 210, 28, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PAK ROYAL COLLEGE', 105, 12, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Affiliated with Medical Faculty & Academic Council | Official Academic Resource', 105, 19, { align: 'center' });
    doc.text('Academic Year 2026-2027', 105, 24, { align: 'center' });
    
    // Title
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 42);
    
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(90, 90, 90);
      doc.text(subtitle, 14, 49);
    }
    
    // Divider line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 54, 196, 54);
    
    // Details Grid
    let currentY = 64;
    doc.setFontSize(9);
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(`${label}:`, 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      doc.text(String(value || 'N/A'), 60, currentY);
      currentY += 8;
    });
    
    // Body Text Placeholder
    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 153, 102);
    doc.text('Official Instructions & Academic Description:', 14, currentY);
    currentY += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const bodyLines = [
      'This document contains authorized curriculum and learning guidelines issued by Pak Royal College.',
      'Students are required to preserve this material and comply with all instructions and timelines.',
      'For academic support or clarification, please contact the respective departmental head.',
      'All rights reserved. Reproduction without institutional clearance is prohibited.'
    ];
    bodyLines.forEach(line => {
      doc.text(`* ${line}`, 14, currentY);
      currentY += 6;
    });
    
    // Footer
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 275, 196, 275);
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('Pak Royal College Portal | Stoofi ERP Verified Study Material', 14, 282);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 196, 282, { align: 'right' });
    
    return doc.output('datauristring');
  } catch (err) {
    console.error('PDF generation error:', err);
    return '';
  }
}

export const SAMPLE_STUDY_MATERIALS = [
  // --- ASSIGNMENTS ---
  {
    title: 'Anatomy & Physiology Practical Manual & Case Assignment',
    contentType: 'Assignment',
    description: 'Detailed anatomical diagrams and physiological case analyses. Complete all 5 clinical scenarios.',
    availableFor: 'Student',
    availAdmin: false,
    availStudent: true,
    className: 'FSC OTT',
    section: 'A',
    subject: 'Anatomy & Physiology',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-18'),
    dueDate: new Date(Date.now() + 10 * 86400000), // 10 days in future
    status: 'Published',
    fileName: 'anatomy_lab_manual_assignment.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    category: 'Lab Manual',
    version: '1.0',
    totalMarks: 100,
    passingMarks: 50,
    downloadsCount: 38,
    uploaderName: 'Prof. Tariq Mehmood',
    submissions: [
      {
        studentName: 'Ali Raza',
        rollNo: 'PRC-2026-001',
        submittedAt: new Date('2026-10-24'),
        fileName: 'ali_raza_anatomy_sub.pdf',
        fileSize: '1.9 MB',
        remarks: 'Completed all 5 scenarios with labeled hand-drawn diagrams.',
        status: 'Graded',
        marksObtained: 94,
        totalMarks: 100,
        teacherFeedback: 'Outstanding work on cranial nerve pathways and diagram clarity.',
        gradedBy: 'Prof. Tariq Mehmood',
        gradedAt: new Date('2026-10-25')
      },
      {
        studentName: 'Ayesha Bibi',
        rollNo: 'PRC-2026-004',
        submittedAt: new Date('2026-10-26'),
        fileName: 'ayesha_case_study.pdf',
        fileSize: '2.1 MB',
        remarks: 'Included hospital ward case report.',
        status: 'Submitted',
        marksObtained: 0,
        totalMarks: 100
      }
    ]
  },
  {
    title: 'Clinical Psychology & Cognitive Assessment Case Study',
    contentType: 'Assignment',
    description: 'Conduct cognitive behavioral assessment on provided hypothetical patient profiles and draft recommendations.',
    availableFor: 'Student',
    availAdmin: false,
    availStudent: true,
    className: 'BS Psychology',
    section: 'A',
    subject: 'Clinical Psychology',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-20'),
    dueDate: new Date(Date.now() + 6 * 86400000), // 6 days in future
    status: 'Published',
    fileName: 'psychology_cognitive_case.pdf',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    category: 'Course Outline',
    version: '1.0',
    totalMarks: 50,
    passingMarks: 25,
    downloadsCount: 42,
    uploaderName: 'Dr. Sarah Farooq',
    submissions: [
      {
        studentName: 'Zainab Fatima',
        rollNo: 'PRC-2026-012',
        submittedAt: new Date('2026-10-25'),
        fileName: 'zainab_cbt_case.pdf',
        fileSize: '1.5 MB',
        remarks: 'Full psychological evaluation submitted.',
        status: 'Graded',
        marksObtained: 47,
        totalMarks: 50,
        teacherFeedback: 'Comprehensive diagnostic formulations and empathetic treatment mapping.',
        gradedBy: 'Dr. Sarah Farooq',
        gradedAt: new Date('2026-10-26')
      }
    ]
  },
  {
    title: 'Radiographic Imaging Quality Control & Safety Protocol Assignment',
    contentType: 'Assignment',
    description: 'Evaluate radiation shielding calculations, ALARA protocols, and X-ray beam collimation quality checks.',
    availableFor: 'Student',
    availAdmin: false,
    availStudent: true,
    className: 'BS RIT',
    section: 'A',
    subject: 'Radiologic Technology',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-22'),
    dueDate: new Date(Date.now() + 14 * 86400000), // 14 days in future
    status: 'Published',
    fileName: 'rit_imaging_protocols_task.pdf',
    fileType: 'pdf',
    fileSize: '3.1 MB',
    category: 'Practical Guides',
    version: '1.0',
    totalMarks: 100,
    passingMarks: 50,
    downloadsCount: 29,
    uploaderName: 'Engr. Kamran Khan',
    submissions: []
  },
  {
    title: 'Dental Materials & Cavity Preparation Assessment Worksheet',
    contentType: 'Assignment',
    description: 'Class I to Class V cavity classifications and amalgam vs composite restoration comparison worksheet.',
    availableFor: 'Student',
    availAdmin: false,
    availStudent: true,
    className: 'FSC Dental',
    section: 'B',
    subject: 'Dental Anatomy & Materials',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-12'),
    dueDate: new Date(Date.now() - 2 * 86400000), // Past due
    status: 'Published',
    fileName: 'dental_cavity_worksheet.docx',
    fileType: 'docx',
    fileSize: '1.2 MB',
    category: 'Lecture Notes',
    version: '1.0',
    totalMarks: 50,
    passingMarks: 25,
    downloadsCount: 31,
    uploaderName: 'Dr. Bilal Arshad',
    submissions: [
      {
        studentName: 'Hamza Naveed',
        rollNo: 'PRC-2026-019',
        submittedAt: new Date('2026-10-23'),
        fileName: 'hamza_dental_sheet.docx',
        fileSize: '1.1 MB',
        remarks: 'Late submission with approval.',
        status: 'Late',
        marksObtained: 42,
        totalMarks: 50,
        teacherFeedback: 'Good understanding of composite curing times.',
        gradedBy: 'Dr. Bilal Arshad',
        gradedAt: new Date('2026-10-24')
      }
    ]
  },
  {
    title: 'Rehabilitation Protocol & Kinesiology Case Study Draft',
    contentType: 'Assignment',
    description: 'Post-operative ACL reconstruction therapy stages and gait rehabilitation schedule.',
    availableFor: 'Student',
    availAdmin: false,
    availStudent: true,
    className: 'DPT',
    section: 'A',
    subject: 'Kinesiology & Biomechanics',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-25'),
    dueDate: new Date(Date.now() + 20 * 86400000),
    status: 'Draft',
    fileName: 'dpt_kinesiology_draft.pdf',
    fileType: 'pdf',
    fileSize: '2.0 MB',
    category: 'Lab Manual',
    version: '0.9',
    totalMarks: 75,
    passingMarks: 38,
    downloadsCount: 0,
    uploaderName: 'Dr. Sana Malik',
    submissions: []
  },

  // --- SYLLABI ---
  {
    title: 'F.Sc Operation Theatre Technology (OTT) Annual Curriculum & Syllabus 2026-2027',
    contentType: 'Syllabus',
    description: 'Official comprehensive curriculum outlining surgical sterilization, OT equipment operation, anesthesia assistance, and emergency resuscitation.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'FSC OTT',
    section: 'All',
    subject: 'Surgical Technology & Anatomy',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-15'),
    status: 'Published',
    fileName: 'fsc_ott_curriculum_2026_2027.pdf',
    fileType: 'pdf',
    fileSize: '3.4 MB',
    category: 'Course Outline',
    version: '2.1',
    downloadsCount: 94,
    uploaderName: 'Academic Directorate'
  },
  {
    title: 'BS Psychology 4-Year Academic Degree Outline & Scheme of Studies',
    contentType: 'Syllabus',
    description: 'HEC compliant 8-semester course distribution covering General Psychology, Psychometrics, Abnormal Psychology, Clinical Internships, and Research Thesis.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'BS Psychology',
    section: 'All',
    subject: 'Psychological Sciences',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-16'),
    status: 'Published',
    fileName: 'bs_psychology_scheme_2026.pdf',
    fileType: 'pdf',
    fileSize: '2.8 MB',
    category: 'Course Outline',
    version: '1.2',
    downloadsCount: 88,
    uploaderName: 'Academic Directorate'
  },
  {
    title: 'BS Radiologic Imaging Technology (RIT) Semester Curriculum & Module Guide',
    contentType: 'Syllabus',
    description: 'Complete academic syllabus covering conventional radiography, fluoroscopy, computed tomography (CT), magnetic resonance imaging (MRI), and ultrasound.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'BS RIT',
    section: 'All',
    subject: 'Medical Diagnostic Imaging',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-17'),
    status: 'Published',
    fileName: 'bs_rit_semester_curriculum.pdf',
    fileType: 'pdf',
    fileSize: '4.1 MB',
    category: 'Course Outline',
    version: '1.0',
    downloadsCount: 76,
    uploaderName: 'Academic Directorate'
  },
  {
    title: 'Doctor of Physical Therapy (DPT) Foundational Scheme of Studies & Clinical Rotations',
    contentType: 'Syllabus',
    description: '5-year professional doctorate program outline including biomechanics, neuroanatomy, musculoskeletal physical therapy, and hospital ward rotation schedules.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'DPT',
    section: 'All',
    subject: 'Physical Therapy & Rehabilitation',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-19'),
    status: 'Published',
    fileName: 'dpt_foundational_syllabus.pdf',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    category: 'Course Outline',
    version: '3.0',
    downloadsCount: 112,
    uploaderName: 'Academic Directorate'
  },
  {
    title: 'F.Sc Dental Hygiene & Technology Annual Course Plan 2026',
    contentType: 'Syllabus',
    description: 'Annual dental technology framework, oral pathology modules, preventive dentistry, and dental clinic safety guidelines.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'FSC Dental',
    section: 'All',
    subject: 'Dental Sciences',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-21'),
    status: 'Published',
    fileName: 'fsc_dental_course_plan.pdf',
    fileType: 'pdf',
    fileSize: '2.2 MB',
    category: 'Course Outline',
    version: '1.1',
    downloadsCount: 45,
    uploaderName: 'Academic Directorate'
  },
  {
    title: 'F.Sc Nursing Foundation & Clinical Practice Curriculum Draft',
    contentType: 'Syllabus',
    description: 'Drafting revised clinical hours allocation and community medicine rotation modules.',
    availableFor: 'All Admin',
    availAdmin: true,
    availStudent: false,
    className: 'FSC NURSING',
    section: 'All',
    subject: 'Clinical Nursing',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-24'),
    status: 'Draft',
    fileName: 'nursing_curriculum_draft_revised.pdf',
    fileType: 'pdf',
    fileSize: '2.5 MB',
    category: 'Course Outline',
    version: '0.8',
    downloadsCount: 0,
    uploaderName: 'Nursing Curriculum Committee'
  },

  // --- OTHER DOWNLOADS ---
  {
    title: 'Student Code of Conduct & Clinical Internship Rules Handbook',
    contentType: 'Other Download',
    description: 'Comprehensive guidelines regarding campus discipline, clinical hospital ward dress code, patient confidentiality, and academic integrity.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'All',
    section: 'All',
    subject: 'Campus Administration',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-10'),
    status: 'Published',
    fileName: 'student_handbook_clinical_conduct.pdf',
    fileType: 'pdf',
    fileSize: '2.1 MB',
    category: 'Reference Documents',
    version: '1.0',
    downloadsCount: 156,
    uploaderName: 'Dean of Student Affairs'
  },
  {
    title: 'Laboratory Safety Manual & Biomedical Waste Handling Protocols',
    contentType: 'Other Download',
    description: 'Mandatory standard operating procedures for handling hazardous bio-materials, sharps disposal, chemical storage, and emergency eyewash stations.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'All',
    section: 'All',
    subject: 'Laboratory Sciences',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-12'),
    status: 'Published',
    fileName: 'lab_safety_guidelines_2026.pdf',
    fileType: 'pdf',
    fileSize: '3.6 MB',
    category: 'Practical Guides',
    version: '2.0',
    downloadsCount: 132,
    uploaderName: 'Lab Safety Incharge'
  },
  {
    title: 'Pak Royal College Leave, Examination Retake & Medical Exemption Form',
    contentType: 'Other Download',
    description: 'Official printable application form for student medical leave, duty exemptions, and supplementary exam clearances.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'All',
    section: 'All',
    subject: 'Student Affairs',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-14'),
    status: 'Published',
    fileName: 'exam_retake_medical_leave_form.pdf',
    fileType: 'pdf',
    fileSize: '850 KB',
    category: 'Forms & Templates',
    version: '1.0',
    downloadsCount: 215,
    uploaderName: 'Registrar Office'
  },
  {
    title: 'Pak Royal College Annual Academic Calendar & Examination Schedule 2026-2027',
    contentType: 'Other Download',
    description: 'Semester dates, midterm tests, sports week, gazetted national holidays, and final professional board examinations schedule.',
    availableFor: 'All Admin, Student',
    availAdmin: true,
    availStudent: true,
    className: 'All',
    section: 'All',
    subject: 'Academic Administration',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-16'),
    status: 'Published',
    fileName: 'academic_calendar_2026_2027.pdf',
    fileType: 'pdf',
    fileSize: '1.5 MB',
    category: 'Notices',
    version: '1.0',
    downloadsCount: 340,
    uploaderName: 'Academic Directorate'
  },
  {
    title: 'Hospital Clinical Ward Duty Logbook & Competency Verification Sheet',
    contentType: 'Other Download',
    description: 'Printable clinical rotation logbook where hospital ward preceptors sign off on patient attendance and surgical procedures.',
    availableFor: 'Student',
    availAdmin: false,
    availStudent: true,
    className: 'All',
    section: 'All',
    subject: 'Clinical Training',
    academicSession: '2026-2027',
    publishDate: new Date('2026-10-18'),
    status: 'Published',
    fileName: 'clinical_ward_duty_logbook.pdf',
    fileType: 'pdf',
    fileSize: '1.9 MB',
    category: 'Forms & Templates',
    version: '1.2',
    downloadsCount: 180,
    uploaderName: 'Clinical Coordinator'
  }
];

async function seedDefaultContentsIfEmpty() {
  try {
    const count = await Content.countDocuments();
    if (count === 0) {
      console.log('Seeding initial Study Material / Content collection for Pak Royal College...');
      const recordsToInsert = SAMPLE_STUDY_MATERIALS.map(item => {
        const pdfDataUri = generateSamplePdfDataUri(
          item.title,
          `${item.contentType} | Class: ${item.className} (${item.section})`,
          [
            ['Content Type', item.contentType],
            ['Academic Program', item.className],
            ['Section', item.section],
            ['Subject Area', item.subject || 'General Studies'],
            ['Academic Session', item.academicSession || '2026-2027'],
            ['Publication Date', new Date(item.publishDate).toLocaleDateString('en-GB')],
            ['Due Date', item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB') : 'Open / Self-paced'],
            ['Issued By', item.uploaderName || 'Pak Royal College Faculty'],
            ['Total Marks', item.totalMarks ? `${item.totalMarks} (Passing: ${item.passingMarks})` : 'N/A']
          ]
        );
        return {
          ...item,
          fileUrl: pdfDataUri
        };
      });

      await Content.insertMany(recordsToInsert);
      console.log(`Successfully seeded ${recordsToInsert.length} study material records.`);
    }
  } catch (err) {
    console.error('Error auto-seeding study materials:', err);
  }
}

export async function GET(req) {
  try {
    await connectDB();
    await seedDefaultContentsIfEmpty();

    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('type') || searchParams.get('contentType');
    const search = (searchParams.get('search') || '').trim();
    const className = searchParams.get('className') || searchParams.get('class');
    const section = searchParams.get('section');
    const subject = searchParams.get('subject');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = searchParams.get('limit');
    const limit = limitParam === 'all' ? 0 : parseInt(limitParam || '50', 10);

    const query = {};

    // Content Type filter
    if (contentType && contentType !== 'All' && contentType !== 'all') {
      query.contentType = contentType;
    }

    // Class filter
    if (className && className !== 'All' && className !== 'all') {
      query.className = { $regex: new RegExp(`^${className}$`, 'i') };
    }

    // Section filter
    if (section && section !== 'All' && section !== 'all') {
      query.section = { $regex: new RegExp(`^${section}$`, 'i') };
    }

    // Subject filter
    if (subject && subject !== 'All' && subject !== 'all') {
      query.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
    }

    // Status filter
    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // Default: exclude archived unless requested
      query.status = { $ne: 'Archived' };
    }

    // Category filter
    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    // Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
        { className: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { uploaderName: { $regex: search, $options: 'i' } }
      ];
    }

    let cursor = Content.find(query).sort({ publishDate: -1, createdAt: -1 });

    const total = await Content.countDocuments(query);

    if (limit > 0) {
      const skip = (page - 1) * limit;
      cursor = cursor.skip(skip).limit(limit);
    }

    const data = await cursor.lean();

    // Calculate dynamic stats across the whole collection
    const allRecords = await Content.find({ status: { $ne: 'Archived' } }).select('contentType status publishDate dueDate downloadsCount className category').lean();
    
    const now = new Date();
    const stats = {
      totalContents: allRecords.length,
      totalAssignments: allRecords.filter(r => r.contentType === 'Assignment').length,
      activeAssignments: allRecords.filter(r => r.contentType === 'Assignment' && (!r.dueDate || new Date(r.dueDate) >= now)).length,
      pastDueAssignments: allRecords.filter(r => r.contentType === 'Assignment' && r.dueDate && new Date(r.dueDate) < now).length,
      totalSyllabi: allRecords.filter(r => r.contentType === 'Syllabus').length,
      programsCovered: [...new Set(allRecords.filter(r => r.contentType === 'Syllabus').map(r => r.className))].length,
      totalDownloads: allRecords.filter(r => r.contentType === 'Other Download').length,
      totalDownloadEvents: allRecords.reduce((sum, r) => sum + (Number(r.downloadsCount) || 0), 0),
      totalDrafts: allRecords.filter(r => r.status === 'Draft').length,
      categoriesCount: [...new Set(allRecords.map(r => r.category).filter(Boolean))].length
    };

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit: limit || total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      stats
    });
  } catch (error) {
    console.error('API /study-material GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to retrieve study materials.' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const title = String(body.title || '').trim();
    const contentType = String(body.contentType || body.type || '').trim();

    if (!title) {
      return NextResponse.json({ success: false, message: 'Content title is required.' }, { status: 400 });
    }

    if (!contentType) {
      return NextResponse.json({ success: false, message: 'Content type is required.' }, { status: 400 });
    }

    // Resolve Available For string
    let availableFor = body.availableFor;
    const availAdmin = Boolean(body.availAdmin);
    const availStudent = body.availStudent !== undefined ? Boolean(body.availStudent) : true;
    
    if (!availableFor) {
      const parts = [];
      if (availAdmin) parts.push('All Admin');
      if (availStudent) parts.push('Student');
      availableFor = parts.length > 0 ? parts.join(', ') : 'Student';
    }

    // Check if a file was uploaded or data URI was provided
    let fileUrl = body.fileUrl || '';
    const fileName = body.fileName || (body.sourceUrl ? 'External Resource Link' : 'Course Document');
    const fileType = body.fileType || (fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : 'pdf');
    const fileSize = body.fileSize || '1.5 MB';

    // If no custom file is supplied, generate a valid official Pak Royal College PDF!
    if (!fileUrl && !body.sourceUrl) {
      fileUrl = generateSamplePdfDataUri(
        title,
        `${contentType} | Class: ${body.className || 'All'} (${body.section || 'All'})`,
        [
          ['Content Title', title],
          ['Content Type', contentType],
          ['Academic Program', body.className || 'All Programs'],
          ['Section', body.section || 'All Sections'],
          ['Subject', body.subject || 'General Curriculum'],
          ['Uploaded Date', new Date().toLocaleDateString('en-GB')],
          ['Due Date', body.dueDate ? new Date(body.dueDate).toLocaleDateString('en-GB') : 'Open']
        ]
      );
    }

    const newContent = await Content.create({
      title,
      contentType,
      description: body.description || '',
      availableFor,
      availAdmin,
      availStudent,
      className: body.className || 'All',
      section: body.section || 'All',
      subject: body.subject || 'General',
      academicSession: body.academicSession || '2026-2027',
      publishDate: body.publishDate ? new Date(body.publishDate) : (body.date ? new Date(body.date) : new Date()),
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status || 'Published',
      fileUrl,
      fileName,
      fileType,
      fileSize,
      sourceUrl: body.sourceUrl || '',
      category: body.category || 'General',
      version: body.version || '1.0',
      totalMarks: body.totalMarks ? Number(body.totalMarks) : 100,
      passingMarks: body.passingMarks ? Number(body.passingMarks) : 50,
      uploaderName: body.uploaderName || 'Faculty Coordinator',
      downloadsCount: 0,
      viewsCount: 0,
      submissions: []
    });

    return NextResponse.json({
      success: true,
      data: newContent,
      message: `${contentType} uploaded successfully!`
    }, { status: 201 });
  } catch (error) {
    console.error('API /study-material POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload study material.' },
      { status: 500 }
    );
  }
}
