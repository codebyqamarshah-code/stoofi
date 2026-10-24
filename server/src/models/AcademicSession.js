const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "2026-2028", "Fall 2026", "2023-2025"
  year: { type: Number, required: true }, // e.g. 2026, 2023
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  isCurrent: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Closed', 'Upcoming'], default: 'Active' }
}, { timestamps: true });

schema.index({ year: -1, status: 1 });

module.exports = mongoose.model('AcademicSession', schema);
