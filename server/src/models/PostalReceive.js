const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  fromTitle: { type: String, required: true },
  referenceNo: { type: String, required: true },
  address: { type: String },
  note: { type: String },
  toTitle: { type: String, required: true },
  date: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('PostalReceive', schema);
