const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true }, // e.g. "adm-2023", "adm-2026", "roll-2023", "roll-2026"
  type: { type: String, enum: ['admission', 'roll', 'studentCode'], required: true },
  year: { type: Number, required: true },
  scope: { type: String, default: 'institution' },
  sequence: { type: Number, default: 0, required: true }
}, { timestamps: true });

schema.index({ key: 1 }, { unique: true });
schema.index({ type: 1, year: 1 });

module.exports = mongoose.model('AdmissionCounter', schema);
