const mongoose = require('mongoose');

const labConsumableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Consumable item name is required'],
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'General Consumables'
  },
  lab: {
    type: String,
    default: 'General Lab'
  },
  unit: {
    type: String,
    default: 'Units'
  },
  inStock: {
    type: Number,
    default: 0
  },
  consumedQty: {
    type: Number,
    default: 0
  },
  reorderLevel: {
    type: Number,
    default: 5
  },
  unitCost: {
    type: String,
    default: ''
  },
  supplier: {
    type: String,
    default: ''
  },
  expiryDate: {
    type: String,
    default: ''
  },
  manufactureDate: {
    type: String,
    default: ''
  },
  batchNo: {
    type: String,
    default: ''
  },
  storageLocation: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Critical'],
    default: 'In Stock'
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabConsumable', labConsumableSchema);
