const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  complaintType: { type: String, required: true },
  source: { type: String, required: true },
  complaintBy: { type: String, required: true },
  phone: { type: String },
  date: { type: Date },
  description: { type: String },
  actionTaken: { type: String },
  assigned: { type: String },
  note: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Complaint', schema);
