const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolName: {
    type: String,
    trim: true
  },
  adminName: {
    type: String,
    trim: true
  },
  adminEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  provider: {
    type: String,
    default: 'Safepay'
  },
  providerTransactionId: {
    type: String, // token / tracker / beacon from Safepay
    index: true
  },
  providerReference: {
    type: String, // orderId (e.g. STOOFI-ORD-123456)
    unique: true,
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['Starter', 'Professional', 'Enterprise', 'Custom'],
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  studentCount: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    default: 'Safepay Checkout'
  },
  failureReason: {
    type: String
  },
  signature: {
    type: String
  },
  invoiceNumber: {
    type: String,
    unique: true,
    index: true
  },
  receiptUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Auto-generate invoice number before save if not present
paymentSchema.pre('save', function() {
  if (!this.invoiceNumber) {
    const yr = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.invoiceNumber = `INV-${yr}-${rand}`;
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
