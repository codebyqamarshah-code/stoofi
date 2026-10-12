const mongoose = require('mongoose');

const labEquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
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
  lab: {
    type: String,
    default: 'General Lab'
  },
  brand: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: ''
  },
  serialNumber: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    default: 1
  },
  availableQty: {
    type: Number,
    default: 1
  },
  purchaseDate: {
    type: String,
    default: ''
  },
  purchaseCost: {
    type: Number,
    default: 0
  },
  supplier: {
    type: String,
    default: ''
  },
  warrantyExpiry: {
    type: String,
    default: ''
  },
  condition: {
    type: String,
    enum: ['Good', 'Fair', 'Damaged', 'Under Repair'],
    default: 'Good'
  },
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Under Repair', 'Decommissioned'],
    default: 'Available'
  },
  maintenanceDate: {
    type: String,
    default: ''
  },
  nextMaintenanceDate: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  isComputer: {
    type: Boolean,
    default: false
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabEquipment', labEquipmentSchema);
