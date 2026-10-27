const mongoose = require('mongoose');

const fundTransferSchema = new mongoose.Schema({
  transferNo: { type: String, index: true },
  fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', required: true },
  fromAccountName: { type: String, required: true },
  toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', required: true },
  toAccountName: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  date: { type: Date, default: Date.now, index: true },
  referenceNo: { type: String, default: '' },
  transferMethod: { 
    type: String, 
    enum: ['Internal Transfer', 'Cheque', 'Online Banking', 'Cash Deposit'],
    default: 'Internal Transfer'
  },
  description: { type: String, default: '' },
  attachment: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Completed', 'Pending', 'Cancelled', 'Reversed'],
    default: 'Completed',
    index: true
  },
  reversedTransferId: { type: mongoose.Schema.Types.ObjectId, ref: 'FundTransfer' },
  reversalReason: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: { type: String, default: 'Accounts Officer' }
}, { timestamps: true });

module.exports = mongoose.model('FundTransfer', fundTransferSchema);
