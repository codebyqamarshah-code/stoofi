const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  name: { type: String, required: true }, category: String, code: String

}, { timestamps: true });

module.exports = mongoose.model('LibrarySubject', schema);
