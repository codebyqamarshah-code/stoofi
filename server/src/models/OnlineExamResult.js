const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OnlineExam',
    required: true
  },
  examTitle: { type: String, default: '' },
  subjectName: { type: String, default: '' },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  studentName: { type: String, default: '' },
  admissionNo: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  className: { type: String, default: '' },
  section: { type: String, default: '' },
  answers: {
    type: Map,
    of: String // questionId or index -> chosenOption ('A', 'B', 'C', 'D')
  },
  totalQuestions: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Passed', 'Failed'],
    default: 'Passed'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('OnlineExamResult', resultSchema);
