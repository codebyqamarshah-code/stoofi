const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "F.Sc Operation Theater Technology (OTT)"
  code: { type: String, required: true, trim: true, uppercase: true, unique: true }, // e.g. "FSC-OTT"
  qualificationName: { type: String, default: '' }, // e.g. "Higher Secondary School Certificate (HSSC)"
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicCategory', required: true },
  categoryName: { type: String, default: '' },
  department: { type: String, default: 'Academics' },
  description: { type: String, default: '' },
  academicPattern: { 
    type: String, 
    enum: ['Annual', 'Semester', 'Term', 'Modular'], 
    default: 'Annual' 
  },
  defaultDuration: { type: String, default: '2 Years' },
  totalStages: { type: Number, default: 2 }, // e.g. 2 for Parts, 8 for BS Semesters, 4 for ADP
  stageType: { 
    type: String, 
    enum: ['Part', 'Semester', 'Term', 'Module'], 
    default: 'Part' 
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

schema.index({ category: 1, status: 1 });
schema.index({ code: 1 });

module.exports = mongoose.model('Program', schema);
