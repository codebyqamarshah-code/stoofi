const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  name: { type: String, required: true },
  maxDays: Number,
  description: String

}, { timestamps: true });

module.exports = mongoose.model('LeaveType', schema);
