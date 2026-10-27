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
  // 1. STUDENT CORE IDENTITY (Top Priority)
  studentName: { type: String, trim: true },
  name: { type: String, trim: true },
  fullName: { type: String, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, default: '', trim: true },
  gender: { type: String, default: 'Male' },
  dob: { type: String, default: '2015-01-01' },
  cnic: { type: String, trim: true },
  bForm: { type: String, trim: true },
  bloodGroup: { type: String },
  religion: { type: String },
  caste: { type: String },
  nationality: { type: String, default: 'Pakistani' },
  studentPhoto: { type: String },
  photo: { type: String },
  medicalHistory: { type: String },

  // 2. FATHER DETAILS
  fatherName: { type: String, trim: true },
  fatherCnic: { type: String, trim: true },
  fatherPhone: { type: String, trim: true },
  fatherOccupation: { type: String, trim: true },
  father: {
    name: { type: String },
    phone: { type: String },
    cnic: { type: String },
    occupation: { type: String }
  },

  // 3. MOTHER DETAILS
  motherName: { type: String, trim: true },
  motherCnic: { type: String, trim: true },
  motherPhone: { type: String, trim: true },
  motherOccupation: { type: String, trim: true },
  mother: {
    name: { type: String },
    phone: { type: String },
    occupation: { type: String }
  },

  // 4. GUARDIAN DETAILS
  guardianName: { type: String, trim: true },
  guardianRelation: { type: String, trim: true },
  guardianPhone: { type: String, trim: true },
  guardianCnic: { type: String, trim: true },
  guardianOccupation: { type: String, trim: true },
  guardianEmail: { type: String, trim: true },
  guardianAddress: { type: String, trim: true },
  guardian: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String },
    cnic: { type: String },
    occupation: { type: String },
    address: { type: String },
    email: { type: String }
  },

  // 5. ADDRESS & CONTACT DETAILS
  address: { type: String, trim: true },
  currentAddress: { type: String, trim: true },
  permanentAddress: { type: String, trim: true },
  city: { type: String, trim: true },
  phone: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  email: { type: String, trim: true },
  emergencyContact: { type: String, trim: true },
  emergencyContactName: { type: String, trim: true },
  emergencyContactRelation: { type: String, trim: true },
  emergencyContactPhone: { type: String, trim: true },

  // 6. ACADEMIC & INSTITUTION DETAILS
  admissionNo: { type: String, required: true, unique: true, trim: true },
  rollNo: { type: String, trim: true },
  academicYear: { type: String, default: () => `${new Date().getFullYear()}` },
  className: { type: String, default: 'FSC OTT' },
  section: { type: String, default: 'A' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  studentGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup', default: null },
  admissionDate: { type: String },
  joiningDate: { type: String },
  studentCode: { type: String, trim: true },
  type: { type: String, default: 'Regular' },
  status: { type: String, default: 'Active' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPermanentProfile: { type: Boolean, default: true },
  activeEnrollmentCount: { type: Number, default: 1 },
  tcNo: { type: String },
  remarks: { type: String },

  // 7. DOCUMENTS & PREVIOUS EDUCATION
  document1: { type: String },
  document2: { type: String },
  cnicFront: { type: String },
  cnicBack: { type: String },
  qualificationLevel: { type: String },
  qualificationDocument: { type: String },
  qualifications: [{
    qualification: { type: String },
    institution: { type: String },
    awardingBody: { type: String },
    completionYear: { type: String },
    rollNumber: { type: String },
    totalMarks: { type: Number },
    obtainedMarks: { type: Number },
    percentage: { type: String },
    grade: { type: String },
    resultStatus: { type: String, default: 'Passed' },
    documentUrl: { type: String }
  }],
  documents: [{
    docType: { type: String },
    status: { type: String, default: 'Pending' },
    verified: { type: Boolean, default: false },
    documentUrl: { type: String }
  }],
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
  subjects: [{ type: String }]
}, { timestamps: true });

// Pre-validate & pre-save hook to ensure studentName, name, and fullName are always populated
studentSchema.pre('validate', function(next) {
  const calculated = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
  if (!this.studentName || this.studentName.trim() === '') this.studentName = calculated;
  if (!this.name || this.name.trim() === '') this.name = calculated;
  if (!this.fullName || this.fullName.trim() === '') this.fullName = calculated;
  next();
});

studentSchema.pre('save', function(next) {
  const calculated = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
  if (!this.studentName || this.studentName.trim() === '') this.studentName = calculated;
  if (!this.name || this.name.trim() === '') this.name = calculated;
  if (!this.fullName || this.fullName.trim() === '') this.fullName = calculated;
  next();
});

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

