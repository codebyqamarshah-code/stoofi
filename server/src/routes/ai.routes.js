const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  chat,
  getConversations,
  getConversationMessages,
  updateConversation,
  deleteConversation,
  clearConversationMessages,
  getStatus
} = require('../controllers/ai.controller');

// Status can be checked by any authenticated user
router.get('/status', protect, getStatus);

// AI Chat endpoint
router.post('/chat', protect, chat);

// AI Conversations Management
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversationMessages);
router.put('/conversations/:id', protect, updateConversation);
router.delete('/conversations/:id', protect, deleteConversation);
router.delete('/conversations/:id/messages', protect, clearConversationMessages);

module.exports = router;
