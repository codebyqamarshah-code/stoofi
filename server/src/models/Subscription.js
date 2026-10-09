const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  schoolName: {
    type: String
  },
  provider: {
    type: String,
    default: 'Safepay'
  },
  providerSubscriptionId: {
    type: String
  },
  plan: {
    type: String,
    enum: ['Starter', 'Professional', 'Enterprise', 'Custom'],
    default: 'Starter'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  studentCount: {
    type: Number,
    default: 100
  },
  amount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  status: {
    type: String,
    enum: ['trialing', 'active', 'past_due', 'cancelled', 'expired', 'payment_failed'],
    default: 'trialing',
    index: true
  },
  trialStartDate: {
    type: Date
  },
  trialEndDate: {
    type: Date
  },
  currentPeriodStart: {
    type: Date
  },
  currentPeriodEnd: {
    type: Date
  },
  nextBillingDate: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  latestPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  features: [{
    type: String
  }]
}, { timestamps: true });

// Check if subscription has active access
subscriptionSchema.methods.hasAccess = function() {
  const now = new Date();
  if (this.status === 'active') {
    return !this.currentPeriodEnd || now <= this.currentPeriodEnd;
  }
  if (this.status === 'trialing') {
    return !this.trialEndDate || now <= this.trialEndDate;
  }
  return false;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
