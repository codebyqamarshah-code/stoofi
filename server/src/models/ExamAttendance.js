const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  examId: String,
  classId: String,
  subjectId: String,
  sectionId: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model('ExamAttendance', schema);
