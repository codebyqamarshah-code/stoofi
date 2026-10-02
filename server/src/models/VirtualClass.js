const mongoose = require('mongoose');

const VirtualClassSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['class', 'meeting'],
      default: 'class',
    },
    provider: {
      type: String,
      enum: ['gmeet', 'zoom', 'bbb', 'jitsi'],
      default: 'gmeet',
    },
    classVal: {
      type: String,
      trim: true,
      default: 'All Classes',
    },
    section: {
      type: String,
      trim: true,
      default: 'All Sections',
    },
    subject: {
      type: String,
      trim: true,
      default: 'General',
    },
    teacher: {
      type: String,
      required: [true, 'Teacher or Host name is required'],
      trim: true,
    },
    hostEmail: {
      type: String,
      trim: true,
    },
    audience: {
      type: String,
      default: 'All Students',
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    duration: {
      type: Number,
      default: 45, // in minutes
    },
    meetCode: {
      type: String,
      trim: true,
    },
    roomUrl: {
      type: String,
      required: [true, 'Google Meet URL is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Live', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    description: {
      type: String,
      trim: true,
    },
    totalEnrolled: {
      type: Number,
      default: 30,
    },
    attendedCount: {
      type: Number,
      default: 0,
    },
    recordingUrl: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

VirtualClassSchema.index({ type: 1, date: 1, status: 1 });
VirtualClassSchema.index({ classVal: 1, section: 1 });

module.exports = mongoose.models.VirtualClass || mongoose.model('VirtualClass', VirtualClassSchema);
