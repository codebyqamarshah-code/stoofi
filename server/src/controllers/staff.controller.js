const Staff = require('../models/Staff');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', role, staffNo } = req.query;
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { staffNo: { $regex: search, $options: 'i' } }
      ];
    }
    if (staffNo) {
      query.staffNo = { $regex: staffNo.trim(), $options: 'i' };
    }
    if (role && role !== 'All' && role !== 'all') {
      query.role = { $regex: new RegExp(`^${role.trim()}$`, 'i') };
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const skip = (pageNumber - 1) * limitNumber;

    const data = await Staff.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Staff.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Staff.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      if (req.file.fieldname === 'file' || req.file.fieldname === 'photo') body.photo = `/uploads/${req.file.filename}`;
      else body[req.file.fieldname] = `/uploads/${req.file.filename}`;
    }
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(f => {
        if (f.fieldname === 'file' || f.fieldname === 'photo') body.photo = `/uploads/${f.filename}`;
        else body[f.fieldname] = `/uploads/${f.filename}`;
      });
    }
    if (!body.role) {
      body.role = 'Teacher';
    }
    const data = await Staff.create(body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      if (req.file.fieldname === 'file' || req.file.fieldname === 'photo') body.photo = `/uploads/${req.file.filename}`;
      else body[req.file.fieldname] = `/uploads/${req.file.filename}`;
    }
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(f => {
        if (f.fieldname === 'file' || f.fieldname === 'photo') body.photo = `/uploads/${f.filename}`;
        else body[f.fieldname] = `/uploads/${f.filename}`;
      });
    }
    const data = await Staff.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Staff.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
