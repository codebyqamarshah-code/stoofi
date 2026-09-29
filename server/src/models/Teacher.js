const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  cnic: { type: String },
  cnicFront: { type: String },
  cnicBack: { type: String },
  document1: { type: String }, // optional, for resumes or degree
  avatar: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  designation: { type: String, default: 'Senior Teacher' },
  department: { type: String, default: 'Science' },
  qualification: { type: String },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
