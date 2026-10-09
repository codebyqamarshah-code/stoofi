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
    const { name, code, type, category, author } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const trimmedName = name.trim();
    const trimmedCode = code ? code.trim() : '';

    // Check duplicate subject with same name
    const existing = await Subject.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Subject "${trimmedName}" already exists.` 
      });
    }

    const data = await Subject.create({
      name: trimmedName,
      code: trimmedCode,
      type: type || 'Theory',
      category: category || 'Compulsory',
      author: author ? author.trim() : ''
    });

    res.status(201).json({ success: true, data, message: 'Subject created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, code, type, category, author } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const trimmedName = name.trim();
    const trimmedCode = code ? code.trim() : '';

    const existing = await Subject.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Subject "${trimmedName}" already exists.` 
      });
    }

    const data = await Subject.findByIdAndUpdate(
      req.params.id, 
      {
        name: trimmedName,
        code: trimmedCode,
        type: type || 'Theory',
        category: category || 'Compulsory',
        author: author ? author.trim() : ''
      }, 
      { new: true }
    );

    if (!data) return res.status(404).json({ success: false, message: 'Subject not found.' });
    res.status(200).json({ success: true, data, message: 'Subject updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Subject.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Subject not found.' });
    res.status(200).json({ success: true, data: {}, message: 'Subject deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

