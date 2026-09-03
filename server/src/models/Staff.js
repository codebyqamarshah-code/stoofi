const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  firstName: { type: String, required: true },
  lastName: String,
  email: String,
  phone: String,
  designationId: String,
  departmentId: String,
  joinDate: Date,
  salary: Number,
  status: { type: String, default: 'active' }

}, { timestamps: true });

module.exports = mongoose.model('Staff', schema);
