const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  staffId: String,
  leaveTypeId: String,
  fromDate: Date,
  toDate: Date,
  reason: String,
  status: { type: String, default: 'pending' },
  approvedBy: String,
  remarks: String

}, { timestamps: true });

module.exports = mongoose.model('Leave', schema);
