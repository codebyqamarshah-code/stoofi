const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: '' },
  type: { type: String, enum: ['Theory', 'Practical', 'Both'], default: 'Theory' },
  category: { type: String, default: 'Compulsory' },
  author: { type: String, default: '' },
  className: { type: String, default: '' },
  section: { type: String, default: '' },
  isOptional: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Subject', schema);
