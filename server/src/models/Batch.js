const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "Batch 2026 - Morning"
  code: { type: String, default: '' },
  offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgramOffering', required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  shift: { type: String, enum: ['Morning', 'Evening', 'Weekend'], default: 'Morning' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  capacity: { type: Number, default: 60 },
  currentEnrolled: { type: Number, default: 0 },
  roomNumber: { type: String, default: '' },
  coordinatorName: { type: String, default: '' },
  sections: [{ type: String, default: 'A' }],
  status: { type: String, enum: ['Active', 'Completed', 'Upcoming'], default: 'Active' }
}, { timestamps: true });

schema.index({ offeringId: 1, status: 1 });

module.exports = mongoose.model('Batch', schema);
