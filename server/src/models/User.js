const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid real email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Do not return password by default
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Teacher', 'Student', 'Parent', 'Accountant', 'Librarian', 'Staff'],
    default: 'Student'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  lastLogin: {
    type: Date
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'roleModel'
  },
  roleModel: {
    type: String,
    enum: ['Student', 'Teacher', 'Parent', 'Staff']
  },
  firstName: { type: String },
  lastName: { type: String },
  schoolName: { type: String },
  schoolAddress: { type: String },
  phone: { 
    type: String,
    match: [/^((\+92)|(0092)|(0))?3[0-9]{9}$|^(\+?[1-9]\d{1,14})$/, 'Please enter a valid phone number (e.g. 03351234567 or +923351234567)']
  },
  cnic: { 
    type: String,
    match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$|^[0-9]{13}$/, 'Please enter a valid CNIC number (e.g. 35202-1234567-1)']
  },
  cnicFront: { type: String },
  cnicBack: { type: String },
  avatar: {
    type: String // To store base64 profile picture
  },
  // Profile Information
  gender: { type: String },
  dob: { type: String },
  dateOfBirth: { type: String },
  maritalStatus: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  qualifications: { type: String },
  experience: { type: String },
  workExperience: { type: String },
  drivingLicense: { type: String },
  emergencyMobile: { type: String },
  emergencyContact: { type: String },
  currentAddress: { type: String },
  permanentAddress: { type: String },
  city: { type: String },
  bloodGroup: { type: String },
  religion: { type: String },
  caste: { type: String },
  bForm: { type: String },
  rollNo: { type: String },
  department: { type: String },
  designation: { type: String },
  basicSalary: { type: Number },
  epfNo: { type: String },
  contractType: { type: String },
  dateOfJoining: { type: String },
  joiningDate: { type: String },
  bankName: { type: String },
  accountName: { type: String },
  bankAccountNumber: { type: String },
  branchName: { type: String },
  facebookUrl: { type: String },
  twitterUrl: { type: String },
  linkedinUrl: { type: String },
  instagramUrl: { type: String },
  fatherPhone: { type: String },
  fatherOccupation: { type: String },
  fatherCnic: { type: String },
  motherPhone: { type: String },
  guardianName: { type: String },
  guardianRelation: { type: String },
  guardianPhone: { type: String },
  guardianAddress: { type: String },
  academicYear: { type: String },
  admissionDate: { type: String },
  previousSchool: { type: String },
  previousClassCovered: { type: String },
  emailOtp: { type: String },
  otpExpires: { type: Date },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  subscription: {
    plan: { type: String, enum: ['Free Trial', 'Premium', 'None'], default: 'None' },
    status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
    startDate: { type: Date },
    endDate: { type: Date }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
