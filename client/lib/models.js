import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema
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
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
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
  avatar: {
    type: String
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  admissionNo: { type: String, required: true, unique: true },
  rollNo: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
  className: { type: String, required: true },
  section: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  dob: { type: String, required: true },
  religion: { type: String },
  caste: { type: String },
  fatherName: { type: String },
  phone: { type: String },
  currentAddress: { type: String },
  permanentAddress: { type: String },
  academicYear: { type: String, default: '2026 [Jan-Dec]' },
  studentPhoto: { type: String },
  status: { type: String, default: 'Active' },
  subjects: [{ type: String }]
}, { timestamps: true });

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

// Staff Schema (Handles Super Admin, Admin, Staff, Accountant, Librarian)
const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  role: { type: String, required: true },
  cnic: { type: String },
  joiningDate: { type: Date, default: Date.now },
  department: { type: String },
  designation: { type: String }
}, { timestamps: true });

export const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  joiningDate: { type: Date, default: Date.now },
  cnic: { type: String },
  avatar: { type: String },
  gender: { type: String, default: 'Male' },
  // Class assignment
  assignedClass: { type: String, default: '' },
  assignedSection: { type: String, default: '' },
  subjects: [{ type: String }]
}, { timestamps: true });

export const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

