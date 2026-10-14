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
  academicYear: { type: String, default: '2026' },
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

// IDCard Schema
const idCardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  role: { type: String, enum: ['Student', 'Teacher', 'Staff'], default: 'Student' },
  cardLayout: { type: String, enum: ['vertical', 'horizontal'], default: 'vertical' },
  themeStyle: { type: String, default: 'stoofi-emerald' },
  headerText: { type: String, default: 'OFFICIAL IDENTITY CARD' },
  footerText: { type: String, default: 'Principal Signature & Seal' },
  showPhoto: { type: Boolean, default: true },
  showAdmissionNo: { type: Boolean, default: true },
  showRollNo: { type: Boolean, default: true },
  showClass: { type: Boolean, default: true },
  showSection: { type: Boolean, default: true },
  showFatherName: { type: Boolean, default: true },
  showPhone: { type: Boolean, default: true },
  showBloodGroup: { type: Boolean, default: true },
  showDob: { type: Boolean, default: true },
  showDesignation: { type: Boolean, default: false },
  showDepartment: { type: Boolean, default: false },
  showQrBarcode: { type: Boolean, default: true },
  uploadedBackground: { type: String, default: '' },
  uploadedLogo: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export const IDCard = mongoose.models.IDCard || mongoose.model('IDCard', idCardSchema);

// Class Schema
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sections: [{ type: String }]
}, { timestamps: true });

export const Class = mongoose.models.Class || mongoose.model('Class', classSchema);

// Section Schema
const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number }
}, { timestamps: true });

export const Section = mongoose.models.Section || mongoose.model('Section', sectionSchema);

// Setting Schema
const settingSchema = new mongoose.Schema({
  schoolName: { type: String, default: 'Stoofi Public School' },
  schoolCode: { type: String, default: 'STOOFI-001' },
  phone: { type: String, default: '+92 300 1234567' },
  email: { type: String, default: 'info@stoofi.com' },
  address: { type: String, default: 'Main Campus, Model Town, Lahore, Pakistan' },
  schoolLogo: { type: String, default: '' }
}, { timestamps: true });

export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  userType: { type: String, enum: ['Student', 'Staff', 'Teacher'], default: 'Student' },
  recordId: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day'], default: 'Present' }
}, { timestamps: true });

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

// Expense Schema
const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'General' },
  date: { type: Date, default: Date.now },
  description: { type: String },
  paymentMethod: { type: String, default: 'Cash' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

// FeePayment Schema
const feePaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  fine: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  date: { type: Date, default: Date.now },
  note: { type: String },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const FeePayment = mongoose.models.FeePayment || mongoose.model('FeePayment', feePaymentSchema);

// Notice Schema
const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  published: { type: Boolean, default: true },
  audience: { type: String, enum: ['All', 'Students', 'Teachers', 'Parents', 'Staff'], default: 'All' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  eventFor: { type: String, default: 'All' },
  audience: { type: String, default: 'All' },
  category: { type: String, default: 'Event' },
  startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  endDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  location: { type: String, default: 'Main Campus' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Registration', 'Login', 'System', 'Event'], default: 'System' },
  isRead: { type: Boolean, default: false },
  audience: { type: String, default: 'Super Admin' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// ExamType Schema
const examTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isAveragePassing: { type: Boolean, default: true }
}, { timestamps: true });

export const ExamType = mongoose.models.ExamType || mongoose.model('ExamType', examTypeSchema);

// Subject Schema
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: '' },
  type: { type: String, enum: ['Theory', 'Practical', 'Both'], default: 'Theory' },
  category: { type: String, default: 'Compulsory' },
  author: { type: String, default: '' },
  className: { type: String, default: '' },
  section: { type: String, default: '' },
  isOptional: { type: Boolean, default: false }
}, { timestamps: true });

export const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

