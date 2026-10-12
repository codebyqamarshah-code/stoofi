const mongoose = require('mongoose');

const labPracticalSchema = new mongoose.Schema({
  number: {
    type: String,
    default: 'Practical'
  },
  title: {
    type: String,
    required: [true, 'Practical title is required'],
    trim: true
  },
  subject: {
    type: String,
    default: ''
  },
  classSemester: {
    type: String,
    default: ''
  },
  labName: {
    type: String,
    default: ''
  },
  instructor: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: '2 Hours'
  },
  totalMarks: {
    type: Number,
    default: 20
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Conducted', 'Cancelled'],
    default: 'Scheduled'
  },
  attendanceCount: {
    type: String,
    default: '0 / 0'
  },
  objectives: {
    type: String,
    default: ''
  },
  requiredEquipment: {
    type: String,
    default: ''
  },
  requiredMaterials: {
    type: String,
    default: ''
  },
  safetyInstructions: {
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

module.exports = mongoose.model('LabPractical', labPracticalSchema);
