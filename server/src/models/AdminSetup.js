const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  type: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('AdminSetup', schema);
