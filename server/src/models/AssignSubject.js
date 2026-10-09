const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: String, required: true },
  type: { type: String, enum: ['Theory', 'Practical', 'Both'], default: 'Theory' }
}, { timestamps: true });

schema.index({ className: 1, section: 1, subject: 1 });

module.exports = mongoose.model('AssignSubject', schema);
