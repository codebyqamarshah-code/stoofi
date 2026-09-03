const mongoose = require('mongoose');

const whatsappContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true }, // Normalized international format
  notes: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  unreadCount: { type: Number, default: 0 },
  lastMessageAt: { type: Date, default: Date.now },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }, // For multi-tenant
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WhatsappContact', whatsappContactSchema);
