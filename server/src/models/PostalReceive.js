const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, default: 'Admin' },
  role: { type: String, default: 'Admin' },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { _id: false });

const schema = new mongoose.Schema({
  receiveId: { 
    type: String, 
    unique: true, 
    sparse: true, 
    index: true 
  },
  // Sender Information
  fromTitle: { 
    type: String, 
    required: [true, 'From title / sender name is required'],
    trim: true 
  },
  senderName: { 
    type: String, 
    trim: true 
  },
  senderType: { 
    type: String, 
    enum: ['Individual', 'Organization', 'Government Office', 'School/Institution', 'Company', 'Other'],
    default: 'Individual' 
  },
  address: { 
    type: String, 
    trim: true 
  },
  phone: { 
    type: String, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true 
  },

  // Postal & Document Details
  postalType: { 
    type: String, 
    required: [true, 'Postal type is required'],
    enum: ['Letter', 'Application', 'Parcel', 'Courier', 'Notice', 'Document', 'Other'],
    default: 'Letter' 
  },
  subject: { 
    type: String, 
    required: [true, 'Subject / title is required'],
    trim: true 
  },
  referenceNo: { 
    type: String, 
    trim: true 
  },
  note: { 
    type: String, 
    trim: true 
  },

  // Receiving Information
  receiveDate: { 
    type: Date, 
    default: Date.now,
    required: [true, 'Receive date is required'] 
  },
  date: { 
    type: String 
  },
  receiveTime: { 
    type: String, 
    trim: true 
  },
  receivedBy: { 
    type: String, 
    trim: true,
    default: 'Admin' 
  },

  // To / Destination
  toTitle: { 
    type: String, 
    required: [true, 'To title / destination is required'],
    trim: true 
  },
  department: { 
    type: String, 
    trim: true,
    default: 'Administration' 
  },
  recipientStaffId: { 
    type: String 
  },
  recipientStaffName: { 
    type: String, 
    trim: true 
  },

  // Forwarding / Assignment
  forwardedTo: { 
    type: String, 
    trim: true 
  },
  forwardedToId: { 
    type: String 
  },
  forwardDate: { 
    type: Date 
  },
  forwardRemarks: { 
    type: String, 
    trim: true 
  },

  // Status & Lifecycle
  status: { 
    type: String, 
    enum: ['Received', 'Forwarded', 'In Process', 'Completed'], 
    default: 'Received' 
  },
  completedDate: { 
    type: Date 
  },
  completionRemarks: { 
    type: String, 
    trim: true 
  },
  completedBy: { 
    type: String, 
    trim: true 
  },

  // Attachment
  attachmentUrl: { 
    type: String 
  },

  // History / Audit Trail
  history: [historySchema]
}, { timestamps: true });

// Pre-save hook for auto-generating unique Receive ID & field synchronization
schema.pre('save', async function (next) {
  try {
    if (!this.receiveId) {
      const year = new Date().getFullYear();
      const prefix = `PR-${year}-`;
      const count = await this.constructor.countDocuments({
        receiveId: new RegExp(`^${prefix}`)
      });
      const nextSeq = String(count + 1).padStart(4, '0');
      this.receiveId = `${prefix}${nextSeq}`;
    }

    if (!this.senderName && this.fromTitle) {
      this.senderName = this.fromTitle;
    }
    if (!this.fromTitle && this.senderName) {
      this.fromTitle = this.senderName;
    }

    if (this.receiveDate && !this.date) {
      this.date = this.receiveDate.toISOString().split('T')[0];
    } else if (this.date && !this.receiveDate) {
      this.receiveDate = new Date(this.date);
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('PostalReceive', schema);
