const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date },
  description: { type: String },
  nextFollowUpDate: { type: Date },
  callDuration: { type: String },
  note: { type: String },
  callType: { type: String, required: true }

}, { timestamps: true });

module.exports = mongoose.model('PhoneCallLog', schema);
