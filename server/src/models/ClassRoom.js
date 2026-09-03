const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  roomNo: { type: String, required: true },
  capacity: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ClassRoom', schema);
