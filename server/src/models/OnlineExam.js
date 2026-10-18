const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, default: '' },
  optionD: { type: String, default: '' },
  correctAnswer: { type: String, required: true }, // 'A', 'B', 'C', or 'D'
  marks: { type: Number, default: 1 }
}, { _id: true });

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  examCode: { type: String, unique: true, sparse: true },
  classId: String,
  subjectId: String,
  sectionId: String,
  date: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  duration: { type: Number, default: 30 }, // in minutes
  totalMarks: { type: Number, default: 0 },
  minPercentage: { type: Number, default: 50 },
  instruction: String,
  autoMarkRegister: { type: Boolean, default: false },
  status: { type: String, enum: ['Draft', 'Active', 'Completed', 'Closed'], default: 'Active' },
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('OnlineExam', schema);

