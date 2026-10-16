const Notification = require('../models/Notification');
const Student = require('../models/Student');

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
    const data = await Student.find(query)
      .lean()
      .sort({ createdAt: -1 })
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
    const { className, section } = req.query;
    const query = {};
    if (className && className !== 'All Classes' && className !== 'All' && className.trim()) {
      const c = className.replace(/^Class\s+/i, '').trim();
      query.className = { $regex: '^(' + className + '|' + c + '|Class\\s*' + c + ')$', $options: 'i' };
    }
    if (section && section !== 'All Sections' && section !== 'All' && section.trim()) {
      const sec = section.replace(/^Section\s+/i, '').trim();
      query.section = { $regex: '^(' + section + '|' + sec + '|Section\\s*' + sec + ')$', $options: 'i' };
    }

    const students = await Student.find(query, 'rollNo firstName lastName admissionNo').lean();
    let maxRoll = 0;
    const usedRolls = [];
    students.forEach(s => {
      if (s.rollNo) {
        const rStr = String(s.rollNo).trim();
        usedRolls.push({
          rollNo: rStr,
          studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
          admissionNo: s.admissionNo || ''
        });
        const num = parseInt(rStr, 10);
        if (!isNaN(num) && num > maxRoll) {
          maxRoll = num;
        }
      }
    });

    const nextRollNo = maxRoll > 0 ? String(maxRoll + 1) : '101';
    res.status(200).json({ 
      success: true, 
      nextRollNo, 
      usedRollNumbers: usedRolls.map(u => u.rollNo),
      usedRolls 
    });
  } catch (err) {
    res.status(200).json({ success: true, nextRollNo: '101', usedRollNumbers: [], usedRolls: [] });
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

    // Check duplicate roll number in class and section
    if (dataObj.rollNo && String(dataObj.rollNo).trim() && dataObj.className && dataObj.section) {
      const rollStr = String(dataObj.rollNo).trim();
      const existingRoll = await Student.findOne({
        className: { $regex: '^' + dataObj.className.trim() + '$', $options: 'i' },
        section: { $regex: '^' + dataObj.section.trim() + '$', $options: 'i' },
        rollNo: rollStr
      });
      if (existingRoll) {
        return res.status(400).json({
          success: false,
          message: `Yeh Roll Number (${rollStr}) pehle se Class ${dataObj.className} (${dataObj.section}) mein mojood hai.`
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

    // Check duplicate roll number in class and section on update
    if (dataObj.rollNo && String(dataObj.rollNo).trim() && dataObj.className && dataObj.section) {
      const rollStr = String(dataObj.rollNo).trim();
      const existingRoll = await Student.findOne({
        _id: { $ne: req.params.id },
        className: { $regex: '^' + dataObj.className.trim() + '$', $options: 'i' },
        section: { $regex: '^' + dataObj.section.trim() + '$', $options: 'i' },
        rollNo: rollStr
      });
      if (existingRoll) {
        return res.status(400).json({
          success: false,
          message: `Yeh Roll Number (${rollStr}) pehle se Class ${dataObj.className} (${dataObj.section}) mein mojood hai.`
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

    let count = await Student.countDocuments();
    const currentYear = new Date().getFullYear();

    const prepared = rawList.map((s, idx) => {
      const studentObj = { ...s };
      if (!studentObj.admissionNo) {
        studentObj.admissionNo = `ADM-${currentYear}-${String(count + idx + 1).padStart(3, '0')}`;
      }
      if (!studentObj.academicYear) {
        studentObj.academicYear = `${currentYear} [Jan-Dec]`;
      }
      return studentObj;
    });

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
        message: `Partially imported ${error.insertedDocs.length} students.`,
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



