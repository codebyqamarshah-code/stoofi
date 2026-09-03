const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  feesGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'FeesGroup', required: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FeesType', schema);
