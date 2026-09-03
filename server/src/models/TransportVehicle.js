const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  vehicleNo: { type: String, required: true },
  capacity: Number,
  driverName: String,
  driverLicense: String,
  contact: String
}, { timestamps: true });

module.exports = mongoose.model('TransportVehicle', schema);
