const AcademicCategory = require('../models/AcademicCategory');
const Affiliation = require('../models/Affiliation');
const Campus = require('../models/Campus');
const AcademicSession = require('../models/AcademicSession');
const Program = require('../models/Program');
const ProgramOffering = require('../models/ProgramOffering');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const StudentEnrollment = require('../models/StudentEnrollment');
const FeesInvoice = require('../models/FeesInvoice');
const { ensureAcademicHierarchySeeded } = require('../services/academicSeed.service');
const { 
  extractYear, 
  generateAdmissionNumber, 
  generateRollNumber, 
  generateStudentCode,
  previewNextAdmissionNumber,
  previewNextRollNumber
} = require('../services/admissionSequence.service');

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllCategories = async (req, res) => {
  try {
    await ensureAcademicHierarchySeeded();
    const categories = await AcademicCategory.find().sort({ displayOrder: 1, createdAt: 1 }).lean();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, code, description, applicableStageType, displayOrder, status } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and Code are required.' });
    }
    const cat = await AcademicCategory.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      applicableStageType: applicableStageType || 'Semester',
      displayOrder: displayOrder || 0,
      status: status || 'Active'
    });
    res.status(201).json({ success: true, data: cat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const cat = await AcademicCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.status(200).json({ success: true, data: cat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const count = await Program.countDocuments({ category: req.params.id });
    if (count > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${count} programs are linked to this category.` });
    }
    await AcademicCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAMS
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllPrograms = async (req, res) => {
  try {
    await ensureAcademicHierarchySeeded();
    const query = {};
    if (req.query.categoryId) query.category = req.query.categoryId;
    if (req.query.status) query.status = req.query.status;

    const programs = await Program.find(query).populate('category', 'name code').sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { name, code, qualificationName, category, department, description, academicPattern, defaultDuration, totalStages, stageType, status } = req.body;
    if (!name || !code || !category) {
      return res.status(400).json({ success: false, message: 'Name, Code, and Category are required.' });
    }
    const catDoc = await AcademicCategory.findById(category);
    const prog = await Program.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      qualificationName: qualificationName || '',
      category,
      categoryName: catDoc ? catDoc.name : '',
      department: department || 'Academics',
      description: description || '',
      academicPattern: academicPattern || 'Annual',
      defaultDuration: defaultDuration || '2 Years',
      totalStages: totalStages || 2,
      stageType: stageType || 'Part',
      status: status || 'Active'
    });
    res.status(201).json({ success: true, data: prog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    if (req.body.category) {
      const cat = await AcademicCategory.findById(req.body.category);
      if (cat) req.body.categoryName = cat.name;
    }
    const prog = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prog) return res.status(404).json({ success: false, message: 'Program not found.' });
    res.status(200).json({ success: true, data: prog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const count = await ProgramOffering.countDocuments({ programId: req.params.id });
    if (count > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${count} offerings exist for this program.` });
    }
    await Program.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Program deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AFFILIATIONS & AWARDING BODIES
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllAffiliations = async (req, res) => {
  try {
    await ensureAcademicHierarchySeeded();
    const affiliations = await Affiliation.find().sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: affiliations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAffiliation = async (req, res) => {
  try {
    const { name, code, type, approvalReference, verificationEvidence, validityFrom, validityTo, contactPerson, contactPhone, contactEmail, address, authorizationStatus, isActive } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and Code are required.' });
    }
    const aff = await Affiliation.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type: type || 'Technical Board',
      approvalReference: approvalReference || '',
      verificationEvidence: verificationEvidence || '',
      validityFrom: validityFrom || '',
      validityTo: validityTo || '',
      contactPerson: contactPerson || '',
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      address: address || '',
      authorizationStatus: authorizationStatus || 'Approved',
      isActive: isActive !== false
    });
    res.status(201).json({ success: true, data: aff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAffiliation = async (req, res) => {
  try {
    const aff = await Affiliation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!aff) return res.status(404).json({ success: false, message: 'Affiliation not found.' });
    res.status(200).json({ success: true, data: aff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAffiliation = async (req, res) => {
  try {
    const count = await ProgramOffering.countDocuments({ affiliationId: req.params.id });
    if (count > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${count} offerings use this affiliation.` });
    }
    await Affiliation.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Affiliation deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CAMPUSES & SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllCampuses = async (req, res) => {
  try {
    await ensureAcademicHierarchySeeded();
    const campuses = await Campus.find().sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: campuses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCampus = async (req, res) => {
  try {
    const { name, code, address, phone, email, status, isMainCampus } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and Code are required.' });
    const c = await Campus.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address || '',
      phone: phone || '',
      email: email || '',
      status: status || 'Active',
      isMainCampus: !!isMainCampus
    });
    res.status(201).json({ success: true, data: c });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    await ensureAcademicHierarchySeeded();
    const sessions = await AcademicSession.find().sort({ year: -1 }).lean();
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { name, year, startDate, endDate, isCurrent, status } = req.body;
    if (!name || !year) return res.status(400).json({ success: false, message: 'Name and Year are required.' });
    if (isCurrent) {
      await AcademicSession.updateMany({}, { $set: { isCurrent: false } });
    }
    const s = await AcademicSession.create({
      name: name.trim(),
      year: parseInt(year, 10),
      startDate: startDate || '',
      endDate: endDate || '',
      isCurrent: !!isCurrent,
      status: status || 'Active'
    });
    res.status(201).json({ success: true, data: s });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAM OFFERINGS
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllOfferings = async (req, res) => {
  try {
    await ensureAcademicHierarchySeeded();
    const query = {};

    if (req.query.categoryId) query.categoryId = req.query.categoryId;
    if (req.query.programId) query.programId = req.query.programId;
    if (req.query.campusId) query.campusId = req.query.campusId;
    if (req.query.sessionYear) query.sessionYear = parseInt(req.query.sessionYear, 10);
    
    // For admission selection: only approved and active offerings with available capacity
    if (req.query.onlyActive === 'true') {
      query.status = 'Approved';
      query.isActive = true;
    }

    const offerings = await ProgramOffering.find(query)
      .populate('programId')
      .populate('categoryId')
      .populate('campusId')
      .populate('affiliationId')
      .populate('sessionId')
      .sort({ sessionYear: -1, programName: 1 })
      .lean();

    res.status(200).json({ success: true, data: offerings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOfferingById = async (req, res) => {
  try {
    const offering = await ProgramOffering.findById(req.params.id)
      .populate('programId')
      .populate('categoryId')
      .populate('campusId')
      .populate('affiliationId')
      .populate('sessionId')
      .lean();

    if (!offering) return res.status(404).json({ success: false, message: 'Offering not found.' });

    // Also fetch associated batches
    const batches = await Batch.find({ offeringId: offering._id, status: 'Active' }).lean();

    res.status(200).json({ success: true, data: { ...offering, batches } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOffering = async (req, res) => {
  try {
    const { 
      programId, 
      campusId, 
      affiliationId, 
      sessionId, 
      curriculumVersion, 
      seatCapacity, 
      admissionStartDate, 
      admissionEndDate, 
      feePlan, 
      documentRequirements, 
      dynamicFieldSchema,
      status 
    } = req.body;

    if (!programId || !affiliationId) {
      return res.status(400).json({ success: false, message: 'Program and Affiliation are required.' });
    }

    const [prog, aff, camp, sess] = await Promise.all([
      Program.findById(programId),
      Affiliation.findById(affiliationId),
      campusId ? Campus.findById(campusId) : Campus.findOne(),
      sessionId ? AcademicSession.findById(sessionId) : AcademicSession.findOne({ isCurrent: true })
    ]);

    if (!prog) return res.status(404).json({ success: false, message: 'Selected program does not exist.' });
    if (!aff) return res.status(404).json({ success: false, message: 'Selected affiliation does not exist.' });

    // Validate affiliation status
    if (aff.authorizationStatus !== 'Approved') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot create offering: Affiliation "${aff.name}" is not approved (Status: ${aff.authorizationStatus}).` 
      });
    }

    const sessionYear = sess?.year || new Date().getFullYear();
    const title = `${prog.name} — ${sess?.name || sessionYear} (${aff.name})`;

    const offering = await ProgramOffering.create({
      title,
      programId: prog._id,
      programName: prog.name,
      programCode: prog.code,
      categoryId: prog.category,
      categoryName: prog.categoryName,
      campusId: camp?._id,
      campusName: camp?.name || 'Main Campus',
      affiliationId: aff._id,
      affiliationName: aff.name,
      sessionId: sess?._id,
      sessionName: sess?.name || `${sessionYear}-${sessionYear + 2}`,
      sessionYear,
      curriculumVersion: curriculumVersion || 'Standard v1.0',
      duration: prog.defaultDuration,
      academicPattern: prog.academicPattern,
      stageType: prog.stageType,
      totalStages: prog.totalStages,
      admissionStartDate: admissionStartDate || '',
      admissionEndDate: admissionEndDate || '',
      seatCapacity: parseInt(seatCapacity, 10) || 60,
      feePlan: feePlan || {
        admissionFee: 5000,
        tuitionFeePerTerm: 25000,
        registrationFee: 3000,
        labPracticalFee: 2000,
        examFee: 2000,
        libraryFee: 1000,
        totalEstimate: 38000,
        installmentsAllowed: true,
        installmentsCount: 2
      },
      documentRequirements: documentRequirements || [
        { name: 'Student Photograph', key: 'photo', required: true },
        { name: 'Student CNIC or B-Form', key: 'cnicFront', required: true },
        { name: 'Father / Guardian CNIC', key: 'cnicBack', required: true },
        { name: 'Matric / SSC Certificate & Marksheet', key: 'qualificationDocument', required: true }
      ],
      dynamicFieldSchema: dynamicFieldSchema || [],
      status: status || 'Approved',
      isActive: true
    });

    // Automatically create default Batch
    await Batch.create({
      name: `${prog.code} ${sessionYear} - Morning`,
      code: `${prog.code}-${String(sessionYear).slice(-2)}M`,
      offeringId: offering._id,
      programId: prog._id,
      shift: 'Morning',
      capacity: offering.seatCapacity,
      currentEnrolled: 0,
      sections: ['A', 'B'],
      status: 'Active'
    });

    res.status(201).json({ success: true, data: offering });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateOffering = async (req, res) => {
  try {
    const offering = await ProgramOffering.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offering) return res.status(404).json({ success: false, message: 'Offering not found.' });
    res.status(200).json({ success: true, data: offering });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteOffering = async (req, res) => {
  try {
    const enrolled = await StudentEnrollment.countDocuments({ offeringId: req.params.id });
    if (enrolled > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete offering: ${enrolled} students are already enrolled.` });
    }
    await ProgramOffering.findByIdAndDelete(req.params.id);
    await Batch.deleteMany({ offeringId: req.params.id });
    res.status(200).json({ success: true, message: 'Offering deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BATCHES & SECTIONS
// ─────────────────────────────────────────────────────────────────────────────

exports.getBatches = async (req, res) => {
  try {
    const query = {};
    if (req.query.offeringId) query.offeringId = req.query.offeringId;
    if (req.query.status) query.status = req.query.status;

    const batches = await Batch.find(query).sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBatch = async (req, res) => {
  try {
    const { name, code, offeringId, shift, startDate, endDate, capacity, roomNumber, coordinatorName, sections, status } = req.body;
    if (!name || !offeringId) return res.status(400).json({ success: false, message: 'Name and Offering are required.' });

    const off = await ProgramOffering.findById(offeringId);
    if (!off) return res.status(404).json({ success: false, message: 'Offering not found.' });

    const batch = await Batch.create({
      name: name.trim(),
      code: code ? code.trim() : `${off.programCode}-B`,
      offeringId,
      programId: off.programId,
      shift: shift || 'Morning',
      startDate: startDate || '',
      endDate: endDate || '',
      capacity: parseInt(capacity, 10) || off.seatCapacity,
      currentEnrolled: 0,
      roomNumber: roomNumber || '',
      coordinatorName: coordinatorName || '',
      sections: sections && Array.isArray(sections) && sections.length ? sections : ['A'],
      status: status || 'Active'
    });

    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEQUENCE NUMBER PREVIEW & RECONCILIATION
// ─────────────────────────────────────────────────────────────────────────────

exports.getNextNumbers = async (req, res) => {
  try {
    const year = extractYear(req.query.year || req.query.admissionDate);
    const [nextAdmissionNumber, nextRollNumber] = await Promise.all([
      previewNextAdmissionNumber(year),
      previewNextRollNumber(year)
    ]);

    res.status(200).json({
      success: true,
      year,
      nextAdmissionNumber,
      nextRollNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH EXISTING STUDENT FOR MULTI-ENROLLMENT
// ─────────────────────────────────────────────────────────────────────────────

exports.searchExistingStudent = async (req, res) => {
  try {
    const q = String(req.query.q || req.query.query || '').trim();
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Clean input without hyphens for flexible CNIC / Phone searching
    const digitsOnly = q.replace(/\D/g, '');

    const orConditions = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { admissionNo: { $regex: q, $options: 'i' } },
      { rollNo: { $regex: q, $options: 'i' } },
      { studentCode: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];

    if (q.includes('-') || digitsOnly.length >= 5) {
      orConditions.push({ cnic: { $regex: q, $options: 'i' } });
      orConditions.push({ bForm: { $regex: q, $options: 'i' } });
    }
    if (digitsOnly.length >= 7) {
      orConditions.push({ phone: { $regex: digitsOnly, $options: 'i' } });
      orConditions.push({ whatsapp: { $regex: digitsOnly, $options: 'i' } });
    }

    const students = await Student.find({ $or: orConditions })
      .select('firstName lastName studentCode admissionNo rollNo cnic bForm phone email fatherName guardianName className section studentPhoto photo dob gender')
      .limit(10)
      .lean();

    // Attach active enrollments to each student
    const studentIds = students.map(s => s._id);
    const enrollments = await StudentEnrollment.find({ studentId: { $in: studentIds } }).lean();

    const result = students.map(st => {
      const stEnrollments = enrollments.filter(e => String(e.studentId) === String(st._id));
      return {
        ...st,
        fullName: `${st.firstName || ''} ${st.lastName || ''}`.trim(),
        enrollments: stEnrollments
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// END-TO-END ATOMIC ADMISSION CREATION (ONE STUDENT -> MULTIPLE ENROLLMENTS)
// ─────────────────────────────────────────────────────────────────────────────

exports.createAdmission = async (req, res) => {
  try {
    const body = req.body || {};

    // 1. Basic validation
    const firstName = String(body.firstName || '').trim();
    if (!firstName) {
      return res.status(400).json({ success: false, message: 'Student First Name is required.' });
    }

    const offeringId = body.offeringId;
    if (!offeringId) {
      return res.status(400).json({ success: false, message: 'Please select an academic Program Offering.' });
    }

    // 2. Validate Offering
    const offering = await ProgramOffering.findById(offeringId)
      .populate('programId')
      .populate('affiliationId');

    if (!offering) {
      return res.status(404).json({ success: false, message: 'Selected program offering was not found.' });
    }
    if (offering.status !== 'Approved' || offering.isActive === false) {
      return res.status(400).json({ 
        success: false, 
        message: `Offering "${offering.title}" is not available for admission (Status: ${offering.status}).` 
      });
    }

    // Validate seat capacity
    if (offering.seatCapacity && offering.enrolledCount >= offering.seatCapacity) {
      // Allow override only if specifically approved
      if (!body.allowCapacityOverride) {
        return res.status(400).json({ 
          success: false, 
          message: `Program offering has reached full capacity (${offering.enrolledCount}/${offering.seatCapacity} seats).` 
        });
      }
    }

    // 3. Determine Admission Year from date
    const admissionDate = body.admissionDate || new Date().toISOString().split('T')[0];
    const admissionYear = extractYear(body.admissionYear || admissionDate);

    // 4. Batch & Section lookup
    let batch = null;
    if (body.batchId) {
      batch = await Batch.findById(body.batchId);
    }
    if (!batch) {
      batch = await Batch.findOne({ offeringId: offering._id, status: 'Active' });
    }

    const sectionName = body.sectionName || body.section || (batch?.sections?.[0]) || 'A';
    const shift = body.shift || batch?.shift || 'Morning';

    // 5. Existing Student lookup or create Permanent Profile
    let student = null;
    let isExistingStudent = false;

    // A. Check if explicit studentId passed (e.g. from Existing Student search)
    if (body.studentId && body.studentId !== 'new') {
      student = await Student.findById(body.studentId);
      if (student) isExistingStudent = true;
    }

    // B. Check by CNIC or B-Form if provided
    if (!student && body.cnic && body.cnic.trim()) {
      student = await Student.findOne({ cnic: body.cnic.trim() });
      if (student) isExistingStudent = true;
    }

    // Prevent duplicate enrollment in the EXACT SAME offering & batch unless readmission
    if (student) {
      const existingEnrollment = await StudentEnrollment.findOne({
        studentId: student._id,
        offeringId: offering._id,
        batchId: batch?._id,
        enrollmentStatus: { $in: ['Active', 'Pending'] }
      });

      if (existingEnrollment && !body.allowReadmission) {
        return res.status(400).json({
          success: false,
          message: `This student is already actively enrolled in this program offering (${offering.programName}).`
        });
      }
    }

    // 6. Generate Concurrency-Safe Year-Based Identifiers
    // Generate official Admission Number and Roll Number atomically for this admissionYear
    const admGen = await generateAdmissionNumber(admissionYear);
    const rollGen = await generateRollNumber(admissionYear);
    const officialAdmissionNo = admGen.admissionNumber;
    const officialRollNo = rollGen.rollNumber;

    // 7. Update or Create Permanent Student Record
    if (isExistingStudent && student) {
      // Re-use permanent student profile, update any changed contact info
      student.phone = body.phone || student.phone;
      student.whatsapp = body.whatsapp || student.whatsapp;
      student.email = body.email || student.email;
      student.currentAddress = body.currentAddress || student.currentAddress;
      student.activeEnrollmentCount = (student.activeEnrollmentCount || 1) + 1;

      // Update legacy pointers to latest program for backward compatibility
      student.className = offering.programName;
      student.section = sectionName;
      student.admissionNo = officialAdmissionNo;
      student.rollNo = officialRollNo;
      student.academicYear = String(admissionYear);

      await student.save();
    } else {
      // Generate permanent Student Code
      const codeGen = await generateStudentCode(admissionYear);
      const studentCode = codeGen.studentCode;

      const studentData = {
        studentCode,
        firstName,
        lastName: body.lastName || '',
        gender: body.gender || 'Male',
        dob: body.dob || '2005-01-01',
        religion: body.religion || 'Islam',
        caste: body.caste || '',
        bloodGroup: body.bloodGroup || 'B+',
        nationality: body.nationality || 'Pakistani',
        cnic: body.cnic ? body.cnic.trim() : undefined,
        bForm: body.bForm ? body.bForm.trim() : undefined,
        studentPhoto: body.studentPhoto || body.photo || '',
        phone: body.phone ? body.phone.trim() : '',
        whatsapp: body.whatsapp ? body.whatsapp.trim() : (body.phone ? body.phone.trim() : ''),
        email: body.email ? body.email.trim().toLowerCase() : undefined,
        currentAddress: body.currentAddress || body.address || '',
        permanentAddress: body.permanentAddress || body.address || '',
        city: body.city || 'Sharaqpur Sharif',
        emergencyContactName: body.emergencyContactName || body.guardianName || '',
        emergencyContactPhone: body.emergencyContactPhone || body.guardianPhone || '',
        emergencyContactRelation: body.emergencyContactRelation || body.guardianRelation || 'Guardian',
        fatherName: body.fatherName || '',
        fatherPhone: body.fatherPhone || '',
        fatherOccupation: body.fatherOccupation || '',
        fatherCnic: body.fatherCnic || '',
        motherName: body.motherName || '',
        motherPhone: body.motherPhone || '',
        guardianName: body.guardianName || body.fatherName || '',
        guardianRelation: body.guardianRelation || 'Father',
        guardianPhone: body.guardianPhone || body.fatherPhone || '',
        guardianAddress: body.guardianAddress || body.currentAddress || '',
        guardianCnic: body.guardianCnic || body.fatherCnic || '',
        guardianOccupation: body.guardianOccupation || body.fatherOccupation || '',
        isPermanentProfile: true,
        activeEnrollmentCount: 1,

        // Legacy compatibility fields
        className: offering.programName,
        section: sectionName,
        admissionNo: officialAdmissionNo,
        rollNo: officialRollNo,
        admissionDate,
        joiningDate: body.joiningDate || admissionDate,
        academicYear: String(admissionYear),
        type: body.type || 'Regular',
        status: 'Active'
      };

      student = await Student.create(studentData);
    }

    // 8. Create StudentEnrollment Record
    const feePlan = offering.feePlan || {};
    const totalFee = feePlan.totalEstimate || 38000;
    const concessionAmount = parseFloat(body.concessionAmount || 0) || 0;
    const netPayable = Math.max(0, totalFee - concessionAmount);

    const enrollment = await StudentEnrollment.create({
      studentId: student._id,
      studentCode: student.studentCode,
      studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
      offeringId: offering._id,
      programId: offering.programId,
      categoryId: offering.categoryId,
      campusId: offering.campusId,
      affiliationId: offering.affiliationId,
      sessionId: offering.sessionId,
      batchId: batch?._id,
      programName: offering.programName,
      programCode: offering.programCode,
      categoryName: offering.categoryName,
      campusName: offering.campusName,
      affiliationName: offering.affiliationName,
      sessionName: offering.sessionName,
      batchName: batch?.name || 'Main Batch',
      sectionName,
      shift,
      admissionYear,
      admissionDate,
      admissionNumber: officialAdmissionNo,
      rollNumber: officialRollNo,
      applicationStatus: 'Accepted',
      enrollmentStatus: 'Active',
      externalRegistrationStatus: 'Not Submitted',
      financeStatus: netPayable === 0 ? 'Clear' : 'Partially Paid',
      academicStage: offering.stageType === 'Part' ? 'Part I' : 'Semester 1',
      admissionType: body.admissionType || 'Regular',

      // Previous Qualifications
      previousQualifications: Array.isArray(body.previousQualifications) ? body.previousQualifications : [],

      // Dynamic Fields
      dynamicFields: body.dynamicFields || {},

      // Document Checklist
      documents: Array.isArray(body.documents) ? body.documents : [],

      // Fee Structure Snapshot
      feeStructureSnapshot: {
        admissionFee: feePlan.admissionFee || 5000,
        tuitionFee: feePlan.tuitionFeePerTerm || 25000,
        registrationFee: feePlan.registrationFee || 3000,
        labFee: feePlan.labPracticalFee || 2000,
        examFee: feePlan.examFee || 2000,
        libraryFee: feePlan.libraryFee || 1000,
        totalFee,
        concessionAmount,
        concessionReason: body.concessionReason || '',
        concessionApprovedBy: req.user?.fullName || req.user?.name || 'Administrator',
        netPayable,
        challanGenerated: true,
        challanNumber: `CHL-${admissionYear}-${String(officialAdmissionNo).replace(/\D/g, '')}`
      },

      history: [{
        action: 'Admission Approved & Enrolled',
        fromStatus: 'Draft',
        toStatus: 'Active',
        actor: req.user?.fullName || req.user?.name || 'Administrator',
        timestamp: new Date(),
        reason: 'Online Admission Form Submission'
      }]
    });

    // 9. Increment counters on Offering and Batch
    await ProgramOffering.findByIdAndUpdate(offering._id, { $inc: { enrolledCount: 1 } });
    if (batch?._id) {
      await Batch.findByIdAndUpdate(batch._id, { $inc: { currentEnrolled: 1 } });
    }

    // 10. Generate real FeesInvoice connected to the finance module
    let invoice = null;
    try {
      const challanNo = enrollment.feeStructureSnapshot.challanNumber;
      const billingMonth = `${admissionYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      invoice = await FeesInvoice.create({
        invoiceNo: `INV-${admissionYear}-${officialAdmissionNo.slice(-4)}`,
        challanNo,
        billingMonth,
        dueDate,
        studentId: student._id,
        student: `${student.firstName} ${student.lastName || ''}`.trim(),
        fatherName: student.fatherName || '',
        rollNo: officialRollNo,
        admissionNo: officialAdmissionNo,
        className: offering.programName,
        section: sectionName,
        feeType: 'Admission & Term Fee',
        feeItems: [
          { head: 'Admission Fee', amount: feePlan.admissionFee || 5000 },
          { head: 'Tuition Fee', amount: feePlan.tuitionFeePerTerm || 25000 },
          { head: 'Registration Fee', amount: feePlan.registrationFee || 3000 },
          { head: 'Laboratory / Practical Fee', amount: feePlan.labPracticalFee || 2000 },
          { head: 'Examination Fee', amount: feePlan.examFee || 2000 },
          { head: 'Library Fee', amount: feePlan.libraryFee || 1000 }
        ],
        amount: totalFee,
        waiver: concessionAmount,
        fine: 0,
        paid: 0,
        balance: netPayable,
        paymentMethod: 'Cash',
        note: `Initial Admission Fee Challan for ${offering.programName}`,
        status: 'Unpaid',
        date: new Date()
      });
    } catch (invErr) {
      console.warn('Invoice generation warning:', invErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Student admission successfully created and enrolled!',
      data: {
        student,
        enrollment,
        invoice,
        admissionNumber: officialAdmissionNo,
        rollNumber: officialRollNo,
        isExistingStudent
      }
    });
  } catch (error) {
    console.error('Admission creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to complete admission.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL ENROLLMENTS (WITH FILTERS) OR FOR A SPECIFIC STUDENT
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllEnrollments = async (req, res) => {
  try {
    const query = {};
    if (req.query.studentId) query.studentId = req.query.studentId;
    if (req.query.offeringId) query.offeringId = req.query.offeringId;
    if (req.query.admissionYear) query.admissionYear = parseInt(req.query.admissionYear, 10);
    if (req.query.enrollmentStatus) query.enrollmentStatus = req.query.enrollmentStatus;
    if (req.query.search) {
      const s = req.query.search.trim();
      query.$or = [
        { studentName: { $regex: s, $options: 'i' } },
        { admissionNumber: { $regex: s, $options: 'i' } },
        { rollNumber: { $regex: s, $options: 'i' } },
        { programName: { $regex: s, $options: 'i' } }
      ];
    }

    const enrollments = await StudentEnrollment.find(query)
      .populate('studentId', 'firstName lastName cnic phone studentPhoto dob gender')
      .populate('offeringId')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentStatus, applicationStatus, externalRegistrationStatus, externalRegistrationNumber, academicStage, reason } = req.body;
    const enrollment = await StudentEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });

    const prevStatus = enrollment.enrollmentStatus;

    if (enrollmentStatus) enrollment.enrollmentStatus = enrollmentStatus;
    if (applicationStatus) enrollment.applicationStatus = applicationStatus;
    if (externalRegistrationStatus) enrollment.externalRegistrationStatus = externalRegistrationStatus;
    if (externalRegistrationNumber) enrollment.externalRegistrationNumber = externalRegistrationNumber;
    if (academicStage) enrollment.academicStage = academicStage;

    enrollment.history.push({
      action: `Status updated to ${enrollmentStatus || applicationStatus}`,
      fromStatus: prevStatus,
      toStatus: enrollmentStatus || prevStatus,
      actor: req.user?.fullName || req.user?.name || 'Administrator',
      timestamp: new Date(),
      reason: reason || 'Administrative status change'
    });

    await enrollment.save();

    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
