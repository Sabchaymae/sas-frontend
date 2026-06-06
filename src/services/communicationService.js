import axios from 'axios';

const communicationApi = axios.create({
  baseURL: 'http://localhost:8080/api/communication/',
  headers: {
    'Accept': 'application/json',
  },
});

communicationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

communicationApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export const communicationService = {
  // Conversations
  getConversations: () => communicationApi.get('api/v1/conversations'),
  createConversation: (data) => communicationApi.post('api/v1/conversations', data),
  getConversation: (id) => communicationApi.get(`api/v1/conversations/${id}`),
  deleteConversation: (id) => communicationApi.delete(`api/v1/conversations/${id}`),

  // Messages
  getMessages: (conversationId, page = 1) =>
    communicationApi.get(`api/v1/conversations/${conversationId}/messages?page=${page}`),
  sendMessage: (conversationId, data) => {
    // Let Axios handle Content-Type for FormData (to include boundary)
    // For regular objects, it will default to application/json
    return communicationApi.post(`api/v1/conversations/${conversationId}/messages`, data);
  },
  updateMessage: (conversationId, messageId, data) => {
    return communicationApi.put(`api/v1/conversations/${conversationId}/messages/${messageId}`, data);
  },
  deleteMessage: (conversationId, messageId) =>
    communicationApi.delete(`api/v1/conversations/${conversationId}/messages/${messageId}`),
  markAsRead: (conversationId) =>
    communicationApi.post(`api/v1/conversations/${conversationId}/read`),

  // Real-time actions
  sendTypingIndicator: (conversationId, isTyping) =>
    communicationApi.post(`api/v1/conversations/${conversationId}/typing`, { is_typing: isTyping }),

  // Groups
  addGroupMembers: (conversationId, userIds) =>
    communicationApi.post(`api/v1/conversations/${conversationId}/members`, { user_ids: userIds }),
  removeGroupMember: (conversationId, userId) =>
    communicationApi.delete(`api/v1/conversations/${conversationId}/members/${userId}`),
  leaveGroup: (conversationId) =>
    communicationApi.post(`api/v1/conversations/${conversationId}/leave`),
  deleteGroup: (conversationId) =>
    communicationApi.delete(`api/v1/conversations/${conversationId}/group`),

  // Group Invitations
  inviteGroupMembers: (conversationId, userIds) =>
    communicationApi.post(`api/v1/conversations/${conversationId}/invitations`, { user_ids: userIds }),
  getInvitations: () =>
    communicationApi.get('api/v1/invitations'),
  acceptInvitation: (id) =>
    communicationApi.post(`api/v1/invitations/${id}/accept`),
  rejectInvitation: (id) =>
    communicationApi.post(`api/v1/invitations/${id}/reject`),

  // Blocking & Archiving
  getBlocks: () => communicationApi.get('api/v1/blocks'),
  blockUser: (userId) => communicationApi.post('api/v1/blocks', { user_id: userId }),
  unblockUser: (userId) => communicationApi.delete(`api/v1/blocks/${userId}`),

  getArchives: () => communicationApi.get('api/v1/archives'),
  archiveConversation: (id) => communicationApi.post(`api/v1/conversations/${id}/archive`),
  unarchiveConversation: (id) => communicationApi.delete(`api/v1/conversations/${id}/archive`),

  // Search
  searchUsers: (query) => communicationApi.get(`api/v1/search/users?q=${encodeURIComponent(query)}`),
};

export default communicationService;

