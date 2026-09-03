const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  title: { type: String, required: true },
  type: { type: String, required: true }

}, { timestamps: true });

module.exports = mongoose.model('Certificate', schema);
