const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Link to User account (set when student logs in or is registered via auth)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Personal Info
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
  emergencyContact: { type: mongoose.Schema.Types.Mixed },
  tcNo: { type: String },
  remarks: { type: String },

  studentCode: { type: String, trim: true, sparse: true },
  whatsapp: { type: String, trim: true },
  emergencyContactName: { type: String },
  emergencyContactRelation: { type: String },
  emergencyContactPhone: { type: String },
  isPermanentProfile: { type: Boolean, default: true },
  activeEnrollmentCount: { type: Number, default: 1 },

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
  guardianCnic: { type: String },
  guardianOccupation: { type: String },
  guardianEmail: { type: String },

  father: {
    name: { type: String },
    phone: { type: String },
    cnic: { type: String },
    occupation: { type: String }
  },
  mother: {
    name: { type: String },
    phone: { type: String },
    occupation: { type: String }
  },
  guardian: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String },
    cnic: { type: String },
    occupation: { type: String },
    address: { type: String },
    email: { type: String }
  },

  // Documents
  document1: { type: String },
  document2: { type: String },
  cnicFront: { type: String },
  cnicBack: { type: String },
  qualificationLevel: { type: String },
  qualificationDocument: { type: String },

  // Dynamic Qualifications Array
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

  // Documents Checklist
  documents: [{
    docType: { type: String },
    status: { type: String, default: 'Pending' },
    verified: { type: Boolean, default: false },
    documentUrl: { type: String }
  }],

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
  carryForwardAmount: { type: Number, default: 0 },

  // ID Card Customization
  cardTemplate: { type: String, default: 'classic-navy' },
  cardLayout: { type: String, default: 'horizontal' },
  themeStyle: { type: String, default: 'classic-navy' },

  // Fees, Concessions & Financials
  feeAdmission: { type: Number, default: 0 },
  feeTuition: { type: Number, default: 0 },
  feeSecurity: { type: Number, default: 0 },
  feeExam: { type: Number, default: 0 },
  feeOther: { type: Number, default: 0 },
  feeGross: { type: Number, default: 0 },
  concessionType: { type: String, default: 'None' },
  concessionValue: { type: Number, default: 0 },
  concessionDiscount: { type: Number, default: 0 },
  concessionReason: { type: String, default: '' },
  netPayable: { type: Number, default: 0 },
  feeNetPayable: { type: Number, default: 0 },
  feePlan: { type: mongoose.Schema.Types.Mixed },
  feesGroup: { type: String, default: '' },
  invoiceNotes: { type: String, default: '' }

}, { timestamps: true });

schema.index({ createdAt: -1 });
schema.index({ admissionNo: 1, rollNo: 1, createdAt: 1 });
schema.index({ rollNo: 1, admissionNo: 1 });
schema.index({ className: 1, section: 1 });
schema.index({ studentCode: 1 });
schema.index({ cnic: 1 });

module.exports = mongoose.model('Student', schema);
