const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    default: 'Stoofi Public School'
  },
  schoolCode: {
    type: String,
    default: 'STOOFI-001'
  },
  phone: {
    type: String,
    default: '+92 300 1234567'
  },
  email: {
    type: String,
    default: 'info@stoofi.com'
  },
  address: {
    type: String,
    default: 'Main Campus, Model Town, Lahore, Pakistan'
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  currencySymbol: {
    type: String,
    default: 'Rs.'
  },
  academicYear: {
    type: String,
    default: '2026 [Jan-Dec]'
  },
  sessionStartMonth: {
    type: String,
    default: 'January'
  },
  schoolLogo: {
    type: String,
    default: ''
  },
  tagline: {
    type: String,
    default: 'Smart Education & School Management'
  },
  footerText: {
    type: String,
    default: '© 2026 Stoofi ERP. All Rights Reserved.'
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
