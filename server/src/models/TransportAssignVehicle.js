const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  routeId: String,
  vehicleId: String
}, { timestamps: true });

module.exports = mongoose.model('TransportAssignVehicle', schema);
