const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  bookId: { type: String, required: true },
  memberId: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  returnDate: Date,
  status: { type: String, default: 'issued' },
  fine: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('IssueBook', schema);
