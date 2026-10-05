const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, default: 'Admin' },
  role: { type: String, default: 'Admin' },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { _id: false });

const schema = new mongoose.Schema({
  dispatchId: { 
    type: String, 
    unique: true, 
    sparse: true, 
    index: true 
  },
  // Recipient Info
  recipientName: { 
    type: String, 
    required: [true, 'Recipient name is required'],
    trim: true 
  },
  toTitle: { 
    type: String, 
    trim: true 
  },
  toCategory: { 
    type: String, 
    enum: ['Principal', 'Parent/Guardian', 'Government Office', 'Company', 'Bank', 'School', 'University', 'Organization', 'Other'],
    default: 'Other' 
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'],
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

  // Postal Info
  postalType: { 
    type: String, 
    required: [true, 'Postal type is required'],
    enum: ['Letter', 'Application', 'Parcel', 'Courier', 'Notice', 'Document', 'Certificate', 'Other'],
    default: 'Letter' 
  },
  subject: { 
    type: String, 
    required: [true, 'Subject is required'],
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

  // Sender Info
  fromTitle: { 
    type: String, 
    required: [true, 'From title is required'],
    trim: true 
  },
  department: { 
    type: String, 
    trim: true,
    default: 'Administration' 
  },
  dispatchedBy: { 
    type: String, 
    trim: true,
    default: 'Admin' 
  },

  // Dispatch Details
  dispatchDate: { 
    type: Date, 
    default: Date.now,
    required: [true, 'Dispatch date is required'] 
  },
  date: { 
    type: String 
  },
  dispatchTime: { 
    type: String, 
    trim: true 
  },
  dispatchMode: { 
    type: String, 
    required: [true, 'Dispatch mode is required'],
    enum: ['Courier', 'Registered Post', 'Ordinary Post', 'Hand Delivery', 'Office Delivery', 'Other'],
    default: 'Courier' 
  },
  trackingNo: { 
    type: String, 
    trim: true 
  },

  // Status & Lifecycle
  status: { 
    type: String, 
    enum: ['Draft', 'Dispatched', 'Delivered', 'Returned'], 
    default: 'Dispatched' 
  },
  deliveryDate: { 
    type: Date 
  },
  deliveryRemarks: { 
    type: String, 
    trim: true 
  },
  deliveredBy: { 
    type: String, 
    trim: true 
  },
  returnDate: { 
    type: Date 
  },
  returnReason: { 
    type: String, 
    trim: true 
  },
  returnRemarks: { 
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

// Pre-save hook for auto-generating unique Dispatch ID & field synchronization
schema.pre('save', async function (next) {
  try {
    if (!this.dispatchId) {
      const year = new Date().getFullYear();
      const prefix = `PD-${year}-`;
      const count = await this.constructor.countDocuments({
        dispatchId: new RegExp(`^${prefix}`)
      });
      const nextSeq = String(count + 1).padStart(4, '0');
      this.dispatchId = `${prefix}${nextSeq}`;
    }

    if (!this.toTitle && this.recipientName) {
      this.toTitle = this.recipientName;
    }
    if (!this.recipientName && this.toTitle) {
      this.recipientName = this.toTitle;
    }

    if (this.dispatchDate && !this.date) {
      this.date = this.dispatchDate.toISOString().split('T')[0];
    } else if (this.date && !this.dispatchDate) {
      this.dispatchDate = new Date(this.date);
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('PostalDispatch', schema);
