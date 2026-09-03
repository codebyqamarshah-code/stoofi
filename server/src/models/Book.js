const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  categoryId: String,
  subject: String,
  bookNo: String,
  isbnNo: String,
  publisher: String,
  author: String,
  rackNo: String,
  quantity: Number,
  price: Number,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Book', schema);
