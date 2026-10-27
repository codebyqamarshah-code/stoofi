const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  receiptNo: { type: String, index: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccount' },
  categoryName: { type: String, default: 'General Revenue' },
  bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  bankAccountName: { type: String, default: 'Cash in Safe' },
  date: { type: Date, default: Date.now, index: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online Payment', 'Other'],
    default: 'Cash'
  },
  referenceNo: { type: String, default: '' },
  payerName: { type: String, default: '' },
  payerContact: { type: String, default: '' },
  description: { type: String, default: '' },
  attachment: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Received', 'Pending', 'Void'],
    default: 'Received',
    index: true
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: { type: String, default: 'Accounts Officer' }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
