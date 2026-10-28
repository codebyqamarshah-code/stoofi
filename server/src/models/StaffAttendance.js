const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  staffId: { type: String, required: true },
  staffNo: String,
  name: String,
  role: String,
  department: String,
  designation: String,
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Present' },
  note: String,
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('StaffAttendance', schema);
