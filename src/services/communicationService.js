import axios from 'axios';

const communicationApi = axios.create({
<<<<<<< HEAD
  baseURL: 'http://localhost:8090/api/communication/',
=======
  baseURL: 'http://localhost:8080/api/communication/',
>>>>>>> import/master
  headers: {
    'Accept': 'application/json',
  },
});

<<<<<<< HEAD
// Interceptor to add auth token
communicationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const communicationService = {
  // Conversations
  getConversations: async () => {
    const response = await communicationApi.get('api/v1/conversations');
    return response.data;
  },
  
  getConversation: async (id) => {
    const response = await communicationApi.get(`api/v1/conversations/${id}`);
    return response.data;
  },
  
  createConversation: async (data) => {
    const response = await communicationApi.post('api/v1/conversations', data);
    return response.data;
  },
  
  deleteConversation: async (id) => {
    const response = await communicationApi.delete(`api/v1/conversations/${id}`);
    return response.data;
  },

  // Messages
  getMessages: async (conversationId, page = 1) => {
    const response = await communicationApi.get(`api/v1/conversations/${conversationId}/messages?page=${page}`);
    return response.data;
  },
  
  sendMessage: async (conversationId, data) => {
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : {};
    const response = await communicationApi.post(`api/v1/conversations/${conversationId}/messages`, data, { headers });
    return response.data;
  },
  
  markAsRead: async (conversationId) => {
    const response = await communicationApi.post(`api/v1/conversations/${conversationId}/read`);
    return response.data;
  },

  sendTypingIndicator: async (conversationId, isTyping) => {
    const response = await communicationApi.post(`api/v1/conversations/${conversationId}/typing`, { is_typing: isTyping });
    return response.data;
  },

  // Archives
  getArchives: async () => {
    const response = await communicationApi.get('api/v1/archives');
    return response.data;
  },
  
  archiveConversation: async (id) => {
    const response = await communicationApi.post(`api/v1/conversations/${id}/archive`);
    return response.data;
  },
  
  unarchiveConversation: async (id) => {
    const response = await communicationApi.delete(`api/v1/conversations/${id}/archive`);
    return response.data;
  },

  // Users & Search
  searchUsers: async (query) => {
    const response = await communicationApi.get(`api/v1/search/users?q=${query}`);
    return response.data;
  },
  
  blockUser: async (userId) => {
    const response = await communicationApi.post('api/v1/blocked-users', { blocked_id: userId });
    return response.data;
  },
  
  unblockUser: async (userId) => {
    const response = await communicationApi.delete(`api/v1/blocked-users/${userId}`);
    return response.data;
  },

  // Groups
  leaveGroup: async (id) => {
    const response = await communicationApi.post(`api/v1/conversations/${id}/leave`);
    return response.data;
  },
  
  inviteGroupMembers: async (id, userIds) => {
    const response = await communicationApi.post(`api/v1/conversations/${id}/invite`, { user_ids: userIds });
    return response.data;
  },
  
  removeGroupMember: async (id, userId) => {
    const response = await communicationApi.delete(`api/v1/conversations/${id}/members/${userId}`);
    return response.data;
  },
  
  deleteGroup: async (id) => {
    const response = await communicationApi.delete(`api/v1/conversations/${id}/group`);
    return response.data;
  },

  // Invitations
  getInvitations: async () => {
    const response = await communicationApi.get('api/v1/invitations');
    return response.data;
  },
  
  acceptInvitation: async (id) => {
    const response = await communicationApi.post(`api/v1/invitations/${id}/accept`);
    return response.data;
  },
  
  rejectInvitation: async (id) => {
    const response = await communicationApi.post(`api/v1/invitations/${id}/reject`);
    return response.data;
  }
};

export default communicationService;
=======
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
    if (error.response) {
      const err = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        message: error.message,
      };
      return Promise.reject(err);
    }
    return Promise.reject({ message: error.message });
  }
);

