const ClassTeacher = require('../models/ClassTeacher');

exports.getAll = async (req, res) => {
  try {
    const { className, section, search } = req.query;
    let query = {};
    if (className && className !== 'All') query.className = className;
    if (section && section !== 'All') query.section = section;
    if (search && search.trim()) {
      query.$or = [
        { className: { $regex: search.trim(), $options: 'i' } },
        { section: { $regex: search.trim(), $options: 'i' } },
        { teacher: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    const data = await ClassTeacher.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { className, section, teacher, teacherId } = req.body;
    if (!className || !section || !teacher) {
      return res.status(400).json({ success: false, message: 'Class, Section and Teacher are required' });
    }
    
    // Check if assignment already exists for this class + section + teacher
    const existing = await ClassTeacher.findOne({ className, section, teacher });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This teacher is already assigned to this class and section' });
    }

    const data = await ClassTeacher.create({ className, section, teacher, teacherId });
    res.status(201).json({ success: true, data, message: 'Class teacher assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await ClassTeacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, data, message: 'Class teacher assignment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await ClassTeacher.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, data: {}, message: 'Class teacher assignment removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
