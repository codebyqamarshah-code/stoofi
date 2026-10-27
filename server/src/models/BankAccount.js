const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  bankName: { type: String, required: true, trim: true },
  accountTitle: { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  branchName: { type: String, default: '' },
  branchCode: { type: String, default: '' },
  accountType: { 
    type: String, 
    enum: ['Current', 'Savings', 'Money Market', 'Cash Account'],
    default: 'Current'
  },
  chartOfAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccount' },
  openingBalance: { type: Number, default: 0 },
  openingBalanceDate: { type: Date, default: Date.now },
  currentBalance: { type: Number, default: 0 },
  currency: { type: String, default: 'PKR' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true }
}, { timestamps: true });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
