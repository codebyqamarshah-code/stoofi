const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  name: { type: String, required: true },
  permissions: [String],
  description: String

}, { timestamps: true });

module.exports = mongoose.model('Role', schema);
