const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  subjectId: String,
  date: String,
  startTime: String,
  endTime: String,
  room: String
});

const schema = new mongoose.Schema({
  examId: String,
  classId: String,
  sectionId: String,
  scheduleItems: [scheduleItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('ExamSchedule', schema);
