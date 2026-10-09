const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  provider: {
    type: String,
    default: 'Safepay'
  },
  eventType: {
    type: String,
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'ignored', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  },
  processedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
