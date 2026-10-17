const TransportVehicle = require('../models/TransportVehicle');

exports.getAll = async (req, res) => {
  try {
    const data = await TransportVehicle.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const vehicleNo = (req.body.vehicleNo || '').trim();
    if (!vehicleNo) {
      return res.status(400).json({ success: false, message: 'Vehicle Number is required' });
    }
    const data = await TransportVehicle.create({
      vehicleNo,
      vehicleModel: req.body.vehicleModel || '',
      yearMade: req.body.yearMade || '',
      capacity: Number(req.body.capacity) || 0,
      driverName: req.body.driverName || '',
      driverLicense: req.body.driverLicense || '',
      contact: req.body.contact || '',
      note: req.body.note || ''
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await TransportVehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await TransportVehicle.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
