const mongoose = require('mongoose');

const classRoutineSchema = new mongoose.Schema({
  className: { type: String, required: true },
  sectionName: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: String, default: '' },
  day: { 
    type: String, 
    required: true, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, default: '' },
  isLab: { type: Boolean, default: false },
  labId: { type: String, default: '' },
  labName: { type: String, default: '' },
  batch: { type: String, default: 'All Students' },
  capacityAllocated: { type: Number, default: 0 },
  topic: { type: String, default: '' },
  status: { type: String, default: 'Scheduled' },
  recurrence: { type: String, default: 'Weekly' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ClassRoutine', classRoutineSchema);
