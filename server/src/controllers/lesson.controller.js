const Lesson = require('../models/Lesson');

exports.getAll = async (req, res) => {
  try {
    const { className, subject, search } = req.query;
    let query = {};
    if (className) query.class = className;
    if (subject) query.subject = subject;
    if (search && search.trim()) {
      query.lesson = { $regex: search.trim(), $options: 'i' };
    }
    const data = await Lesson.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { class: className, subject, lessons, lesson } = req.body;
    if (!className || !subject) {
      return res.status(400).json({ success: false, message: 'Class and subject are required' });
    }

    let createdItems = [];
    if (Array.isArray(lessons) && lessons.length > 0) {
      const docs = lessons
        .filter(l => l && String(l).trim())
        .map(l => ({ class: className, subject, lesson: String(l).trim() }));
      createdItems = await Lesson.insertMany(docs);
    } else if (lesson && String(lesson).trim()) {
      const doc = await Lesson.create({ class: className, subject, lesson: String(lesson).trim() });
      createdItems = [doc];
    } else {
      return res.status(400).json({ success: false, message: 'At least one lesson title is required' });
    }

    res.status(201).json({ success: true, data: createdItems, message: 'Lesson(s) saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
