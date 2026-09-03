const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  examSystemId: String,
  totalMark: Number,
  distributions: Array
}, { timestamps: true });

module.exports = mongoose.model('ExamSetup', schema);
