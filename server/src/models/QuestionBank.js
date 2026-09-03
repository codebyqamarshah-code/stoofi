const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  questionGroupId: String,
  question: { type: String, required: true },
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctAnswer: String,
  marks: Number,
  type: { type: String, default: 'mcq' }

}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', schema);
