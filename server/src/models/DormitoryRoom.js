const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  dormitoryId: String,
  roomNumber: String,
  roomType: String,
  numberOfBeds: Number,
  costPerBed: Number,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('DormitoryRoom', schema);
