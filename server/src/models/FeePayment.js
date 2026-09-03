const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  fine: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  date: { type: Date, default: Date.now },
  note: { type: String },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
