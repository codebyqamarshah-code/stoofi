const AssignSubject = require('../models/AssignSubject');

exports.getAll = async (req, res) => {
  try {
    const { className, section, subject, teacher, search } = req.query;
    let query = {};
    if (className && className !== 'All') query.className = className;
    if (section && section !== 'All') query.section = section;
    if (subject && subject !== 'All') query.subject = subject;
    if (teacher && teacher !== 'All') query.teacher = teacher;
    if (search && search.trim()) {
      query.$or = [
        { className: { $regex: search.trim(), $options: 'i' } },
        { section: { $regex: search.trim(), $options: 'i' } },
        { subject: { $regex: search.trim(), $options: 'i' } },
        { teacher: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    const data = await AssignSubject.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { className, section, subject, teacher, type = 'Theory' } = req.body;
    if (!className || !section || !subject || !teacher) {
      return res.status(400).json({ success: false, message: 'Class, Section, Subject and Teacher are required' });
    }

    const existing = await AssignSubject.findOne({ className, section, subject, teacher });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This subject is already assigned to this teacher for this class & section' });
    }

    const data = await AssignSubject.create({ className, section, subject, teacher, type });
    res.status(201).json({ success: true, data, message: 'Subject assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await AssignSubject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, data, message: 'Subject assignment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await AssignSubject.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.status(200).json({ success: true, data: {}, message: 'Subject assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
