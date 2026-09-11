const Student = require('../models/Student');

exports.getAll = async (req, res) => {
  try {
    const data = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    if (req.file) {
      dataObj.studentPhoto = '/uploads/' + req.file.filename;
    }
    const data = await Student.create(dataObj);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
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


