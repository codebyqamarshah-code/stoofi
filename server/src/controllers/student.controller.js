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
      query.className = { $regex: `^(${className}|${c})$`, $options: 'i' };
    }
    if (section && section !== 'All Sections' && section !== 'All' && section.trim()) {
      const sec = section.replace(/^Section\s+/i, '').trim();
      query.section = { $regex: `^(${section}|${sec})$`, $options: 'i' };
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

exports.create = async (req, res) => {
  try {
    const dataObj = { ...req.body };
    if (!dataObj.admissionNo) {
      const count = await Student.countDocuments();
      dataObj.admissionNo = 'ADM-' + new Date().getFullYear() + '-' + String(count + 1).padStart(3, '0');
    }
    // Just handle one file for now, or if multiple we'd iterate
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
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const dataObj = { ...req.body };
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


