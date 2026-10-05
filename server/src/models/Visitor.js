const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Visitor name is required'],
    trim: true 
  },
  noOfPerson: { 
    type: Number, 
    required: [true, 'Number of persons is required'],
    min: [1, 'Number of persons must be at least 1'],
    default: 1 
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^((\+92)|(0092)|(0))?3[0-9]{9}$|^(\+?[1-9]\d{6,14})$/, 'Please provide a valid phone number']
  },
  visitorType: { 
    type: String, 
    enum: ['Parent / Guardian', 'Guest', 'Official', 'Vendor', 'Other'],
    default: 'Parent / Guardian',
    required: [true, 'Visitor type is required']
  },
  purpose: { 
    type: String, 
    required: [true, 'Purpose of visit is required'],
    trim: true 
  },
  whomToMeet: { 
    type: String, 
    required: [true, 'Whom to meet is required'],
    trim: true 
  },
  date: { 
    type: Date, 
    required: [true, 'Visit date is required'],
    default: Date.now 
  },
  inTime: { 
    type: String, 
    required: [true, 'In time is required'],
    trim: true 
  },
  outTime: { 
    type: String, 
    default: null,
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['Inside', 'Checked Out'], 
    default: 'Inside' 
  },
  cnic: { 
    type: String, 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true 
  },
  notes: { 
    type: String, 
    trim: true 
  },
  documentUrl: { 
    type: String 
  }
}, { timestamps: true });

// Auto set status before saving
visitorSchema.pre('save', function() {
  if (this.outTime && this.outTime.trim() !== '') {
    this.status = 'Checked Out';
  } else {
    this.status = 'Inside';
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);
