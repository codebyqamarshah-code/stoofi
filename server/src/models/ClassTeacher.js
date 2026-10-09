const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  teacher: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

// Ensure unique class + section class teacher or allow multiple
schema.index({ className: 1, section: 1 });

module.exports = mongoose.model('ClassTeacher', schema);
