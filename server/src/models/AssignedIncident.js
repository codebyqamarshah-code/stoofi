const mongoose = require('mongoose');

const assignedIncidentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  admissionNo: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BehaviourIncident'
  },
  incidentTitle: {
    type: String,
    required: true
  },
  point: {
    type: Number,
    required: true
  },
  pointType: {
    type: String,
    enum: ['positive', 'negative'],
    default: 'positive'
  },
  incidentDate: {
    type: String,
    required: true
  },
  assignedBy: {
    type: String,
    default: 'School Administration'
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssignedIncident', assignedIncidentSchema);