// Certificate Schema
const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  type: { type: String, required: true, trim: true, default: 'Transfer Certificate' },
  description: { type: String, trim: true, default: '' },
  headerTitle: { type: String, trim: true, default: '' },
  headerSubtitle: { type: String, trim: true, default: 'TO WHOM IT MAY CONCERN' },
  templateBody: { 
    type: String, 
    required: true, 
    default: 'This is to certify that [student_name], Son/Daughter of [father_name], having Admission No [admission_no] and Roll No [roll_no], is/was a bona fide student of Class [class_name] (Section [section]) in this institution for the Academic Session [academic_session]. During their stay, their conduct and academic character were exemplary. We wish them all success in their future endeavors.' 
  },
  footerLeft: { type: String, trim: true, default: 'Date of Issue' },
  footerCenter: { type: String, trim: true, default: 'Class Teacher / Checked By' },
  footerRight: { type: String, trim: true, default: 'Principal / Authorized Seal' },
  themeStyle: { 
    type: String, 
    enum: ['classic-gold', 'stoofi-emerald', 'royal-navy', 'crimson-merit', 'minimal-tech', 'academic-navy', 'modern-slate'],
    default: 'classic-gold'
  },
  showStudentPhoto: { type: Boolean, default: true },
  showAdmissionNo: { type: Boolean, default: true },
  showRollNo: { type: Boolean, default: true },
  showClass: { type: Boolean, default: true },
  showSection: { type: Boolean, default: true },
  showFatherName: { type: Boolean, default: true },
  showDob: { type: Boolean, default: true },
  showGender: { type: Boolean, default: true },
  showIssueDate: { type: Boolean, default: true },
  showQrBarcode: { type: Boolean, default: true },
  showSeal: { type: Boolean, default: true },
  showSignatureLeft: { type: Boolean, default: true },
  showSignatureCenter: { type: Boolean, default: true },
  showSignatureRight: { type: Boolean, default: true },
  showSchoolHeader: { type: Boolean, default: true },
  uploadedBackground: { type: String, default: '' },
  uploadedSeal: { type: String, default: '' },
  uploadedSignature: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

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
  schoolLogo: { type: String, default: '/pak-royal-college-logo.png' },
  currency: { type: String, default: 'PKR' },
  currencySymbol: { type: String, default: 'Rs.' },
  academicYear: { type: String, default: '2026' },
  academicYears: [{ type: mongoose.Schema.Types.Mixed }],
  session: { type: String, default: '2026' },
  sessionStartMonth: { type: String, default: 'January' },
  dateFormat: { type: String, default: 'DD/MM/YYYY' },
  language: { type: String, default: 'English' },
  timezone: { type: String, default: 'Asia/Karachi' },
  tagline: { type: String, default: '' },
  footerText: { type: String, default: '' },
  website: { type: String, default: '' },
  examRule: { type: mongoose.Schema.Types.Mixed, default: {} },
  feeInvoiceSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  studentFieldSettings: [{ type: mongoose.Schema.Types.Mixed }],
  staffFieldSettings: [{ type: mongoose.Schema.Types.Mixed }],
  emailSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  smsSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  paymentSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  weekendSettings: [{ type: mongoose.Schema.Types.Mixed }],
  twoFactorSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  customFieldsStudent: [{ type: mongoose.Schema.Types.Mixed }],
  customFieldsStaff: [{ type: mongoose.Schema.Types.Mixed }],
  baseSetups: [{ type: mongoose.Schema.Types.Mixed }],
  themeSettings: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { strict: false, timestamps: true });

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
  audience: { type: String, enum: ['All', 'Students', 'Teachers', 'Parents', 'Staff', 'Directors'], default: 'All' },
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

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC PROGRAM MANAGEMENT & MULTI-ENROLLMENT ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────

const academicCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  description: { type: String, default: '' },
  applicableStageType: { type: String, enum: ['Part', 'Semester', 'Term', 'Module'], default: 'Semester' },
  displayOrder: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const AcademicCategory = mongoose.models.AcademicCategory || mongoose.model('AcademicCategory', academicCategorySchema);

const affiliationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  type: { 
    type: String, 
    enum: ['University', 'Board of Intermediate & Secondary Education', 'Technical Board', 'Council', 'Vocational Agency', 'Autonomous Body'], 
    default: 'Technical Board' 
  },
  approvalReference: { type: String, default: '' },
  verificationEvidence: { type: String, default: '' },
  validityFrom: { type: String, default: '' },
  validityTo: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  address: { type: String, default: '' },
  authorizationStatus: { 
    type: String, 
    enum: ['Approved', 'Pending Renewal', 'Conditional', 'Suspended', 'Expired'], 
    default: 'Approved' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Affiliation = mongoose.models.Affiliation || mongoose.model('Affiliation', affiliationSchema);

const campusSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  address: { type: String, default: 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura' },
  phone: { type: String, default: '03 111 444 810' },
  email: { type: String, default: 'info@pakroyalcollege.edu.pk' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isMainCampus: { type: Boolean, default: false }
}, { timestamps: true });

export const Campus = mongoose.models.Campus || mongoose.model('Campus', campusSchema);

const academicSessionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  isCurrent: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Closed', 'Upcoming'], default: 'Active' }
}, { timestamps: true });

export const AcademicSession = mongoose.models.AcademicSession || mongoose.model('AcademicSession', academicSessionSchema);

const programSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  qualificationName: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicCategory', required: true },
  categoryName: { type: String, default: '' },
  department: { type: String, default: 'Academics' },
  description: { type: String, default: '' },
  academicPattern: { type: String, enum: ['Annual', 'Semester', 'Term', 'Modular'], default: 'Annual' },
  defaultDuration: { type: String, default: '2 Years' },
  totalStages: { type: Number, default: 2 },
  stageType: { type: String, enum: ['Part', 'Semester', 'Term', 'Module'], default: 'Part' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Program = mongoose.models.Program || mongoose.model('Program', programSchema);

const programOfferingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  programName: { type: String, required: true },
  programCode: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicCategory' },
  categoryName: { type: String, default: '' },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  campusName: { type: String, default: 'Main Campus - Sharaqpur Sharif' },
  affiliationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliation' },
  affiliationName: { type: String, default: 'Punjab Board of Technical Education (PBTE)' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession' },
  sessionName: { type: String, default: '2026-2028' },
  sessionYear: { type: Number, default: 2026 },
  curriculumVersion: { type: String, default: 'Scheme 2026 v1.0' },
  duration: { type: String, default: '2 Years' },
  academicPattern: { type: String, default: 'Annual' },
  stageType: { type: String, default: 'Part' },
  totalStages: { type: Number, default: 2 },
  admissionStartDate: { type: String, default: '' },
  admissionEndDate: { type: String, default: '' },
  seatCapacity: { type: Number, default: 60 },
  enrolledCount: { type: Number, default: 0 },
  feePlan: {
    admissionFee: { type: Number, default: 5000 },
    tuitionFeePerTerm: { type: Number, default: 25000 },
    registrationFee: { type: Number, default: 3000 },
    labPracticalFee: { type: Number, default: 2000 },
    examFee: { type: Number, default: 2000 },
    libraryFee: { type: Number, default: 1000 },
    totalEstimate: { type: Number, default: 38000 },
    installmentsAllowed: { type: Boolean, default: true },
    installmentsCount: { type: Number, default: 2 }
  },
  documentRequirements: [{
    name: { type: String, required: true },
    key: { type: String, required: true },
    required: { type: Boolean, default: true },
    description: { type: String, default: '' }
  }],
  dynamicFieldSchema: [{
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'number', 'select', 'multiselect', 'date', 'textarea'], default: 'text' },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    helpText: { type: String, default: '' }
  }],
  status: { type: String, enum: ['Approved', 'Draft', 'Suspended', 'Archived'], default: 'Approved' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const ProgramOffering = mongoose.models.ProgramOffering || mongoose.model('ProgramOffering', programOfferingSchema);

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, default: '' },
  offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgramOffering', required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  shift: { type: String, enum: ['Morning', 'Evening', 'Weekend'], default: 'Morning' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  capacity: { type: Number, default: 60 },
  currentEnrolled: { type: Number, default: 0 },
  roomNumber: { type: String, default: '' },
  coordinatorName: { type: String, default: '' },
  sections: [{ type: String, default: 'A' }],
  status: { type: String, enum: ['Active', 'Completed', 'Upcoming'], default: 'Active' }
}, { timestamps: true });

export const Batch = mongoose.models.Batch || mongoose.model('Batch', batchSchema);

const admissionCounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['admission', 'roll', 'studentCode'], required: true },
  year: { type: Number, required: true },
  scope: { type: String, default: 'institution' },
  sequence: { type: Number, default: 0, required: true }
}, { timestamps: true });

export const AdmissionCounter = mongoose.models.AdmissionCounter || mongoose.model('AdmissionCounter', admissionCounterSchema);

const studentEnrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentCode: { type: String, default: '' },
  studentName: { type: String, required: true },
  offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgramOffering', required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicCategory' },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  affiliationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliation' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  programName: { type: String, required: true },
  programCode: { type: String, default: '' },
  categoryName: { type: String, default: '' },
  campusName: { type: String, default: 'Main Campus - Sharaqpur Sharif' },
  affiliationName: { type: String, default: '' },
  sessionName: { type: String, default: '' },
  batchName: { type: String, default: '' },
  sectionName: { type: String, default: 'A' },
  shift: { type: String, enum: ['Morning', 'Evening', 'Weekend'], default: 'Morning' },
  admissionYear: { type: Number, required: true },
  admissionDate: { type: String, required: true },
  admissionNumber: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true },
  applicationStatus: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected'], 
    default: 'Accepted' 
  },
  rejectionReason: { type: String, default: '' },
  enrollmentStatus: { 
    type: String, 
    enum: ['Pending', 'Active', 'Deferred', 'Withdrawn', 'Completed', 'Cancelled'], 
    default: 'Active' 
  },
  externalRegistrationStatus: { 
    type: String, 
    enum: ['Not Submitted', 'Submitted', 'Approved', 'Rejected'], 
    default: 'Not Submitted' 
  },
  externalRegistrationNumber: { type: String, default: '' },
  externalExamRollNo: { type: String, default: '' },
  financeStatus: { 
    type: String, 
    enum: ['Clear', 'Partially Paid', 'Overdue'], 
    default: 'Clear' 
  },
  academicStage: { type: String, default: 'Part I' },
  academicResultStatus: { 
    type: String, 
    enum: ['Pending', 'Passed', 'Failed', 'Reappear'], 
    default: 'Pending' 
  },
  admissionType: { 
    type: String, 
    enum: ['Regular', 'Private', 'Transfer / Migration', 'Readmission', 'Scholarship'], 
    default: 'Regular' 
  },
  previousQualifications: [{
    qualification: { type: String, default: '' },
    institute: { type: String, default: '' },
    awardingBody: { type: String, default: '' },
    passingYear: { type: String, default: '' },
    rollNo: { type: String, default: '' },
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: '' },
    resultStatus: { type: String, enum: ['Passed', 'Result Awaiting', 'Compartment'], default: 'Passed' },
    documentUrl: { type: String, default: '' }
  }],
  dynamicFields: { type: mongoose.Schema.Types.Mixed, default: {} },
  programSpecificData: { type: mongoose.Schema.Types.Mixed, default: {} },
  documents: [{
    name: { type: String, required: true },
    key: { type: String, required: true },
    fileUrl: { type: String, default: '' },
    requirementType: { type: String, enum: ['Required', 'Optional', 'Not Applicable'], default: 'Required' },
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    verificationOfficer: { type: String, default: '' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' }
  }],
  feeStructureSnapshot: {
    admissionFee: { type: Number, default: 0 },
    tuitionFee: { type: Number, default: 0 },
    registrationFee: { type: Number, default: 0 },
    labFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    libraryFee: { type: Number, default: 0 },
    totalFee: { type: Number, default: 0 },
    concessionAmount: { type: Number, default: 0 },
    concessionReason: { type: String, default: '' },
    concessionApprovedBy: { type: String, default: '' },
    netPayable: { type: Number, default: 0 },
    challanGenerated: { type: Boolean, default: false },
    challanNumber: { type: String, default: '' }
  },
  history: [{
    action: { type: String, required: true },
    fromStatus: { type: String, default: '' },
    toStatus: { type: String, default: '' },
    actor: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String, default: '' }
  }]
}, { timestamps: true });

export const StudentEnrollment = mongoose.models.StudentEnrollment || mongoose.model('StudentEnrollment', studentEnrollmentSchema);

// FeesInvoice Schema
const feesInvoiceSchema = new mongoose.Schema({ 
  invoiceNo: String,
  challanNo: String,
  billingMonth: String,
  dueDate: Date,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  student: String, 
  fatherName: String,
  rollNo: String,
  admissionNo: String,
  className: String,
  section: String,
  feeType: String,
  feeItems: [{
    head: String,
    amount: Number
  }],
  amount: Number, 
  waiver: Number, 
  fine: Number, 
  paid: Number, 
  balance: Number, 
  paymentMethod: { type: String, default: 'Cash' },
  note: String,
  status: { type: String, enum: ['Paid', 'Partial', 'Unpaid', 'PAID', 'PARTIAL', 'UNPAID'], default: 'Unpaid' }, 
  date: Date 
}, { timestamps: true });

