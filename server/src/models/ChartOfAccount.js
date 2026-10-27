const mongoose = require('mongoose');

const chartOfAccountSchema = new mongoose.Schema({
  accountCode: { type: String, required: true, trim: true, index: true },
  accountName: { type: String, required: true, trim: true },
  accountType: { 
    type: String, 
    required: true, 
    enum: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'],
    default: 'Asset'
  },
  parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccount', default: null },
  description: { type: String, default: '' },
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ChartOfAccount', chartOfAccountSchema);
