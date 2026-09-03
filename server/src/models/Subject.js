const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  type: { type: String, enum: ['Theory', 'Practical', 'Both'], default: 'Theory' },
  author: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Subject', schema);
