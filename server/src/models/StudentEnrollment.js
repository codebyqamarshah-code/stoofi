const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Permanent Student Profile reference
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentCode: { type: String, default: '' },
  studentName: { type: String, required: true },

  // Program Offering reference
  offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgramOffering', required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicCategory' },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  affiliationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliation' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicSession' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },

  // Snapshot details
  programName: { type: String, required: true },
  programCode: { type: String, default: '' },
  categoryName: { type: String, default: '' },
  campusName: { type: String, default: 'Main Campus - Sharaqpur Sharif' },
  affiliationName: { type: String, default: '' },
  sessionName: { type: String, default: '' },
  batchName: { type: String, default: '' },
  sectionName: { type: String, default: 'A' },
  shift: { type: String, enum: ['Morning', 'Evening', 'Weekend'], default: 'Morning' },

  // Official Admission & Roll Number Identifiers (Generated once, Year-based)
  admissionYear: { type: Number, required: true },
  admissionDate: { type: String, required: true },
  admissionNumber: { type: String, required: true, unique: true }, // e.g. "ADM-2023-0001"
  rollNumber: { type: String, required: true }, // e.g. "ROLL-2023-0001"

  // Workflow Statuses
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

  // Multiple Previous Qualifications
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

  // Program-Specific Dynamic Fields (F.Sc / BS / ADP / Diploma / Transfer)
  dynamicFields: { type: mongoose.Schema.Types.Mixed, default: {} },
  programSpecificData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Offering Document Checklist
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

  // Fee Structure & Concession Snapshot
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

  // Audit Logs & Progression History
  history: [{
    action: { type: String, required: true },
    fromStatus: { type: String, default: '' },
    toStatus: { type: String, default: '' },
    actor: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String, default: '' }
  }]
}, { timestamps: true });

schema.index({ studentId: 1, enrollmentStatus: 1 });
schema.index({ offeringId: 1, batchId: 1 });
schema.index({ admissionYear: -1, admissionNumber: 1 });
schema.index({ rollNumber: 1 });

module.exports = mongoose.model('StudentEnrollment', schema);
