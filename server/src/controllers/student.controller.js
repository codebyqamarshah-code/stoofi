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


