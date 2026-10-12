const ExamType = require('../models/ExamType');

exports.getAll = async (req, res) => {
  try {
    let data = await ExamType.find().sort({ createdAt: 1 });
    if (!data || data.length === 0) {
      const defaultExams = [
        { name: 'First Term Examination 2026', isAveragePassing: true },
        { name: 'Mid Term Examination 2026', isAveragePassing: true },
        { name: 'Final Term Examination 2026', isAveragePassing: true },
        { name: 'Monthly Class Assessment', isAveragePassing: false }
      ];
      data = await ExamType.insertMany(defaultExams);
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const rawName = (req.body.name || '').trim();
    if (!rawName) {
      return res.status(400).json({ success: false, message: 'Exam Name is required' });
    }

    const existing = await ExamType.findOne({ name: { $regex: new RegExp(`^${rawName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Exam "${existing.name}" already exists.` });
    }

    const data = await ExamType.create({ ...req.body, name: rawName });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await ExamType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await ExamType.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
