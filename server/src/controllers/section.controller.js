const Section = require('../models/Section');

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    const data = await Section.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Section name is required.' });
    }

    const trimmedName = name.trim();
    const existing = await Section.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Section "${trimmedName}" already exists.` 
      });
    }

    const data = await Section.create({ 
      name: trimmedName, 
      capacity: capacity ? Number(capacity) : undefined 
    });

    res.status(201).json({ 
      success: true, 
      data, 
      message: 'Section added successfully.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Section name is required.' });
    }

    const trimmedName = name.trim();
    const existing = await Section.findOne({ 
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Section "${trimmedName}" already exists.` 
      });
    }

    const data = await Section.findByIdAndUpdate(
      req.params.id, 
      { name: trimmedName, capacity: capacity ? Number(capacity) : undefined }, 
      { new: true }
    );

    if (!data) return res.status(404).json({ success: false, message: 'Section not found.' });
    res.status(200).json({ 
      success: true, 
      data, 
      message: 'Section updated successfully.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Section.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Section not found.' });
    res.status(200).json({ 
      success: true, 
      data: {}, 
      message: 'Section deleted successfully.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

