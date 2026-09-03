const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  name: { type: String, required: true },
  phone: String,
  email: String,
  address: String,
  memberType: { type: String, default: 'student' },
  membershipExpiry: Date

}, { timestamps: true });

module.exports = mongoose.model('LibraryMember', schema);
