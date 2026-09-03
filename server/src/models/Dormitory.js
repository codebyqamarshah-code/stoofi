const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  address: String,
  intake: Number,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Dormitory', schema);
