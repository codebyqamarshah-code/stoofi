import api from '@/services/api';

export const aiApi = {
  // Send message to AI
  sendMessage: async ({ message, conversationId, pageContext }) => {
    return await api.post('/ai/chat', { message, conversationId, pageContext });
  },

  // Get conversation list
  getConversations: async () => {
    return await api.get('/ai/conversations');
  },

  // Get messages for a conversation
  getConversation: async (id) => {
    return await api.get(`/ai/conversations/${id}`);
  },

  // Rename a conversation
  renameConversation: async (id, title) => {
    return await api.put(`/ai/conversations/${id}`, { title });
  },

  // Delete a conversation
  deleteConversation: async (id) => {
    return await api.delete(`/ai/conversations/${id}`);
  },

  // Clear all messages in a conversation
  clearMessages: async (id) => {
    return await api.delete(`/ai/conversations/${id}/messages`);
  },

  // Check AI online status
  getStatus: async () => {
    return await api.get('/ai/status');
  }
};

export default aiApi;
