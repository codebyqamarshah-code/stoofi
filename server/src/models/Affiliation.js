const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  type: { 
    type: String, 
    enum: [
      'University', 
      'Board of Intermediate & Secondary Education', 
      'Technical Board', 
      'Council', 
      'Vocational Agency', 
      'Autonomous Body'
    ], 
    default: 'Technical Board' 
  },
  approvalReference: { type: String, default: '' },
  verificationEvidence: { type: String, default: '' },
  validityFrom: { type: String, default: '' },
  validityTo: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  address: { type: String, default: '' },
  authorizationStatus: { 
    type: String, 
    enum: ['Approved', 'Pending Renewal', 'Conditional', 'Suspended', 'Expired'], 
    default: 'Approved' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

schema.index({ authorizationStatus: 1, isActive: 1 });

module.exports = mongoose.model('Affiliation', schema);
