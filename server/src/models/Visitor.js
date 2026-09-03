const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  purpose: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  idType: { type: String },
  noOfPerson: { type: String },
  date: { type: Date },
  inTime: { type: String },
  outTime: { type: String },
  documentUrl: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Visitor', schema);
