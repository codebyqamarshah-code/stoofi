const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  userType: { type: String, enum: ['Student', 'Staff', 'Teacher'], default: 'Student' },
  recordId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day'], default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
