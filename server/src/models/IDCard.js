const mongoose = require('mongoose');

const idCardSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'ID card title is required'],
    trim: true,
    index: true
  },
  role: { 
    type: String, 
    enum: ['Student', 'Teacher', 'Staff'],
    required: [true, 'Target role is required'],
    default: 'Student',
    index: true
  },
  cardLayout: { 
    type: String, 
    enum: ['vertical', 'horizontal'],
    default: 'vertical'
  },
  themeStyle: { 
    type: String, 
    enum: ['stoofi-emerald', 'classic-navy', 'royal-purple', 'dark-slate', 'crimson-gold', 'modern-slate'],
    default: 'stoofi-emerald'
  },
  headerText: { 
    type: String, 
    trim: true,
    default: 'OFFICIAL IDENTITY CARD'
  },
  subHeaderText: { 
    type: String, 
    trim: true,
    default: 'Main Campus, Model Town, Lahore'
  },
  footerText: { 
    type: String, 
    trim: true,
    default: 'Principal Signature & Seal'
  },
  // Field visibility configuration
  showPhoto: { type: Boolean, default: true },
  showAdmissionNo: { type: Boolean, default: true },
  showRollNo: { type: Boolean, default: true },
  showClass: { type: Boolean, default: true },
  showSection: { type: Boolean, default: true },
  showFatherName: { type: Boolean, default: true },
  showPhone: { type: Boolean, default: true },
  showBloodGroup: { type: Boolean, default: false },
  showDob: { type: Boolean, default: true },
  showDesignation: { type: Boolean, default: true },
  showDepartment: { type: Boolean, default: true },
  showQrBarcode: { type: Boolean, default: true },
  showSignature: { type: Boolean, default: true },
  uploadedBackground: { type: String, default: '' },
  uploadedLogo: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'],
    default: 'Active',
    index: true
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('IDCard', idCardSchema);
