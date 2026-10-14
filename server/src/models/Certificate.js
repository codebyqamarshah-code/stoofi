const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Certificate title is required'],
    trim: true,
    index: true
  },
  type: { 
    type: String, 
    required: [true, 'Certificate type is required'],
    trim: true,
    default: 'Transfer Certificate'
  },
  description: { 
    type: String, 
    trim: true,
    default: ''
  },
  headerTitle: { 
    type: String, 
    trim: true,
    default: ''
  },
  headerSubtitle: { 
    type: String, 
    trim: true,
    default: 'TO WHOM IT MAY CONCERN'
  },
  templateBody: { 
    type: String, 
    required: [true, 'Certificate template body is required'],
    default: 'This is to certify that [student_name], Son/Daughter of [father_name], having Admission No [admission_no] and Roll No [roll_no], is/was a bona fide student of Class [class_name] (Section [section]) in this institution for the Academic Session [academic_session]. During their stay, their conduct and academic character were exemplary. We wish them all success in their future endeavors.'
  },
  footerLeft: { 
    type: String, 
    trim: true,
    default: 'Date of Issue'
  },
  footerCenter: { 
    type: String, 
    trim: true,
    default: 'Class Teacher / Checked By'
  },
  footerRight: { 
    type: String, 
    trim: true,
    default: 'Principal / Authorized Seal'
  },
  themeStyle: { 
    type: String, 
    enum: ['classic-gold', 'stoofi-emerald', 'royal-navy', 'crimson-merit', 'minimal-tech', 'academic-navy', 'modern-slate'],
    default: 'classic-gold'
  },
  // Field visibility configuration (Kya show karna hai, kya nahi karna)
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
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'],
    default: 'Active',
    index: true
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Certificate', certificateSchema);
