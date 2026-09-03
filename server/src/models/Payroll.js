const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  staffId: { type: String, required: true },
  month: String,
  year: String,
  basicSalary: Number,
  allowances: Number,
  deductions: Number,
  netSalary: Number,
  status: { type: String, default: 'pending' },
  payDate: Date

}, { timestamps: true });

module.exports = mongoose.model('Payroll', schema);
