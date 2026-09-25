const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    default: 'Stoofi Public School'
  },
  schoolCode: {
    type: String,
    default: 'STOOFI-001'
  },
  phone: {
    type: String,
    default: '+92 300 1234567'
  },
  email: {
    type: String,
    default: 'info@stoofi.com'
  },
  address: {
    type: String,
    default: 'Main Campus, Model Town, Lahore, Pakistan'
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  currencySymbol: {
    type: String,
    default: 'Rs.'
  },
  academicYear: {
    type: String,
    default: '2026 [Jan-Dec]'
  },
  sessionStartMonth: {
    type: String,
    default: 'January'
  },
  schoolLogo: {
    type: String,
    default: ''
  },
  tagline: {
    type: String,
    default: 'Smart Education & School Management'
  },
  footerText: {
    type: String,
    default: '© 2026 Stoofi ERP. All Rights Reserved.'
  },
  // LMS Settings
  lms: {
    adminCommission: { type: String, default: '15' },
    teacherCommission: { type: String, default: '85' },
    showReviewOption: { type: String, default: 'Enable' },
    showInstructorReview: { type: String, default: 'Enable' },
    showQaOption: { type: String, default: 'Enable' },
    lmsCheckout: { type: String, default: 'Enable' },
    payLater: { type: String, default: 'Enable' },
    payLaterDueDay: { type: String, default: '10' },
    payLaterMessage: { type: String, default: 'Course fee will be added to your monthly school challan invoice.' },
    hosts: { type: [String], default: ['Self', 'Youtube', 'URL', 'Vimeo', 'PDF', 'Word'] },
    showInstructorEnrolled: { type: String, default: 'Enable' },
    autoApproveCourse: { type: String, default: 'Disable' },
    showInstructorCourses: { type: String, default: 'Enable' },
    lessonCompleteManually: { type: String, default: 'Disable' },
    videoSeekBar: { type: String, default: 'Enable' },
    youtubeDefaultPlayer: { type: String, default: 'No' }
  },
  vimeo: {
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    defaultPrivacy: { type: String, default: 'disable' },
    uploadFolder: { type: String, default: 'Stoofi LMS Videos' },
    drmProtection: { type: String, default: 'Enable' },
    maxResolution: { type: String, default: '1080p' }
  },
  // Exam Rule Settings
  examRule: {
    skipExamSchedule: { type: Boolean, default: false },
    skipExamAttendance: { type: Boolean, default: false },
    meritListBy: { type: String, default: 'Roll Number' },
    resultWithProfileImage: { type: Boolean, default: true },
    resultWithHeaderBg: { type: Boolean, default: true },
    resultWithBodyBg: { type: Boolean, default: true },
    resultWithVerticalBorder: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
