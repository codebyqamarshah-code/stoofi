const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  gpa: Number,
  percentFrom: Number,
  percentTo: Number,
  gpaFrom: Number,
  gpaTo: Number,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('ExamGrade', schema);
