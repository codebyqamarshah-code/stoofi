const Subject = require('../models/Subject');

exports.getAll = async (req, res) => {
  try {
    const { isOptional, category, search } = req.query;
    let query = {};
    if (isOptional !== undefined && isOptional !== '') {
      query.isOptional = isOptional === 'true';
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { code: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    const data = await Subject.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }
    const data = await Subject.create(req.body);
    res.status(201).json({ success: true, data, message: 'Subject created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, data, message: 'Subject updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Subject.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, data: {}, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
