const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  contentType: { type: String, required: true },
  youtubeLink: { type: String },
  fileUrl: { type: String },
  fileType: { type: String },
  fileName: { type: String },
  fileSize: { type: String },
  title: { type: String },
  className: { type: String },
  section: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Content', schema);

