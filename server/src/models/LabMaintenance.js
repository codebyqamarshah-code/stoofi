const mongoose = require('mongoose');

const labMaintenanceSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    trim: true
  },
  equipmentName: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  assetCode: {
    type: String,
    default: ''
  },
  labName: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  reportedBy: {
    type: String,
    default: ''
  },
  reportedDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  assignedTo: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Reported', 'Under Review', 'In Progress', 'Repaired', 'Closed'],
    default: 'Reported'
  },
  costIncurred: {
    type: Number,
    default: 0
  },
  downtime: {
    type: String,
    default: ''
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabMaintenance', labMaintenanceSchema);
