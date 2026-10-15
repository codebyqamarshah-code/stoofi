const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Registration', 'Login', 'System', 'Event'],
    default: 'System'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  audience: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Teacher', 'Student', 'All'],
    default: 'Super Admin'
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ audience: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
