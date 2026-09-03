const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  fare: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TransportRoute', schema);
