const StudentGroup = require('../models/StudentGroup');
const Student = require('../models/Student');

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Group name is required' });
    
    const existing = await StudentGroup.findOne({ name });
    if (existing) return res.status(400).json({ success: false, message: 'Group already exists' });

    const newGroup = await StudentGroup.create({ name });
    res.status(201).json({ success: true, data: newGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getList = async (req, res) => {
  try {
    const groups = await StudentGroup.find().lean().sort({ createdAt: -1 });
    
    // Get student count for each group
    const groupsWithCount = await Promise.all(groups.map(async (g) => {
      const count = await Student.countDocuments({ studentGroup: g._id });
      return { ...g, students: count };
    }));
    
    res.status(200).json({ success: true, data: groupsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await StudentGroup.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Group not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // Check if students are assigned
    const count = await Student.countDocuments({ studentGroup: req.params.id });
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete group with assigned students' });
    }
    
    const deleted = await StudentGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

