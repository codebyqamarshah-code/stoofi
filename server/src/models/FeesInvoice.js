const mongoose = require("mongoose");
const schema = new mongoose.Schema({ 
  invoiceNo: String,
  challanNo: String,
  billingMonth: String, // Format: YYYY-MM (e.g. "2026-10")
  dueDate: Date,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  student: String, 
  fatherName: String,
  rollNo: String,
  admissionNo: String,
  className: String,
  section: String,
  feeType: String,
  feeItems: [{
    head: String,
    amount: Number
  }],
  amount: Number, 
  waiver: Number, 
  fine: Number, 
  paid: Number, 
  balance: Number, 
  paymentMethod: { type: String, default: 'Cash' },
  note: String,
  status: { type: String, enum: ['Paid', 'Partial', 'Unpaid', 'PAID', 'PARTIAL', 'UNPAID'], default: 'Unpaid' }, 
  date: Date 
}, { timestamps: true });
module.exports = mongoose.model("FeesInvoice", schema);