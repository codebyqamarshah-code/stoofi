const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  vehicleNo: { type: String, required: true },
  vehicleModel: String,
  yearMade: String,
  capacity: Number,
  driverName: String,
  driverLicense: String,
  contact: String,
  note: String
}, { timestamps: true });

module.exports = mongoose.model('TransportVehicle', schema);
