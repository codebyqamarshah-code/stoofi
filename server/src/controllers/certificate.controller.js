const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const Setting = require('../models/Setting');

const DEFAULT_TEMPLATES = [
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

// Helper to seed default templates if database has none
async function seedDefaultTemplatesIfEmpty() {
  try {
    const count = await Certificate.countDocuments();
    if (count < 5) {
      for (const tpl of DEFAULT_TEMPLATES) {
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

// GET /api/certificate
exports.getAll = async (req, res) => {
  try {
    await seedDefaultTemplatesIfEmpty();

    const { 
      search = '', 
      type = '', 
      status = '', 
      page = 1, 
      limit = 10,
      all = 'false'
    } = req.query;

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

    // If 'all' is requested (e.g. for dropdowns in Generate Certificate)
    if (all === 'true') {
      const data = await Certificate.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Certificate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Certificate.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificate/stats
exports.getStats = async (req, res) => {
  try {
    await seedDefaultTemplatesIfEmpty();

    const [total, active, inactive, types] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ status: 'Active' }),
      Certificate.countDocuments({ status: 'Inactive' }),
      Certificate.distinct('type')
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        totalTypes: types.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificate/:id
exports.getById = async (req, res) => {
  try {
    const data = await Certificate.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Certificate template not found' });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/certificate
exports.create = async (req, res) => {
  try {
    const { 
      title, 
      type, 
      description, 
      headerTitle, 
      headerSubtitle, 
      templateBody, 
      footerLeft, 
      footerCenter, 
      footerRight, 
      themeStyle, 
      status 
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Certificate title is required' });
    }

    if (!type || !type.trim()) {
      return res.status(400).json({ success: false, message: 'Certificate type is required' });
    }

    if (!templateBody || !templateBody.trim()) {
      return res.status(400).json({ success: false, message: 'Certificate template body is required' });
    }

    // Check duplicate title
    const existing = await Certificate.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A certificate template with this title already exists' });
    }

    const newCert = await Certificate.create({
      title: title.trim(),
      type: type.trim(),
      description: (description || '').trim(),
      headerTitle: (headerTitle || '').trim() || title.trim().toUpperCase(),
      headerSubtitle: (headerSubtitle || 'TO WHOM IT MAY CONCERN').trim(),
      templateBody: templateBody.trim(),
      footerLeft: (footerLeft || 'Date of Issue').trim(),
      footerCenter: (footerCenter || 'Class Teacher / Checked By').trim(),
      footerRight: (footerRight || 'Principal / Authorized Seal').trim(),
      themeStyle: themeStyle || 'stoofi-emerald',
      status: status || 'Active'
    });

    res.status(201).json({ success: true, data: newCert, message: 'Certificate template created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/certificate/:id
exports.update = async (req, res) => {
  try {
    const { 
      title, 
      type, 
      description, 
      headerTitle, 
      headerSubtitle, 
      templateBody, 
      footerLeft, 
      footerCenter, 
      footerRight, 
      themeStyle, 
      status 
    } = req.body;

    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate template not found' });
    }

    if (title && title.trim()) {
      // Check duplicate title if changed
      if (title.trim().toLowerCase() !== cert.title.toLowerCase()) {
        const duplicate = await Certificate.findOne({ title: title.trim() });
        if (duplicate) {
          return res.status(400).json({ success: false, message: 'Another template with this title already exists' });
        }
      }
      cert.title = title.trim();
    }

    if (type && type.trim()) cert.type = type.trim();
    if (description !== undefined) cert.description = (description || '').trim();
    if (headerTitle !== undefined) cert.headerTitle = (headerTitle || '').trim();
    if (headerSubtitle !== undefined) cert.headerSubtitle = (headerSubtitle || '').trim();
    if (templateBody && templateBody.trim()) cert.templateBody = templateBody.trim();
    if (footerLeft !== undefined) cert.footerLeft = (footerLeft || '').trim();
    if (footerCenter !== undefined) cert.footerCenter = (footerCenter || '').trim();
    if (footerRight !== undefined) cert.footerRight = (footerRight || '').trim();
    if (themeStyle) cert.themeStyle = themeStyle;
    if (status) cert.status = status;

    const updated = await cert.save();
    res.status(200).json({ success: true, data: updated, message: 'Certificate template updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/certificate/:id/status
exports.toggleStatus = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate template not found' });
    }

    cert.status = cert.status === 'Active' ? 'Inactive' : 'Active';
    await cert.save();

    res.status(200).json({ 
      success: true, 
      data: cert, 
      message: `Template status changed to ${cert.status}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/certificate/:id
exports.remove = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate template not found' });
    }

    await Certificate.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Certificate template deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/certificate/generate - Validates and formats generation payload
exports.generateCertificates = async (req, res) => {
  try {
    const { templateId, studentIds, certificateDate, academicSession } = req.body;

    if (!templateId) {
      return res.status(400).json({ success: false, message: 'Template ID is required' });
    }

    const template = await Certificate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Certificate template not found' });
    }

    if (template.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Selected certificate template is inactive and cannot be used for generation' });
    }

    const ids = Array.isArray(studentIds) ? studentIds : (studentIds ? [studentIds] : []);
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one student must be selected' });
    }

    const [students, setting] = await Promise.all([
      Student.find({ _id: { $in: ids } }).lean(),
      Setting.findOne().lean()
    ]);

    const formattedDate = certificateDate 
      ? new Date(certificateDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const schoolName = setting?.schoolName || 'Stoofi Public School & College';
    const schoolAddress = setting?.address || 'Main Campus, Lahore, Pakistan';
    const schoolPhone = setting?.phone || '+92 300 1234567';

    const currentYear = new Date().getFullYear();

    const generated = students.map((st, idx) => {
      const fullName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student Name';
      const session = academicSession || st.academicYear || setting?.academicYear || `${currentYear} [Jan-Dec]`;
      const certNo = st.tcNo || `CERT-${currentYear}-${st.admissionNo || String(idx + 1).padStart(4, '0')}`;

      // Mapping table
      const placeholderMap = {
        '[student_name]': fullName,
        '{{studentName}}': fullName,
        '[father_name]': st.fatherName || '-',
        '{{fatherName}}': st.fatherName || '-',
        '[mother_name]': st.motherName || '-',
        '[guardian_name]': st.guardianName || st.fatherName || '-',
        '[admission_no]': st.admissionNo || '-',
        '{{admissionNumber}}': st.admissionNo || '-',
        '[roll_no]': st.rollNo || '-',
        '{{rollNumber}}': st.rollNo || '-',
        '[class_name]': st.className || '-',
        '{{class}}': st.className || '-',
        '[section]': st.section || '-',
        '{{section}}': st.section || '-',
        '[academic_session]': session,
        '{{academicSession}}': session,
        '[academic_year]': session,
        '[dob]': st.dob || '-',
        '[gender]': st.gender || '-',
        '[school_name]': schoolName,
        '{{schoolName}}': schoolName,
        '[school_address]': schoolAddress,
        '{{schoolAddress}}': schoolAddress,
        '[school_phone]': schoolPhone,
        '[certificate_date]': formattedDate,
        '{{certificateDate}}': formattedDate,
        '[issue_date]': formattedDate,
        '[date]': formattedDate,
        '[tc_no]': certNo,
        '[certificate_no]': certNo,
        '{{certificateNumber}}': certNo
      };

      let renderedBody = template.templateBody;
      Object.keys(placeholderMap).forEach(ph => {
        renderedBody = renderedBody.split(ph).join(placeholderMap[ph]);
      });

      return {
        certificateNumber: certNo,
        studentId: st._id,
        studentName: fullName,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo || '-',
        className: st.className,
        section: st.section,
        fatherName: st.fatherName || '-',
        motherName: st.motherName || '-',
        academicSession: session,
        issueDate: formattedDate,
        renderedBody,
        headerTitle: template.headerTitle || template.title,
        headerSubtitle: template.headerSubtitle,
        footerLeft: template.footerLeft || 'Date of Issue',
        footerCenter: template.footerCenter || 'Class Teacher',
        footerRight: template.footerRight || 'Principal',
        themeStyle: template.themeStyle || 'stoofi-emerald',
        schoolName,
        schoolAddress,
        schoolPhone
      };
    });

    res.status(200).json({
      success: true,
      count: generated.length,
      template: {
        _id: template._id,
        title: template.title,
        type: template.type,
        themeStyle: template.themeStyle
      },
      data: generated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
