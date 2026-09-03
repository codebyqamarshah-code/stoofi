const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Personal Info
  academicYear: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // we can use string for now to avoid breaking
  className: { type: String, required: true },
  section: { type: String, required: true },
  admissionNo: { type: String, required: true, unique: true },
  admissionDate: { type: String },
  rollNo: { type: String },
  phone: { type: String },
  currentAddress: { type: String },
  permanentAddress: { type: String },
  
  firstName: { type: String, required: true },
  lastName: { type: String },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  religion: { type: String },
  caste: { type: String },
  studentPhoto: { type: String },
  medicalHistory: { type: String },

  // Parents Info
  fatherName: { type: String },
  fatherPhone: { type: String },
  fatherOccupation: { type: String },
  motherName: { type: String },
  motherPhone: { type: String },
  motherOccupation: { type: String },
  guardianName: { type: String },
  guardianRelation: { type: String },
  guardianPhone: { type: String },
  guardianAddress: { type: String },

  // Documents
  document1: { type: String },
  document2: { type: String },

  // Previous School
  previousSchoolName: { type: String },
  previousSchoolAddress: { type: String },

  // Custom Fields / Other Info
  otherInfo: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Student', schema);
