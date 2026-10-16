const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Link to User account (set when student logs in or is registered via auth)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Personal Info
  academicYear: { type: String, default: () => `${new Date().getFullYear()}` },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  className: { type: String, default: 'Class 1' },
  section: { type: String, default: 'A' },
  studentGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup', default: null },
  admissionNo: { type: String, required: true, unique: true },
  admissionDate: { type: String },
  joiningDate: { type: String },
  rollNo: { type: String },
  type: { type: String, default: 'Regular' },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  city: { type: String },
  address: { type: String },
  currentAddress: { type: String },
  permanentAddress: { type: String },
  
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  gender: { type: String, default: 'Male' },
  dob: { type: String, default: '2015-01-01' },
  religion: { type: String },
  caste: { type: String },
  bloodGroup: { type: String },
  nationality: { type: String, default: 'Pakistani' },
  cnic: { type: String, trim: true },
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
  document1: { type: String },
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
  characterCertificate: { type: String },

  // Custom Fields / Other Info
  otherInfo: { type: String },
  behaviourPoints: { type: Number, default: 0 },
  carryForwardAmount: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Student', schema);
