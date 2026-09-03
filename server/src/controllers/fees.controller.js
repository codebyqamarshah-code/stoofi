const FeesGroup = require('../models/FeesGroup');
const FeesType = require('../models/FeesType');

// --- FEES GROUP ---
exports.getFeesGroups = async (req, res) => {
  try {
    const data = await FeesGroup.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeesGroup = async (req, res) => {
  try {
    const data = await FeesGroup.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeesGroup = async (req, res) => {
  try {
    await FeesGroup.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- FEES TYPE ---
exports.getFeesTypes = async (req, res) => {
  try {
    const data = await FeesType.find().populate('feesGroup').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeesType = async (req, res) => {
  try {
    const data = await FeesType.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeesType = async (req, res) => {
  try {
    await FeesType.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
