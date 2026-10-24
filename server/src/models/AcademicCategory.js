const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  description: { type: String, default: '' },
  applicableStageType: { 
    type: String, 
    enum: ['Part', 'Semester', 'Term', 'Module'], 
    default: 'Semester' 
  },
  displayOrder: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

schema.index({ status: 1, displayOrder: 1 });

module.exports = mongoose.model('AcademicCategory', schema);
