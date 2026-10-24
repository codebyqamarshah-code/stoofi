const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "F.Sc OTT — Session 2026-2028 (PBTE Affiliated, Main Campus)"
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
  status: { 
    type: String, 
    enum: ['Approved', 'Draft', 'Suspended', 'Archived'], 
    default: 'Approved' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

schema.index({ programId: 1, sessionYear: -1, status: 1 });
schema.index({ categoryId: 1, status: 1, isActive: 1 });

module.exports = mongoose.model('ProgramOffering', schema);
