const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  staffId: String,
  staffNo: String,
  staffName: String,
  department: { type: String, default: 'Academics' },
  role: { type: String, default: 'Teacher' },
  leaveTypeId: String,
  leaveType: { type: String, default: 'Sick Leave' },
  fromDate: { type: Date, default: Date.now },
  toDate: { type: Date, default: Date.now },
  days: { type: Number, default: 1 },
  reason: String,
  status: { type: String, default: 'pending' },
  appliedDate: { type: Date, default: Date.now },
  approvedBy: String,
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Leave', schema);
