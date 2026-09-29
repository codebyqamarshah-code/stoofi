const mongoose = require('mongoose');

const admissionQuerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  source: { type: String },
  status: { type: String, default: 'Interested' },
  queryDate: { type: Date },
  lastFollowUpDate: { type: Date },
  nextFollowUpDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AdmissionQuery', admissionQuerySchema);
