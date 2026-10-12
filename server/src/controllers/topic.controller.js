const Topic = require('../models/Topic');

exports.getAll = async (req, res) => {
  try {
    const { className, section, subject, lesson, search } = req.query;
    let query = {};
    if (className) query.class = className;
    if (section) query.section = section;
    if (subject) query.subject = subject;
    if (lesson) query.lesson = lesson;
    if (search && search.trim()) {
      query.$or = [
        { topic: { $regex: search.trim(), $options: 'i' } },
        { lesson: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    const data = await Topic.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { class: className, section, subject, lesson, topics, topic } = req.body;
    if (!className || !section || !subject || !lesson) {
      return res.status(400).json({ success: false, message: 'Class, section, subject, and lesson are required' });
    }

    let createdItems = [];
    if (Array.isArray(topics) && topics.length > 0) {
      const docs = topics
        .filter(t => t && String(t).trim())
        .map(t => ({ class: className, section, subject, lesson, topic: String(t).trim() }));
      createdItems = await Topic.insertMany(docs);
    } else if (topic && String(topic).trim()) {
      const doc = await Topic.create({ class: className, section, subject, lesson, topic: String(topic).trim() });
      createdItems = [doc];
    } else {
      return res.status(400).json({ success: false, message: 'At least one topic title is required' });
    }

    res.status(201).json({ success: true, data: createdItems, message: 'Topic(s) saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
