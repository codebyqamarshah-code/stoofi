const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  address: { type: String, default: 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura' },
  phone: { type: String, default: '03 111 444 810' },
  email: { type: String, default: 'info@pakroyalcollege.edu.pk' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isMainCampus: { type: Boolean, default: false }
}, { timestamps: true });

schema.index({ status: 1 });

module.exports = mongoose.model('Campus', schema);
