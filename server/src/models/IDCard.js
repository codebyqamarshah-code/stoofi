const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  title: { type: String, required: true },
  role: { type: String, required: true }

}, { timestamps: true });

module.exports = mongoose.model('IDCard', schema);
