const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  routeId: { type: String, required: true },
  vehicleId: { type: String, required: true },
  routeTitle: String,
  fare: Number,
  vehicleNo: String,
  driverName: String,
  capacity: Number,
  contact: String
}, { timestamps: true });

module.exports = mongoose.model('TransportAssignVehicle', schema);
