const mongoose = require('mongoose');

const admissionQuerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  source: { type: String },
  status: { type: String, default: 'Active' },
  queryDate: { type: Date },
  lastFollowUpDate: { type: Date },
  nextFollowUpDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('AdmissionQuery', admissionQuerySchema);
