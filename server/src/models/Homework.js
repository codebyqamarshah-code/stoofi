const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  homeworkDate: { type: Date, required: true },
  submissionDate: { type: Date, required: true },
  marks: { type: Number, required: true },
  file: { type: String },
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Homework', schema);
