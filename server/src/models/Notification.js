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
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