export const communicationService = {
  // Conversations
  getConversations: () => communicationApi.get('v1/conversations'),
  createConversation: (data) => communicationApi.post('v1/conversations', data),
  getConversation: (id) => communicationApi.get(`v1/conversations/${id}`),
  deleteConversation: (id) => communicationApi.delete(`v1/conversations/${id}`),

  // Messages
  getMessages: (conversationId, page = 1) =>
    communicationApi.get(`v1/conversations/${conversationId}/messages?page=${page}`),
  sendMessage: (conversationId, data) => {
    // Let Axios handle Content-Type for FormData (to include boundary)
    // For regular objects, it will default to application/json
    return communicationApi.post(`v1/conversations/${conversationId}/messages`, data);
  },
  updateMessage: (conversationId, messageId, data) => {
    return communicationApi.put(`v1/conversations/${conversationId}/messages/${messageId}`, data);
  },
  deleteMessage: (conversationId, messageId) =>
    communicationApi.delete(`v1/conversations/${conversationId}/messages/${messageId}`),
  markAsRead: (conversationId) =>
    communicationApi.post(`v1/conversations/${conversationId}/read`),

  // Real-time actions
  sendTypingIndicator: (conversationId, isTyping) =>
    communicationApi.post(`v1/conversations/${conversationId}/typing`, { is_typing: isTyping }),

  // Groups
  addGroupMembers: (conversationId, userIds) =>
    communicationApi.post(`v1/conversations/${conversationId}/members`, { user_ids: userIds }),
  removeGroupMember: (conversationId, userId) =>
    communicationApi.delete(`v1/conversations/${conversationId}/members/${userId}`),
  leaveGroup: (conversationId) =>
    communicationApi.post(`v1/conversations/${conversationId}/leave`),
  deleteGroup: (conversationId) =>
    communicationApi.delete(`v1/conversations/${conversationId}/group`),

  // Group Invitations
  inviteGroupMembers: (conversationId, userIds) =>
    communicationApi.post(`v1/conversations/${conversationId}/invitations`, { user_ids: userIds }),
  getInvitations: () =>
    communicationApi.get('v1/invitations'),
  acceptInvitation: (id) =>
    communicationApi.post(`v1/invitations/${id}/accept`),
  rejectInvitation: (id) =>
    communicationApi.post(`v1/invitations/${id}/reject`),

  // Blocking & Archiving
  getBlocks: () => communicationApi.get('v1/blocks'),
  blockUser: (userId) => communicationApi.post('v1/blocks', { user_id: userId }),
  unblockUser: (userId) => communicationApi.delete(`v1/blocks/${userId}`),

  getArchives: () => communicationApi.get('v1/archives'),
  archiveConversation: (id) => communicationApi.post(`v1/conversations/${id}/archive`),
  unarchiveConversation: (id) => communicationApi.delete(`v1/conversations/${id}/archive`),

  // Message Reactions
  getMessageReactions: (conversationId, messageId) => 
    communicationApi.get(`v1/conversations/${conversationId}/messages/${messageId}/reactions`),
  toggleReaction: (conversationId, messageId, emoji) => 
    communicationApi.post(`v1/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji }),
  deleteReaction: (conversationId, messageId, reactionId) => 
    communicationApi.delete(`v1/conversations/${conversationId}/messages/${messageId}/reactions/${reactionId}`),

  // Rejoin Requests
  sendRejoinRequest: (conversationId) =>
    communicationApi.post(`v1/conversations/${conversationId}/rejoin-request`),
  getRejoinRequests: () =>
    communicationApi.get('v1/rejoin-requests'),
  acceptRejoinRequest: (id) =>
    communicationApi.post(`v1/rejoin-requests/${id}/accept`),
  rejectRejoinRequest: (id) =>
    communicationApi.post(`v1/rejoin-requests/${id}/reject`),

  // Search
  searchUsers: (query) => communicationApi.get(`v1/search/users?q=${encodeURIComponent(query)}`),

  // ── Announcements ──────────────────────────────────────────────────────────
  getAnnouncements: (showExpired = false) =>
    communicationApi.get('v1/announcements', { params: { show_expired: showExpired ? 1 : 0 } }),
  createAnnouncement: (data) =>
    communicationApi.post('v1/announcements', data),
  updateAnnouncement: (id, data) =>
    communicationApi.put(`v1/announcements/${id}`, data),
  deleteAnnouncement: (id) =>
    communicationApi.delete(`v1/announcements/${id}`),
  reactToAnnouncement: (id, emoji) =>
    communicationApi.post(`v1/announcements/${id}/react`, { emoji }),
  pinAnnouncement: (id) =>
    communicationApi.patch(`v1/announcements/${id}/pin`),
  addAnnouncementComment: (id, body) =>
    communicationApi.post(`v1/announcements/${id}/comments`, { body }),
  replyToAnnouncementComment: (announcementId, commentId, body) =>
    communicationApi.post(`v1/announcements/${announcementId}/comments/${commentId}/replies`, { body }),
  deleteAnnouncementComment: (announcementId, commentId) =>
    communicationApi.delete(`v1/announcements/${announcementId}/comments/${commentId}`),
};

export default communicationService;

>>>>>>> import/master
