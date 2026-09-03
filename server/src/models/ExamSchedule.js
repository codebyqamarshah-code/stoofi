const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  examId: String,
  classId: String,
  sectionId: String
}, { timestamps: true });

module.exports = mongoose.model('ExamSchedule', schema);
