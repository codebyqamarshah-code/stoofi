const mongoose = require('mongoose');

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

module.exports = mongoose.models.FrontendCMS || mongoose.model('FrontendCMS', frontendCmsSchema);
