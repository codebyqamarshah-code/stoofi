const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  examId: String,
  classId: String,
  sectionId: String,
  subjectId: String,
  studentId: String,
  marks: Number,
  totalMarks: Number,
  grade: String,
  gpa: Number,
  remarks: String

}, { timestamps: true });

module.exports = mongoose.model('MarksRegister', schema);
