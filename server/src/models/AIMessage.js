const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIConversation',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system', 'tool'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  navAction: {
    route: { type: String },
    label: { type: String },
    description: { type: String }
  },
  dataCard: {
    type: { type: String }, // 'attendance', 'homework', 'fees', 'stats'
    data: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

module.exports = mongoose.model('AIMessage', aiMessageSchema);
