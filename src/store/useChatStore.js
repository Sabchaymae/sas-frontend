import { create } from 'zustand';
import communicationService from '../services/communicationService';

const useChatStore = create((set, get) => ({
  conversations: [],
  archivedConversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  loadingMoreMessages: false,
  currentMessagesPage: 1,
  hasMoreMessages: true,
  typingUsers: {}, // { conversationId: [userIds] }
  onlineUsers: [], // Array of user IDs (strings)
  totalUnreadMessages: 0, // Compteur global pour le badge du Header

  // Helper to update online status across all relevant state parts
  _updateOnlineStatus: (state, onlineIds) => {
    const updateConv = (c) => {
      if (c.type === 'private' && c.other_user) {
        return {
          ...c,
          other_user: {
            ...c.other_user,
            online: onlineIds.includes(String(c.other_user.id))
          }
        };
      }
      return c;
    };

    return {
      conversations: state.conversations.map(updateConv),
      archivedConversations: state.archivedConversations.map(updateConv),
      activeConversation: (state.activeConversation?.type === 'private' && state.activeConversation.other_user)
        ? {
            ...state.activeConversation,
            other_user: {
              ...state.activeConversation.other_user,
              online: onlineIds.includes(String(state.activeConversation.other_user.id))
            }
          }
        : state.activeConversation
    };
  },

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const [convData, archiveData] = await Promise.all([
        communicationService.getConversations(),
        communicationService.getArchives()
      ]);
      let newConversations = Array.isArray(convData) ? convData : convData.data || [];
      const archivedConversations = Array.isArray(archiveData)
        ? archiveData.map(item => item.conversation).filter(Boolean)
        : [];
      
      set((state) => {
        // First set the new data
        const nextState = {
          ...state,
          conversations: newConversations,
          archivedConversations,
          totalUnreadMessages: newConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
        };

        // Then apply current online status to this new data
        const withOnlineStatus = state._updateOnlineStatus(nextState, state.onlineUsers);

        // Also sync activeConversation if it's in the refreshed list
        const refreshedActive = nextState.conversations.find(
          c => c.id === state.activeConversation?.id
        );

        return {
          ...nextState,
          ...withOnlineStatus,
          ...(refreshedActive ? { activeConversation: withOnlineStatus.conversations.find(c => c.id === refreshedActive.id) || refreshedActive } : {}),
        };
      });
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchArchivedConversations: async () => {
    try {
      const data = await communicationService.getArchives();
      const archivedConversations = Array.isArray(data)
        ? data.map(item => item.conversation).filter(Boolean)
        : [];
      set({ archivedConversations });
    } catch (error) {
      console.error('Failed to fetch archived conversations', error);
    }
  },

  setActiveConversation: (conversation) => {
    set({ 
      activeConversation: conversation, 
      messages: [], 
      currentMessagesPage: 1, 
      hasMoreMessages: true, 
      loadingMoreMessages: false 
    });
    if (conversation) {
      get().fetchMessages(conversation.id);
      get().markConversationAsRead(conversation.id);
    }
  },

  fetchMessages: async (conversationId, page = 1) => {
    try {
      const response = await communicationService.getMessages(conversationId, page);
      const data = response?.data || [];
      const hasMore = !!response?.next_page_url || !!response?.next_page || !!response?.meta?.current_page < (response?.meta?.last_page || 0);
      
      // Reverse because backend returns latest first, but we want oldest at top
      const reversedData = [...data].reverse();
      
      if (page === 1) {
        set({ messages: reversedData, currentMessagesPage: page, hasMoreMessages: hasMore });
      } else {
        set((state) => ({ 
          messages: [...reversedData, ...state.messages], 
          currentMessagesPage: page,
          hasMoreMessages: hasMore
        }));
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  },

  fetchMoreMessages: async () => {
    const { loadingMoreMessages, hasMoreMessages, currentMessagesPage, activeConversation } = get();
    if (loadingMoreMessages || !hasMoreMessages || !activeConversation) return;
    
    set({ loadingMoreMessages: true });
    try {
      await get().fetchMessages(activeConversation.id, currentMessagesPage + 1);
    } finally {
      set({ loadingMoreMessages: false });
    }
  },

  setMessages: (messages) => set({ messages }),

  updateMessageReactions: (messageId, reactions) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, reactions } : msg
      )
    }));
  },

  updateMessage: async (messageId, data) => {
    const { activeConversation } = get();
    if (!activeConversation) return;

    try {
      const updatedMessage = await communicationService.updateMessage(activeConversation.id, messageId, data);
      
      // Update the message in the store
      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      }));

      return updatedMessage;
    } catch (error) {
      console.error('Failed to update message', error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    const { activeConversation } = get();
    if (!activeConversation) return;

    // Optimistic UI : marquer immédiatement comme supprimé
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId
          ? { ...msg, is_deleted: true, content: null, attachments: [] }
          : msg
      )
    }));

    try {
      await communicationService.deleteMessage(activeConversation.id, messageId);
      return true;
    } catch (error) {
      console.error('Failed to delete message', error);
      // Rollback si erreur
      set((state) => ({
        messages: state.messages.map(msg =>
          msg.id === messageId ? { ...msg, is_deleted: false } : msg
        )
      }));
      throw error;
    }
  },

  addMessage: (message) => {
    const { activeConversation, messages, conversations } = get();
    
    // Check if this is a system message about group members changing
    const isGroupMemberChange = message.type === 'system' && 
      (message.content.includes('a rejoint') || 
       message.content.includes('a ajouté') || 
       message.content.includes('a retiré') || 
       message.content.includes('a quitté'));
    
    if (isGroupMemberChange) {
      // Refresh the entire conversation to get updated participants and user_status
      get().fetchConversations();
      if (activeConversation && activeConversation.id === message.conversation_id) {
        communicationService.getConversation(message.conversation_id).then(response => {
          const updatedConv = response?.data || response;
          set((state) => ({
            conversations: state.conversations.map(c => c.id === updatedConv.id ? updatedConv : c),
            activeConversation: state.activeConversation?.id === updatedConv.id ? updatedConv : state.activeConversation,
          }));
        });
      }
    }
    
    // 1. If the conversation is brand new and not yet in the sidebar, fetch conversations list
    const conversationExists = conversations.some(c => c.id === message.conversation_id);
    if (!conversationExists) {
      get().fetchConversations();
    }

    // 2. Add message to current conversation's list if active
    if (activeConversation && message.conversation_id === activeConversation.id) {
      // Check if message already exists (to avoid duplicates from Echo + API response)
      if (!messages.find(m => m.id === message.id)) {
        set({ messages: [...messages, message] });
      }
    } else {
      // Message received in a non-active conversation -> increment unread badge
      get().incrementUnreadForConversation(message.conversation_id);
    }
    
    // 3. Update conversations list with last message
    get().updateConversationLastMessage(message);
  },

  sendMessage: async (conversationId, content, user) => {
    const isFormData = content instanceof FormData;
    const tempId = `temp-${Date.now()}`;
    const messageText = isFormData ? content.get('content') : content;

    const tempMessage = {
      id: tempId,
      conversation_id: conversationId,
      user_id: user.id,
      content: messageText || '',
      sending: true,
      created_at: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.full_name || `${user.first_name} ${user.last_name}`,
      },
      attachments: [] // Temporary empty attachments
    };

    // Add temporary message instantly to store
    set((state) => ({
      messages: [...state.messages, tempMessage]
    }));

    try {
      const payload = isFormData ? content : { content };
      const response = await communicationService.sendMessage(conversationId, payload);
      const finalMessage = response?.data || response;

      // Replace temporary message with official API response
      set((state) => ({
        messages: state.messages.map(m => m.id === tempId ? finalMessage : m)
      }));

      // Update conversations list with last message
      get().updateConversationLastMessage(finalMessage);
    } catch (error) {
      console.error('Failed to send message', error);
      // Mark temporary message with error status
      set((state) => ({
        messages: state.messages.map(m => m.id === tempId ? { ...m, sending: false, error: true } : m)
      }));
    }
  },

  incrementUnreadForConversation: (conversationId) => {
    set((state) => {
      const updatedConversations = state.conversations.map(c =>
        c.id === conversationId
          ? { ...c, unread_count: (c.unread_count || 0) + 1 }
          : c
      );
      const total = updatedConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      return { conversations: updatedConversations, totalUnreadMessages: total };
    });
  },

  markConversationAsRead: async (conversationId) => {
    // 1. Instantly update local state for maximum UI responsiveness
    set((state) => {
      const updatedConversations = state.conversations.map(c =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      );
      const total = updatedConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      return { conversations: updatedConversations, totalUnreadMessages: total };
    });

    // 2. Async backend mark-as-read call to persist and broadcast
    try {
      await communicationService.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to mark conversation as read on backend', error);
    }
  },

  updateConversationLastMessage: (message) => {
    const { conversations } = get();
    const updatedConversations = conversations.map(c => {
      if (c.id === message.conversation_id) {
        return {
          ...c,
          last_message: message,
          updated_at: message.created_at
        };
      }
      return c;
    });
    // Sort conversations by last message
    updatedConversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    // Recalculate total unread after sorting
    const total = updatedConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    set({ conversations: updatedConversations, totalUnreadMessages: total });
  },

  setTyping: (conversationId, userId, userName, isTyping) => {
    set((state) => {
      const currentTyping = state.typingUsers[conversationId] || [];
      let updatedTyping;
      if (isTyping) {
        // Add user if not already present
        if (!currentTyping.some(u => u.id === userId)) {
          updatedTyping = [...currentTyping, { id: userId, name: userName }];
        } else {
          updatedTyping = currentTyping;
        }
      } else {
        updatedTyping = currentTyping.filter(u => u.id !== userId);
      }
      
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: updatedTyping
        }
      };
    });
  },

  setOnlineUsers: (users) => {
    console.log('📡 [Presence] setOnlineUsers called with:', users);
    const onlineIds = users.map(u => String(u.id));
    
    set((state) => {
      const updatedPresence = state._updateOnlineStatus(state, onlineIds);
      return {
        ...updatedPresence,
        onlineUsers: onlineIds
      };
    });
  },

  setUserPresence: (user, isOnline) => {
    console.log(`📡 [Presence] setUserPresence: User ${user.id} (${user.name}) is ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    const userIdStr = String(user.id);
    
    set((state) => {
      let nextOnlineUsers;
      if (isOnline) {
        nextOnlineUsers = state.onlineUsers.includes(userIdStr) 
          ? state.onlineUsers 
          : [...state.onlineUsers, userIdStr];
      } else {
        nextOnlineUsers = state.onlineUsers.filter(id => id !== userIdStr);
      }

      const updatedPresence = state._updateOnlineStatus(state, nextOnlineUsers);
      return {
        ...updatedPresence,
        onlineUsers: nextOnlineUsers
      };
    });
  },

  setParticipantLastRead: (conversationId, userId, lastReadAt) => {
    set((state) => {
      const updateConversation = (conv) => {
        if (conv && conv.id === conversationId) {
          const updatedParticipants = conv.participants?.map(p =>
            p.id === userId
              ? { ...p, pivot: { ...p.pivot, last_read_at: lastReadAt } }
              : p
          );
          return { ...conv, participants: updatedParticipants };
        }
        return conv;
      };

      return {
        conversations: state.conversations.map(c => c.id === conversationId ? updateConversation(c) : c),
        archivedConversations: state.archivedConversations.map(c => c.id === conversationId ? updateConversation(c) : c),
        activeConversation: updateConversation(state.activeConversation)
      };
    });
  },

  createConversation: async (data) => {
    set({ loading: true });
    try {
      const response = await communicationService.createConversation(data);
      const newConv = response?.data || response;
      await get().fetchConversations();
      const conversations = get().conversations;
      const found = conversations.find(c => c.id === newConv.id);
      if (found) {
        get().setActiveConversation(found);
      } else {
        get().setActiveConversation(newConv);
      }
      return newConv;
    } catch (error) {
      console.error('Failed to create conversation', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteConversation: async (id) => {
    try {
      await communicationService.deleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter(c => c.id !== id),
        activeConversation: state.activeConversation?.id === id ? null : state.activeConversation
      }));
    } catch (error) {
      console.error('Failed to delete conversation', error);
      throw error;
    }
  },

  archiveConversation: async (id) => {
    try {
      await communicationService.archiveConversation(id);
      set((state) => {
        const conversationToArchive = state.conversations.find(c => c.id === id);
        const updatedArchived = conversationToArchive
          ? [...state.archivedConversations, conversationToArchive]
          : state.archivedConversations;
        
        return {
          conversations: state.conversations.filter(c => c.id !== id),
          archivedConversations: updatedArchived,
          activeConversation: state.activeConversation?.id === id ? null : state.activeConversation
        };
      });
    } catch (error) {
      console.error('Failed to archive conversation', error);
      throw error;
    }
  },

  unarchiveConversation: async (id) => {
    try {
      await communicationService.unarchiveConversation(id);
      set((state) => {
        const conversationToUnarchive = state.archivedConversations.find(c => c.id === id);
        const updatedConversations = conversationToUnarchive
          ? [...state.conversations, conversationToUnarchive].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          : state.conversations;
        
        return {
          archivedConversations: state.archivedConversations.filter(c => c.id !== id),
          conversations: updatedConversations,
          activeConversation: state.activeConversation?.id === id ? null : state.activeConversation
        };
      });
    } catch (error) {
      console.error('Failed to unarchive conversation', error);
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      await communicationService.blockUser(userId);
      await get().fetchConversations();
      const activeConvId = get().activeConversation?.id;
      if (activeConvId) {
        const updatedActive = get().conversations.find(c => c.id === activeConvId);
        if (updatedActive) set({ activeConversation: updatedActive });
      }
    } catch (error) {
      console.error('Failed to block user', error);
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      await communicationService.unblockUser(userId);
      await get().fetchConversations();
      const activeConvId = get().activeConversation?.id;
      if (activeConvId) {
        const updatedActive = get().conversations.find(c => c.id === activeConvId);
        if (updatedActive) set({ activeConversation: updatedActive });
      }
    } catch (error) {
      console.error('Failed to unblock user', error);
      throw error;
    }
  },

  leaveGroup: async (conversationId) => {
    try {
      await communicationService.leaveGroup(conversationId);
      // Update local conversation's user_status to "left"
      set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === conversationId ? { ...c, user_status: 'left' } : c
        ),
        activeConversation: state.activeConversation?.id === conversationId 
          ? { ...state.activeConversation, user_status: 'left' } 
          : state.activeConversation
      }));
    } catch (error) {
      console.error('Failed to leave group', error);
      throw error;
    }
  },

  addGroupMembers: async (conversationId, userIds) => {
    try {
      await communicationService.addGroupMembers(conversationId, userIds);
      const response = await communicationService.getConversation(conversationId);
      const updatedConv = response?.data || response;
      set((state) => ({
        conversations: state.conversations.map(c => c.id === conversationId ? updatedConv : c),
        activeConversation: state.activeConversation?.id === conversationId ? updatedConv : state.activeConversation
      }));
    } catch (error) {
      console.error('Failed to add group members', error);
      throw error;
    }
  },

  removeGroupMember: async (conversationId, userId) => {
    try {
      await communicationService.removeGroupMember(conversationId, userId);
      const response = await communicationService.getConversation(conversationId);
      const updatedConv = response?.data || response;
      set((state) => ({
        conversations: state.conversations.map(c => c.id === conversationId ? updatedConv : c),
        activeConversation: state.activeConversation?.id === conversationId ? updatedConv : state.activeConversation
      }));
    } catch (error) {
      console.error('Failed to remove group member', error);
      throw error;
    }
  },

  deleteGroup: async (conversationId) => {
    try {
      await communicationService.deleteGroup(conversationId);
      // Update local conversation's user_status to "removed" for the admin
      set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === conversationId ? { ...c, user_status: 'removed' } : c
        ),
        activeConversation: state.activeConversation?.id === conversationId 
          ? { ...state.activeConversation, user_status: 'removed' } 
          : state.activeConversation
      }));
    } catch (error) {
      console.error('Failed to delete group', error);
      throw error;
    }
  },

  // Called when the OTHER user blocks/unblocks the current user in real time
  setBlockedByUser: (blockerId, isBlocked) => {
    set((state) => {
      const updateConv = (conv) => {
        if (!conv || conv.type !== 'private') return conv;
        const otherUser = conv.other_user;
        if (!otherUser || String(otherUser.id) !== String(blockerId)) return conv;
        return { ...conv, has_blocked_me: isBlocked };
      };
      return {
        conversations: state.conversations.map(updateConv),
        archivedConversations: state.archivedConversations.map(updateConv),
        activeConversation: updateConv(state.activeConversation),
      };
    });
  },
}));

export default useChatStore;
