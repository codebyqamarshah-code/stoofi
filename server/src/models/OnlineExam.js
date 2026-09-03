const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  classId: String,
  subjectId: String,
  sectionId: String,
  date: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  minPercentage: Number,
  instruction: String,
  autoMarkRegister: Boolean
}, { timestamps: true });

module.exports = mongoose.model('OnlineExam', schema);
