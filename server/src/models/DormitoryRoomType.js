const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  roomType: { type: String, required: true },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('DormitoryRoomType', schema);
