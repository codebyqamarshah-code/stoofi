const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Student = require('../models/Student');

// Helper function to extract numeric sequence from roll number strings (e.g. PRC260001 -> 1, PRC260050 -> 50)
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

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', className, section, rollNo, name } = req.query;
    
    // Build query object
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

    // Convert page/limit to numbers
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with pagination
    // Sort by rollNo ascending (Roll No 1 first), then by createdAt ascending (first enrolled first)
    const data = await Student.find(query)
      .lean()
      .sort({ rollNo: 1, createdAt: 1 })
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.getNextAdmissionNo = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const students = await Student.find({}, 'admissionNo').lean();
    let maxNum = 0;
    students.forEach(s => {
      if (s.admissionNo) {
        const match = String(s.admissionNo).match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    const nextAdmissionNo = `ADM-${currentYear}-${String(nextNum).padStart(3, '0')}`;
    res.status(200).json({ success: true, nextAdmissionNo, nextNum });
  } catch (error) {
    const currentYear = new Date().getFullYear();
    res.status(200).json({ success: true, nextAdmissionNo: `ADM-${currentYear}-001`, nextNum: 1 });
  }
};

exports.getNextRollNo = async (req, res) => {
  try {
    const currentYear2Digits = String(new Date().getFullYear()).slice(-2);
    const prefix = `PRC${currentYear2Digits}`;

    const allStudents = await Student.find({}, 'rollNo firstName lastName admissionNo').lean();
    let maxRoll = 0;
    const usedRolls = [];
    allStudents.forEach(s => {
      if (s.rollNo) {
        const rStr = String(s.rollNo).trim();
        usedRolls.push({
          rollNo: rStr,
          studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
          admissionNo: s.admissionNo || ''
        });
        const num = extractRollSeq(rStr);
        if (num > maxRoll) {
          maxRoll = num;
        }
      }
    });

    const nextRollNo = `${prefix}${String(maxRoll + 1).padStart(4, '0')}`;
    res.status(200).json({ 
      success: true, 
      nextRollNo, 
      usedRollNumbers: usedRolls.map(u => u.rollNo),
      usedRolls 
    });
  } catch (err) {
    const currentYear2Digits = String(new Date().getFullYear()).slice(-2);
    res.status(200).json({ success: true, nextRollNo: `PRC${currentYear2Digits}0001`, usedRollNumbers: [], usedRolls: [] });
  }
};

exports.create = async (req, res) => {
  try {
    const dataObj = { ...req.body };
    const currentYear = new Date().getFullYear();

    // Clean up empty ObjectId / optional fields so Mongoose doesn't fail on cast
    if (!dataObj.studentGroup || dataObj.studentGroup === '' || dataObj.studentGroup === 'undefined' || dataObj.studentGroup === 'null') {
      delete dataObj.studentGroup;
    }
    if (!dataObj.classId || dataObj.classId === '' || dataObj.classId === 'undefined' || dataObj.classId === 'null') {
      delete dataObj.classId;
    }

    // Parse Full Name if single name field was submitted
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

    // Auto-generate or ensure unique sequential admission number
    if (!dataObj.admissionNo || dataObj.admissionNo.trim() === '') {
      const students = await Student.find({}, 'admissionNo').lean();
      let maxNum = 0;
      students.forEach(s => {
        if (s.admissionNo) {
          const match = String(s.admissionNo).match(/(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
      });
      dataObj.admissionNo = `ADM-${currentYear}-${String(maxNum + 1).padStart(3, '0')}`;
    } else {
      const existingAdm = await Student.findOne({ admissionNo: dataObj.admissionNo.trim() });
      if (existingAdm) {
        const students = await Student.find({}, 'admissionNo').lean();
        let maxNum = 0;
        students.forEach(s => {
          if (s.admissionNo) {
            const match = String(s.admissionNo).match(/(\d+)$/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > maxNum) maxNum = num;
            }
          }
        });
        dataObj.admissionNo = `ADM-${currentYear}-${String(maxNum + 1).padStart(3, '0')}`;
      }
    }

    const currentYear2Digits = String(currentYear).slice(-2);
    const rollPrefix = `PRC${currentYear2Digits}`;

    // Auto-assign roll number starting from PRC260001 if not provided
    if (!dataObj.rollNo || String(dataObj.rollNo).trim() === '') {
      const allStudents = await Student.find({}, 'rollNo').lean();
      let maxRollSeq = 0;
      allStudents.forEach(s => {
        const seq = extractRollSeq(s.rollNo);
        if (seq > maxRollSeq) maxRollSeq = seq;
      });
      dataObj.rollNo = `${rollPrefix}${String(maxRollSeq + 1).padStart(4, '0')}`;
    } else {
      // Check duplicate roll number in system
      const rollStr = String(dataObj.rollNo).trim();
      const existingRoll = await Student.findOne({
        rollNo: { $regex: '^' + rollStr + '$', $options: 'i' }
      });
      if (existingRoll) {
        return res.status(400).json({
          success: false,
          message: `Roll Number (${rollStr}) is already assigned in system.`
        });
      }
    }

    if (!dataObj.academicYear) {
      dataObj.academicYear = `${currentYear}-${currentYear + 1}`;
    }
    if (!dataObj.gender) {
      dataObj.gender = 'Male';
    }
    if (!dataObj.dob) {
      dataObj.dob = '2010-01-01';
    }
    if (!dataObj.className) {
      dataObj.className = 'Class 10';
    }
    if (!dataObj.section) {
      dataObj.section = 'Section A';
    }
    // Handle single req.file or multiple req.files array
    if (req.file) {
      if (req.file.fieldname === 'file') dataObj.studentPhoto = '/uploads/' + req.file.filename;
      else dataObj[req.file.fieldname] = '/uploads/' + req.file.filename;
    }
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(f => {
        if (f.fieldname === 'file') dataObj.studentPhoto = '/uploads/' + f.filename;
        else dataObj[f.fieldname] = '/uploads/' + f.filename;
      });
    }
    const data = await Student.create(dataObj);
    
    // Create Notification for Super Admin and Admin
    try {
        await Notification.create([
            {
                title: 'New Student Registration',
                message: `New student ${data.firstName || ''} ${data.lastName || ''} (Adm No: ${data.admissionNo}) has just registered/been added.`,
                type: 'Registration',
                audience: 'Super Admin'
            },
            {
                title: 'New Student Registration',
                message: `New student ${data.firstName || ''} ${data.lastName || ''} (Adm No: ${data.admissionNo}) has just registered/been added.`,
                type: 'Registration',
                audience: 'Admin'
            }
        ]);
    } catch(notifErr) {
        console.log('Notification error:', notifErr);
    }
    
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const dataObj = { ...req.body };

    // Clean up empty ObjectId / optional fields
    if (!dataObj.studentGroup || dataObj.studentGroup === '' || dataObj.studentGroup === 'undefined' || dataObj.studentGroup === 'null') {
      delete dataObj.studentGroup;
    }
    if (!dataObj.classId || dataObj.classId === '' || dataObj.classId === 'undefined' || dataObj.classId === 'null') {
      delete dataObj.classId;
    }

    // Parse Full Name if single name field was submitted
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

    // Check duplicate roll number on update
    if (dataObj.rollNo && String(dataObj.rollNo).trim()) {
      const rollStr = String(dataObj.rollNo).trim();
      const existingRoll = await Student.findOne({
        _id: { $ne: req.params.id },
        rollNo: { $regex: '^' + rollStr + '$', $options: 'i' }
      });
      if (existingRoll) {
        return res.status(400).json({
          success: false,
          message: `Roll Number (${rollStr}) is already assigned in system.`
        });
      }
    }

    // Handle single req.file or multiple req.files array
    if (req.file) {
      if (req.file.fieldname === 'file') dataObj.studentPhoto = '/uploads/' + req.file.filename;
      else dataObj[req.file.fieldname] = '/uploads/' + req.file.filename;
    }
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(f => {
        if (f.fieldname === 'file') dataObj.studentPhoto = '/uploads/' + f.filename;
        else dataObj[f.fieldname] = '/uploads/' + f.filename;
      });
    }

    const data = await Student.findByIdAndUpdate(req.params.id, dataObj, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Student.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkCreate = async (req, res) => {
  try {
    const rawList = Array.isArray(req.body.students) ? req.body.students : (Array.isArray(req.body) ? req.body : []);
    if (!rawList.length) {
      return res.status(400).json({ success: false, message: 'No students provided for import.' });
    }

    const currentYear = new Date().getFullYear();
    const currentYear2Digits = String(currentYear).slice(-2);
    const rollPrefix = `PRC${currentYear2Digits}`;

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

      // CRITICAL: Delete any client-provided pseudo _id (e.g. "stu-17721...") so MongoDB assigns a valid ObjectId
      delete studentObj._id;

      // Delete invalid ObjectIds
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

      // Sensible defaults for required fields
      studentObj.gender = studentObj.gender && String(studentObj.gender).trim() ? String(studentObj.gender).trim() : 'Male';
      studentObj.dob = studentObj.dob && String(studentObj.dob).trim() ? String(studentObj.dob).trim() : '2015-01-01';
      studentObj.className = studentObj.className && String(studentObj.className).trim() ? String(studentObj.className).trim() : 'Class 1';
      studentObj.section = studentObj.section && String(studentObj.section).trim() ? String(studentObj.section).trim() : 'A';
      studentObj.academicYear = studentObj.academicYear && String(studentObj.academicYear).trim() ? String(studentObj.academicYear).trim() : `${currentYear}`;
      studentObj.type = studentObj.type && String(studentObj.type).trim() ? String(studentObj.type).trim() : 'Regular';

      // Unique Admission Number
      const rawAdm = studentObj.admissionNo ? String(studentObj.admissionNo).trim() : '';
      if (!rawAdm || assignedAdmissionNos.has(rawAdm.toLowerCase())) {
        do {
          nextAdmNum += 1;
          const candidateAdm = `ADM-${currentYear}-${String(nextAdmNum).padStart(3, '0')}`;
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

      // Unique Roll Number (PRC26XXXX format, starting from PRC260001)
      const rawRoll = studentObj.rollNo ? String(studentObj.rollNo).trim() : '';
      if (!rawRoll || assignedRolls.has(rawRoll.toLowerCase())) {
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

      if (studentObj.joiningDate) studentObj.joiningDate = String(studentObj.joiningDate).trim();
      if (studentObj.admissionDate) studentObj.admissionDate = String(studentObj.admissionDate).trim();
      if (!studentObj.admissionDate && studentObj.joiningDate) studentObj.admissionDate = studentObj.joiningDate;
      if (!studentObj.joiningDate && studentObj.admissionDate) studentObj.joiningDate = studentObj.admissionDate;

      if (studentObj.fatherOccupation) studentObj.fatherOccupation = String(studentObj.fatherOccupation).trim();
      if (studentObj.motherOccupation) studentObj.motherOccupation = String(studentObj.motherOccupation).trim();
      if (studentObj.fatherCnic) studentObj.fatherCnic = String(studentObj.fatherCnic).trim();
      if (studentObj.fatherName) studentObj.fatherName = String(studentObj.fatherName).trim();
      if (studentObj.motherName) studentObj.motherName = String(studentObj.motherName).trim();
      if (studentObj.bloodGroup) studentObj.bloodGroup = String(studentObj.bloodGroup).trim();
      if (studentObj.religion) studentObj.religion = String(studentObj.religion).trim();
      if (studentObj.type) studentObj.type = String(studentObj.type).trim();

      if (studentObj.city) studentObj.city = String(studentObj.city).trim();
      if (studentObj.address) studentObj.address = String(studentObj.address).trim();
      if (studentObj.currentAddress) studentObj.currentAddress = String(studentObj.currentAddress).trim();
      if (studentObj.permanentAddress) studentObj.permanentAddress = String(studentObj.permanentAddress).trim();
      if (!studentObj.address && studentObj.currentAddress) studentObj.address = studentObj.currentAddress;
      if (!studentObj.currentAddress && studentObj.address) studentObj.currentAddress = studentObj.address;
      if (!studentObj.permanentAddress && studentObj.currentAddress) studentObj.permanentAddress = studentObj.currentAddress;

      // Ensure Executive Navy Horizontal card defaults for imported students
      if (!studentObj.cardTemplate) studentObj.cardTemplate = 'classic-navy';
      if (!studentObj.cardLayout) studentObj.cardLayout = 'horizontal';
      if (!studentObj.themeStyle) studentObj.themeStyle = 'classic-navy';

      prepared.push(studentObj);
    }

    if (!prepared.length) {
      return res.status(400).json({ success: false, message: 'No valid student rows to import.' });
    }

    const result = await Student.insertMany(prepared, { ordered: false });
    res.status(201).json({
      success: true,
      message: `Successfully imported ${result.length} students.`,
      count: result.length,
      data: result
    });
  } catch (error) {
    if (error.insertedDocs && error.insertedDocs.length > 0) {
      return res.status(201).json({
        success: true,
        message: `Successfully imported ${error.insertedDocs.length} students.`,
        count: error.insertedDocs.length,
        data: error.insertedDocs
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.promoteStudents = async (req, res) => {
  try {
    const { promotions, promoteSession, promoteClass, promoteSection } = req.body;

    let updatedCount = 0;
    const updatedIds = [];

    if (Array.isArray(promotions) && promotions.length > 0) {
      for (const item of promotions) {
        if (!item.studentId) continue;
        const student = await Student.findById(item.studentId);
        if (student) {
          const updateFields = {
            previousClassCovered: student.className,
            className: item.promoteClass || promoteClass || student.className,
            section: item.promoteSection || promoteSection || student.section,
            academicYear: item.promoteSession || promoteSession || student.academicYear
          };
          if (item.rollNo) updateFields.rollNo = item.rollNo;
          await Student.findByIdAndUpdate(item.studentId, updateFields);
          updatedCount++;
          updatedIds.push(item.studentId);
        }
      }
    } else if (Array.isArray(req.body.studentIds) && req.body.studentIds.length > 0) {
      for (const id of req.body.studentIds) {
        const student = await Student.findById(id);
        if (student) {
          await Student.findByIdAndUpdate(id, {
            previousClassCovered: student.className,
            className: promoteClass || student.className,
            section: promoteSection || student.section,
            academicYear: promoteSession || student.academicYear
          });
          updatedCount++;
          updatedIds.push(id);
        }
      }
    } else {
      return res.status(400).json({ success: false, message: 'No student promotions provided.' });
    }

    res.status(200).json({
      success: true,
      message: `Successfully promoted ${updatedCount} student(s).`,
      count: updatedCount,
      updatedIds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const rawIds = req.body?.ids || req.body?.studentIds || req.body;
    const ids = Array.isArray(rawIds) ? rawIds : [];
    if (!ids.length) {
      return res.status(400).json({ success: false, message: 'No student IDs provided for deletion.' });
    }
    const result = await Student.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} student(s).`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.publicVerify = async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Identifier is required' });
    }

    const clean = String(identifier).trim();
    let student = null;

    if (mongoose.Types.ObjectId.isValid(clean)) {
      student = await Student.findById(clean).lean();
    }

    if (!student) {
      student = await Student.findOne({
        $or: [
          { admissionNo: { $regex: '^' + clean + '$', $options: 'i' } },
          { rollNo: { $regex: '^' + clean + '$', $options: 'i' } }
        ]
      }).lean();
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student record found for verification ID: ' + clean
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      college: 'Pak Royal College Sharaqpur',
      data: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        className: student.className,
        section: student.section,
        academicYear: student.academicYear,
        fatherName: student.fatherName,
        gender: student.gender,
        dob: student.dob,
        joiningDate: student.joiningDate || student.admissionDate,
        cnic: student.cnic || student.bForm,
        type: student.type || 'Regular',
        studentPhoto: student.studentPhoto,
        status: student.status || 'Active'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



