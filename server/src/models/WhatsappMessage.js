const mongoose = require('mongoose');

const whatsappMessageSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'WhatsappContact', required: true },
  direction: { type: String, enum: ['incoming', 'outgoing'], required: true },
  messageType: { type: String, enum: ['text', 'template', 'image', 'document'], default: 'text' },
  text: { type: String, default: '' },
  whatsappMessageId: { type: String, index: true }, // Meta's unique ID for status tracking
  status: { type: String, enum: ['pending', 'sent', 'delivered', 'read', 'failed'], default: 'pending' },
  errorMessage: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
}, { timestamps: true });

module.exports = mongoose.model('WhatsappMessage', whatsappMessageSchema);