export const FeesInvoice = mongoose.models.FeesInvoice || mongoose.model('FeesInvoice', feesInvoiceSchema);

// Payroll Schema
const payrollSchema = new mongoose.Schema({
  staffId: { type: String, required: true },
  staffNo: String,
  staffName: String,
  role: String,
  department: String,
  designation: String,
  month: String,
  year: String,
  basicSalary: Number,
  allowances: Number,
  deductions: Number,
  netSalary: Number,
  status: { type: String, default: 'Paid' },
  payDate: Date,
  paymentMethod: { type: String, default: 'Bank Transfer' },
  transactionRef: String
}, { timestamps: true });

export const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);

// Staff Attendance Schema
const staffAttendanceSchema = new mongoose.Schema({
  staffId: { type: String, required: true },
  staffNo: String,
  name: String,
  role: String,
  department: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Late', 'present', 'absent', 'leave', 'late'], default: 'Present' },
  remarks: String
}, { timestamps: true });

export const StaffAttendance = mongoose.models.StaffAttendance || mongoose.model('StaffAttendance', staffAttendanceSchema);

// Bank Payment Schema
const bankPaymentSchema = new mongoose.Schema({ 
  studentName: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  admissionNo: String,
  className: String,
  section: String,
  date: { type: Date, default: Date.now }, 
  amount: { type: Number, required: true }, 
  transactionId: String,
  bankName: String,
  note: String, 
  file: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' } 
}, { timestamps: true });

export const BankPayment = mongoose.models.BankPayment || mongoose.model('BankPayment', bankPaymentSchema);

// Exam Schedule Schema
const examScheduleSchema = new mongoose.Schema({
  examId: String,
  examName: String,
  classId: String,
  className: String,
  sectionId: String,
  sectionName: String,
  scheduleItems: [{
    subjectId: String,
    subjectName: String,
    date: String,
    startTime: String,
    endTime: String,
    room: String,
    totalMarks: Number,
    passingMarks: Number,
    invigilator: String
  }]
}, { timestamps: true });

export const ExamSchedule = mongoose.models.ExamSchedule || mongoose.model('ExamSchedule', examScheduleSchema);

// Online Exam Schema
const onlineExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  examCode: { type: String, unique: true, sparse: true },
  classId: String,
  className: String,
  subjectId: String,
  subjectName: String,
  date: Date,
  duration: { type: Number, default: 30 },
  totalMarks: { type: Number, default: 100 },
  minPercentage: { type: Number, default: 50 },
  status: { type: String, enum: ['Draft', 'Active', 'Completed', 'Closed'], default: 'Active' },
  questions: [{
    question: String,
    optionA: String,
    optionB: String,
    optionC: String,
    optionD: String,
    correctAnswer: String,
    marks: Number
  }]
}, { timestamps: true });

export const OnlineExam = mongoose.models.OnlineExam || mongoose.model('OnlineExam', onlineExamSchema);

// ClassRoom Schema
const classRoomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true },
  capacity: { type: Number, required: true }
}, { timestamps: true });
export const ClassRoom = mongoose.models.ClassRoom || mongoose.model('ClassRoom', classRoomSchema);

// ClassTeacher Schema
const classTeacherSchema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  teacher: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });
classTeacherSchema.index({ className: 1, section: 1 });
export const ClassTeacher = mongoose.models.ClassTeacher || mongoose.model('ClassTeacher', classTeacherSchema);

// AssignSubject Schema
const assignSubjectSchema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: String, required: true },
  type: { type: String, enum: ['Theory', 'Practical', 'Both'], default: 'Theory' }
}, { timestamps: true });
assignSubjectSchema.index({ className: 1, section: 1, subject: 1 });
export const AssignSubject = mongoose.models.AssignSubject || mongoose.model('AssignSubject', assignSubjectSchema);

// AI Conversation Schema
const aiConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  title: { type: String, default: 'New Conversation', trim: true },
  role: { type: String, default: 'User' },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });
export const AIConversation = mongoose.models.AIConversation || mongoose.model('AIConversation', aiConversationSchema);

// AI Message Schema
const aiMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIConversation', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
  content: { type: String, required: true },
  navAction: {
    route: { type: String },
    label: { type: String },
    description: { type: String }
  },
  dataCard: {
    type: { type: String },
    data: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });
export const AIMessage = mongoose.models.AIMessage || mongoose.model('AIMessage', aiMessageSchema);






