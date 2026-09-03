const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  staffId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'present' },
  remarks: String

}, { timestamps: true });

module.exports = mongoose.model('StaffAttendance', schema);
