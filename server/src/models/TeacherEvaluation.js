const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  teacherId: String,
  teacherName: String,
  staffId: String,
  subject: String,
  classSection: String,
  evaluatorId: String,
  evaluatedBy: String,
  submittedBy: String,
  rating: mongoose.Schema.Types.Mixed,
  score: Number,
  scorePercent: Number,
  comment: String,
  comments: String,
  criteria: mongoose.Schema.Types.Mixed,
  status: { type: String, default: 'Approved' },
  date: String,
  approvedOn: String
}, { timestamps: true, strict: false });

module.exports = mongoose.model('TeacherEvaluation', schema);
