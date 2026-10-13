const mongoose = require("mongoose");
const schema = new mongoose.Schema({ 
  studentName: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  admissionNo: String,
  className: String,
  section: String,
  date: { type: Date, default: Date.now }, 
  amount: { type: Number, required: true }, 
  transactionId: String,
  bankName: String,
  note: String, 
  file: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' } 
}, { timestamps: true });
module.exports = mongoose.model("BankPayment", schema);