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
  canDelete: {
    type: Boolean,
    default: true
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
  academicYear: { type: String, default: () => `${new Date().getFullYear()}` },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  className: { type: String, default: 'FSC OTT' },
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
  document1: { type: String },
  document2: { type: String },
  cnicFront: { type: String },
  cnicBack: { type: String },
  qualificationLevel: { type: String },
  qualificationDocument: { type: String },
  previousSchool: { type: String },
  previousInstituteType: { type: String },
  previousClassCovered: { type: String },
  previousSchoolDocument: { type: String },
  previousSchoolName: { type: String },
  previousSchoolAddress: { type: String },
  characterCertificate: { type: String },
  otherInfo: { type: String },
  behaviourPoints: { type: Number, default: 0 },
  carryForwardAmount: { type: Number, default: 0 },
  cardTemplate: { type: String, default: 'classic-navy' },
  cardLayout: { type: String, default: 'horizontal' },
  themeStyle: { type: String, default: 'classic-navy' },
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
  schoolName: { type: String, default: 'Pak Royal College Sharaqpur' },
  schoolCode: { type: String, default: 'PRC-001' },
  phone: { type: String, default: '03 111 444 810' },
  email: { type: String, default: 'info@pakroyalcollege.edu.pk' },
  address: { type: String, default: 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura' },
  schoolLogo: { type: String, default: '/pak-royal-college-logo.png' }
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

// FrontendCMS Schema
const frontendCmsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  manageTheme: {
    activeTheme: { type: String, default: 'edulia' },
    primaryColor: { type: String, default: '#087f77' },
    secondaryColor: { type: String, default: '#0c2436' },
    accentColor: { type: String, default: '#64e2bc' },
    showAnimations: { type: Boolean, default: true },
    heroStyle: { type: String, default: 'slider' }
  },
  headerContent: {
    phone: { type: String, default: '03 111 444 810' },
    email: { type: String, default: 'info@pakroyalcollege.edu.pk' },
    openingHours: { type: String, default: 'Mon - Sat: 8:00 AM - 2:30 PM' },
    address: { type: String, default: 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif' },
    announcementText: { type: String, default: 'ADMISSIONS OPEN 2026-2027' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    showTopBar: { type: Boolean, default: true },
    ctaButtonText: { type: String, default: 'Login Portal' },
    ctaButtonLink: { type: String, default: '/login' }
  },
  footerContent: {
    about: { type: String, default: 'Pak Royal College Sharaqpur — Empowering students with modern academic excellence, character building, and digital campus automation.' },
    copyright: { type: String, default: '© 2026 Pak Royal College Sharaqpur. All rights reserved.' },
    address: { type: String, default: 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura' },
    phone: { type: String, default: '03 111 444 810' },
    email: { type: String, default: 'info@pakroyalcollege.edu.pk' },
    showNewsletter: { type: Boolean, default: true }
  },
  homeSlider: { type: [mongoose.Schema.Types.Mixed], default: [] },
  photoGallery: { type: [mongoose.Schema.Types.Mixed], default: [] },
  videoGallery: { type: [mongoose.Schema.Types.Mixed], default: [] },
  expertTeacher: { type: [mongoose.Schema.Types.Mixed], default: [] },
  result: { type: [mongoose.Schema.Types.Mixed], default: [] },
  classRoutine: { type: [mongoose.Schema.Types.Mixed], default: [] },
  examRoutine: { type: [mongoose.Schema.Types.Mixed], default: [] },
  academicCalendar: { type: [mongoose.Schema.Types.Mixed], default: [] },
  aoraPagebuilder: { type: [mongoose.Schema.Types.Mixed], default: [] },
  pages: { type: [mongoose.Schema.Types.Mixed], default: [] },
  menu: { type: [mongoose.Schema.Types.Mixed], default: [] },
  newsCategory: { type: [mongoose.Schema.Types.Mixed], default: [] },
  newsList: { type: [mongoose.Schema.Types.Mixed], default: [] },
  newsComments: { type: [mongoose.Schema.Types.Mixed], default: [] },
  testimonial: { type: [mongoose.Schema.Types.Mixed], default: [] },
  courseCategory: { type: [mongoose.Schema.Types.Mixed], default: [] },
  courseList: { type: [mongoose.Schema.Types.Mixed], default: [] },
  contactMessage: { type: [mongoose.Schema.Types.Mixed], default: [] },
  donor: { type: [mongoose.Schema.Types.Mixed], default: [] },
  formDownload: { type: [mongoose.Schema.Types.Mixed], default: [] },
  speechSlider: { type: [mongoose.Schema.Types.Mixed], default: [] },
  builderSections: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true, minimize: false });

export const FrontendCMS = mongoose.models.FrontendCMS || mongoose.model('FrontendCMS', frontendCmsSchema);


