const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Personal Info
  academicYear: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  className: { type: String, required: true },
  section: { type: String, required: true },
  admissionNo: { type: String, required: true, unique: true },
  admissionDate: { type: String },
  joiningDate: { type: String },
  rollNo: { type: String },
  type: { type: String, default: 'Regular' },
  phone: { type: String },
  email: { type: String },
  city: { type: String },
  address: { type: String },
  currentAddress: { type: String },
  permanentAddress: { type: String },
  
  firstName: { type: String, required: true },
  lastName: { type: String },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  religion: { type: String },
  caste: { type: String },
  bloodGroup: { type: String },
  nationality: { type: String, default: 'Pakistani' },
  cnic: { type: String },
  bForm: { type: String },
  studentPhoto: { type: String },
  photo: { type: String },
  medicalHistory: { type: String },
  emergencyContact: { type: String },
  tcNo: { type: String },
  remarks: { type: String },

  // Parents Info
  fatherName: { type: String },
  fatherPhone: { type: String },
  fatherOccupation: { type: String },
  fatherCnic: { type: String },
  motherName: { type: String },
  motherPhone: { type: String },
  motherOccupation: { type: String },
  guardianName: { type: String },
  guardianRelation: { type: String },
  guardianPhone: { type: String },
  guardianAddress: { type: String },

  // Documents
  document1: { type: String }, // Can be used for TC
  document2: { type: String },
  cnicFront: { type: String },
  cnicBack: { type: String },
  qualificationLevel: { type: String },
  qualificationDocument: { type: String },

  // Previous School
  previousSchool: { type: String },
  previousInstituteType: { type: String },
  previousClassCovered: { type: String },
  previousSchoolDocument: { type: String },
  previousSchoolName: { type: String },
  previousSchoolAddress: { type: String },

  // Custom Fields / Other Info
  otherInfo: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Student', schema);
