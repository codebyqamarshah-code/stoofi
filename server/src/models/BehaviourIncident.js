const mongoose = require('mongoose');

const behaviourIncidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Incident title is required'],
    trim: true
  },
  point: {
    type: Number,
    required: [true, 'Point value is required'],
    default: 0
  },
  pointType: {
    type: String,
    enum: ['positive', 'negative'],
    default: 'positive'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BehaviourIncident', behaviourIncidentSchema);
