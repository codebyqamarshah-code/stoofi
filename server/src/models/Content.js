const mongoose = require('mongoose');

const contentSubmissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  rollNo: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: String, default: '' },
  remarks: { type: String, default: '' },
  status: { type: String, enum: ['Submitted', 'Graded', 'Needs Revision', 'Late'], default: 'Submitted' },
  marksObtained: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 100 },
  teacherFeedback: { type: String, default: '' },
  gradedAt: { type: Date },
  gradedBy: { type: String, default: '' }
}, { timestamps: true });

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  contentType: { 
    type: String, 
    required: true, 
    enum: ['Assignment', 'Syllabus', 'Other Download', 'Study Material'],
    default: 'Assignment' 
  },
  description: { type: String, default: '' },
  availableFor: { type: String, default: 'Student' },
  availAdmin: { type: Boolean, default: false },
  availStudent: { type: Boolean, default: true },
  className: { type: String, default: 'All' },
  section: { type: String, default: 'All' },
  subject: { type: String, default: 'General' },
  academicSession: { type: String, default: '2026-2027' },
  publishDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  status: { type: String, enum: ['Published', 'Draft', 'Archived'], default: 'Published' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileType: { type: String, default: 'pdf' },
  fileSize: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  youtubeLink: { type: String, default: '' },
  category: { 
    type: String, 
    default: 'General',
    enum: [
      'General', 
      'Lecture Notes', 
      'Lab Manual', 
      'Reading Materials', 
      'Reference Documents', 
      'Forms & Templates', 
      'Practical Guides', 
      'Notices', 
      'Course Outline',
      'Other'
    ]
  },
  version: { type: String, default: '1.0' },
  totalMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 50 },
  downloadsCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploaderName: { type: String, default: 'Academic Coordinator' },
  submissions: [contentSubmissionSchema]
}, { timestamps: true });

contentSchema.index({ contentType: 1, status: 1, publishDate: -1 });
contentSchema.index({ className: 1, section: 1 });

module.exports = mongoose.models.Content || mongoose.model('Content', contentSchema);
