const mongoose = require("mongoose");
const schema = new mongoose.Schema({ 
  student: String, 
  admissionNo: String,
  className: String,
  feeType: String,
  amount: Number, 
  waiver: Number, 
  fine: Number, 
  paid: Number, 
  balance: Number, 
  paymentMethod: { type: String, default: 'Cash' },
  note: String,
  status: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Unpaid' }, 
  date: Date 
}, { timestamps: true });
module.exports = mongoose.model("FeesInvoice", schema);