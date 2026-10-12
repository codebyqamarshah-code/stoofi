const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  class: { type: String, required: true },
  subject: { type: String, required: true },
  lesson: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', schema);
