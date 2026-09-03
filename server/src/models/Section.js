const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Section', schema);
