const mongoose = require('mongoose');

const phoneCallLogSchema = new mongoose.Schema({
  callType: { 
    type: String, 
    enum: ['Incoming', 'Outgoing'],
    required: [true, 'Call type (Incoming/Outgoing) is required'],
    default: 'Incoming',
    index: true
  },
  name: { 
    type: String, 
    required: [true, 'Caller / Contact name is required'],
    trim: true,
    index: true
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^((\+92)|(0092)|(0))?3[0-9]{9}$|^(\+?[1-9]\d{1,14})$|^[0-9\s\-+()]{7,20}$/, 'Please enter a valid phone number'],
    index: true
  },
  contactType: { 
    type: String, 
    enum: ['Parent / Guardian', 'Student', 'Teacher', 'Staff', 'Vendor', 'Visitor', 'Other'],
    default: 'Parent / Guardian',
    index: true
  },
  relatedPersonId: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Student', 'Staff', 'Teacher', 'Visitor', 'Other'],
    default: 'Student'
  },
  relatedPersonName: { 
    type: String, 
    trim: true,
    default: ''
  },
  purpose: { 
    type: String, 
    required: [true, 'Call purpose is required'],
    trim: true,
    index: true
  },
  date: { 
    type: String, 
    required: [true, 'Call date is required'],
    default: () => new Date().toISOString().split('T')[0]
  },
  time: { 
    type: String, 
    trim: true,
    default: ''
  },
  duration: { 
    type: String, 
    trim: true,
    default: '5 mins'
  },
  followUp: { 
    type: String, 
    enum: ['Yes', 'No'],
    default: 'No',
    index: true
  },
  followUpDate: { 
    type: String, 
    default: ''
  },
  followUpStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Not Required'],
    default: 'Not Required',
    index: true
  },
  assignedTo: { 
    type: String, 
    trim: true,
    default: 'Front Desk Admin'
  },
  assignedToId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  description: { 
    type: String, 
    trim: true,
    default: ''
  },
  note: { 
    type: String, 
    trim: true,
    default: ''
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('PhoneCallLog', phoneCallLogSchema);
