const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  homeworkDate: { type: Date, required: true },
  submissionDate: { type: Date, required: true },
  marks: { type: Number, default: 0 },
  file: { type: String },
  description: { type: String, required: true },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  evaluations: [{
    studentId: { type: String },
    studentName: { type: String },
    admissionNo: { type: String },
    rollNo: { type: String },
    status: { type: String, default: 'Submitted' },
    marksObtained: { type: Number, default: 0 },
    teacherRemarks: { type: String, default: '' },
    evaluatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Homework', schema);
