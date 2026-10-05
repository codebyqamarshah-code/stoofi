const mongoose = require('mongoose');

const adminSetupSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: [true, 'Setup category / type is required'],
    trim: true,
    index: true
  },
  name: { 
    type: String, 
    required: [true, 'Setup item name is required'],
    trim: true,
    index: true
  },
  description: { 
    type: String, 
    trim: true,
    default: ''
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'],
    default: 'Active',
    index: true
  },
  isSystem: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AdminSetup', adminSetupSchema);
