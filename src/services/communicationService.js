import axios from 'axios';

const communicationApi = axios.create({
  baseURL: 'http://localhost:8090/api/communication/',
  headers: {
    'Accept': 'application/json',
  },
});

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
