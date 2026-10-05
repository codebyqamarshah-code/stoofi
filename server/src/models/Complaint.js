const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, default: 'Admin' },
  role: { type: String, default: 'Admin' },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { _id: false });

const schema = new mongoose.Schema({
  complaintId: { 
    type: String, 
    unique: true, 
    sparse: true, 
    index: true 
  },
  complaintType: { 
    type: String, 
    required: [true, 'Complaint type is required'],
    enum: ['Academic', 'Administrative']
  },
  source: { 
    type: String, 
    required: [true, 'Complaint source is required'],
    enum: ['Parent', 'Student', 'Staff']
  },
  complainantName: { 
    type: String, 
    required: [true, 'Complainant name is required'],
    trim: true 
  },
  complaintBy: { 
    type: String,
    trim: true
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  },
  studentName: { 
    type: String, 
    trim: true 
  },
  studentClass: { 
    type: String, 
    trim: true 
  },
  studentRoll: { 
    type: String, 
    trim: true 
  },
  staffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff' 
  },
  staffName: { 
    type: String, 
    trim: true 
  },
  staffRole: { 
    type: String, 
    trim: true 
  },
  phone: { 
    type: String,
    trim: true
  },
  subject: { 
    type: String, 
    required: [true, 'Subject is required'],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'], 
    default: 'Medium' 
  },
  assignedTo: { 
    type: String,
    trim: true,
    default: 'Unassigned'
  },
  assignedToId: { 
    type: String 
  },
  complaintDate: { 
    type: Date, 
    default: Date.now 
  },
  date: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Pending' 
  },
  actionTaken: { 
    type: String,
    trim: true
  },
  resolvedBy: { 
    type: String,
    trim: true
  },
  resolvedDate: { 
    type: Date 
  },
  closedDate: { 
    type: Date 
  },
  resolutionNotes: { 
    type: String,
    trim: true
  },
  attachmentUrl: { 
    type: String 
  },
  note: { 
    type: String 
  },
  assigned: { 
    type: String 
  },
  history: [historySchema]
}, { timestamps: true });

// Pre-save hook for auto-generating unique Complaint ID & sync legacy fields
schema.pre('save', async function (next) {
  try {
    if (!this.complaintId) {
      const year = new Date().getFullYear();
      // Count total complaints of this year
      const prefix = `CMP-${year}-`;
      const count = await this.constructor.countDocuments({
        complaintId: new RegExp(`^${prefix}`)
      });
      const nextSeq = String(count + 1).padStart(4, '0');
      this.complaintId = `${prefix}${nextSeq}`;
    }

    if (!this.complaintBy && this.complainantName) {
      this.complaintBy = this.complainantName;
    }
    if (!this.complainantName && this.complaintBy) {
      this.complainantName = this.complaintBy;
    }

    if (!this.assigned && this.assignedTo) {
      this.assigned = this.assignedTo;
    }
    if (!this.assignedTo && this.assigned) {
      this.assignedTo = this.assigned;
    }

    if (this.complaintDate && !this.date) {
      this.date = this.complaintDate.toISOString().split('T')[0];
    } else if (this.date && !this.complaintDate) {
      this.complaintDate = new Date(this.date);
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Complaint', schema);
