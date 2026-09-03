const AdmissionQuery = require('../models/AdmissionQuery');

exports.getQueries = async (req, res) => {
  try {
    const queries = await AdmissionQuery.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createQuery = async (req, res) => {
  try {
    const query = await AdmissionQuery.create(req.body);
    res.status(201).json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuery = async (req, res) => {
  try {
    const query = await AdmissionQuery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }
    res.status(200).json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuery = async (req, res) => {
  try {
    const query = await AdmissionQuery.findByIdAndDelete(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
