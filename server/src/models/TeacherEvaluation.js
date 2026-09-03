const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  teacherId: String,
  evaluatorId: String,
  rating: Number,
  comments: String,
  criteria: String,
  status: { type: String, default: 'pending' }

}, { timestamps: true });

module.exports = mongoose.model('TeacherEvaluation', schema);
