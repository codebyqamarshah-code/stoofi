const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  isAveragePassing: Boolean
}, { timestamps: true });

module.exports = mongoose.model('ExamType', schema);
