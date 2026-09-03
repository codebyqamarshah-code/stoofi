const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  toTitle: { type: String, required: true },
  referenceNo: { type: String, required: true },
  address: { type: String },
  note: { type: String },
  fromTitle: { type: String, required: true },
  date: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('PostalDispatch', schema);
