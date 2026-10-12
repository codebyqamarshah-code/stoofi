const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lab name is required'],
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  campus: {
    type: String,
    default: 'Main Campus'
  },
  building: {
    type: String,
    default: ''
  },
  floor: {
    type: String,
    default: ''
  },
  roomNumber: {
    type: String,
    default: ''
  },
  capacity: {
    type: Number,
    default: 30
  },
  inCharge: {
    type: String,
    default: ''
  },
  assistant: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Inactive'],
    default: 'Active'
  },
  description: {
    type: String,
    default: ''
  },
  safetyInstructions: {
    type: String,
    default: ''
  },
  facilities: {
    type: String,
    default: ''
  },
  openingTime: {
    type: String,
    default: '08:00 AM'
  },
  closingTime: {
    type: String,
    default: '04:00 PM'
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lab', labSchema);
