const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  sections: [{ type: String }] // e.g. ["A", "B", "2026/2027"]
}, { timestamps: true });

module.exports = mongoose.model('Class', schema);
