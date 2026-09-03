const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('BookCategory', schema);
