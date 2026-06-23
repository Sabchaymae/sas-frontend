import { create } from 'zustand';
<<<<<<< HEAD
import communicationService from '../services/communicationService';
=======
import { communicationService } from '../services/communicationService';
import useChatStore from './useChatStore';
import { useActionToastStore } from '../components/common/ActionToast';
>>>>>>> import/master

const useInvitationStore = create((set, get) => ({
  invitations: [],
  loading: false,
<<<<<<< HEAD

  fetchInvitations: async () => {
    set({ loading: true });
    try {
      const response = await communicationService.getInvitations();
      set({ invitations: response.data || response || [] });
    } catch (error) {
      console.error('Failed to fetch invitations', error);
    } finally {
      set({ loading: false });
    }
  },

  addInvitation: (invitation) => {
    set((state) => ({
      invitations: [invitation, ...state.invitations]
    }));
=======
  error: null,

  // ── Rejoin requests (admin side) ──────────────────────────────────────────
  rejoinRequests: [],
  loadingRejoin: false,

  fetchRejoinRequests: async () => {
    set({ loadingRejoin: true });
    try {
      const data = await communicationService.getRejoinRequests();
      set({ rejoinRequests: Array.isArray(data) ? data : [], loadingRejoin: false });
    } catch {
      set({ loadingRejoin: false });
    }
  },

  acceptRejoinRequest: async (id) => {
    try {
      await communicationService.acceptRejoinRequest(id);
      set(state => ({ rejoinRequests: state.rejoinRequests.filter(r => r.id !== id) }));
      await useChatStore.getState().fetchConversations();
      return true;
    } catch (e) {
      console.error('acceptRejoinRequest error', e);
      // If communicationService now rejects enriched errors, log status/data
      try {
        if (e && typeof e === 'object') {
          console.error('Backend error status:', e.status, 'statusText:', e.statusText, 'data:', e.data);
        }
      } catch (logErr) {
        // ignore
      }
      return false;
    }
  },

  rejectRejoinRequest: async (id) => {
    try {
      await communicationService.rejectRejoinRequest(id);
      set(state => ({ rejoinRequests: state.rejoinRequests.filter(r => r.id !== id) }));
      return true;
    } catch (e) {
      console.error('rejectRejoinRequest error', e);
      return false;
    }
  },

  // Real-time: admin receives a new rejoin request
  addRejoinRequest: (data) => {
    set(state => {
      if (state.rejoinRequests.some(r => r.id === data.request_id)) return state;
      return {
        rejoinRequests: [{
          id:               data.request_id,
          conversation_id:  data.conversation_id,
          conversation_name: data.conversation_name,
          user_id:          data.user_id,
          user_name:        data.user_name,
          status:           data.status || 'pending',
          created_at:       data.created_at || new Date().toISOString(),
        }, ...state.rejoinRequests],
      };
    });
  },

  // Real-time: requester receives the admin's response
  handleRejoinResponse: async (data) => {
    if (data.status === 'accepted') {
      // Immediately update activeConversation so the input bar unlocks without waiting for fetch
      useChatStore.setState(state => {
        const updateConv = (c) => {
          if (!c || c.id !== data.conversation_id) return c;
          return { ...c, user_status: 'active' };
        };
        return {
          conversations: state.conversations.map(updateConv),
          activeConversation: updateConv(state.activeConversation),
        };
      });

      // Then re-fetch to get the full updated conversation (participants list, etc.)
      await useChatStore.getState().fetchConversations();

      // Try to fetch the conversation and set it active so the requester sees it immediately
      try {
        const resp = await communicationService.getConversation(data.conversation_id);
        const conv = resp?.data || resp;
        if (conv) {
          const conversations = useChatStore.getState().conversations;
          const target = conversations.find(c => c.id === conv.id) || conv;
          if (target) useChatStore.getState().setActiveConversation(target);
        }
      } catch (e) {
        // ignore; we've already refreshed list above
      }
      // Show instant toast to requester so they know they're accepted
      try {
        useActionToastStore.getState().showActionToast({ message: 'Votre demande a été acceptée — vous pouvez maintenant envoyer des messages.', type: 'success', autoClose: 4000 });
      } catch (err) {
        // ignore
      }
    }
  },

  fetchInvitations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await communicationService.getInvitations();
      set({ invitations: response || [], loading: false });
    } catch (error) {
      set({ error: error.message || 'Error fetching invitations', loading: false });
    }
>>>>>>> import/master
  },

  acceptInvitation: async (id) => {
    try {
<<<<<<< HEAD
      await communicationService.acceptInvitation(id);
      set((state) => ({
        invitations: state.invitations.filter(i => i.id !== id)
      }));
      // Import chat store dynamically to avoid circular dependency
      const useChatStore = (await import('./useChatStore')).default;
      useChatStore.getState().fetchConversations();
    } catch (error) {
      console.error('Failed to accept invitation', error);
      throw error;
=======
      // First get the invitation to know which conversation it is
      const invitation = get().invitations.find(inv => inv.id === id);
      await communicationService.acceptInvitation(id);
      set(state => ({
        invitations: state.invitations.filter(inv => inv.id !== id)
      }));

      // Refresh conversations list
      await useChatStore.getState().fetchConversations();

      // If we have the conversationId, let's fetch and set it as active
      if (invitation) {
        const response = await communicationService.getConversation(invitation.conversation_id);
        const conv = response?.data || response;
        const conversations = useChatStore.getState().conversations;
        const targetConversation = conversations.find(c => c.id === conv.id) || conv;
        if (targetConversation) {
          useChatStore.getState().setActiveConversation(targetConversation);
        }
      }

      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
>>>>>>> import/master
    }
  },

  rejectInvitation: async (id) => {
    try {
      await communicationService.rejectInvitation(id);
<<<<<<< HEAD
      set((state) => ({
        invitations: state.invitations.filter(i => i.id !== id)
      }));
    } catch (error) {
      console.error('Failed to reject invitation', error);
      throw error;
    }
=======
      set(state => ({
        invitations: state.invitations.filter(inv => inv.id !== id)
      }));
      return true;
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      return false;
    }
  },

  // Called when a real-time notification for group_invitation arrives
  addInvitation: (data) => {
    set(state => {
      const invitationId = data.invitation_id || data.id;
      // Avoid duplicates
      if (state.invitations.some(inv => inv.id === invitationId)) {
        return state;
      }

      const inviterName = data.inviter_name || '';
      const newInvitation = {
        id:              invitationId,
        conversation_id: data.conversation_id,
        conversation:    data.conversation || { name: data.conversation_name || 'Groupe' },
        invited_by:      data.inviter_id || data.invited_by,
        inviter: data.inviter || {
          prenom: inviterName.split(' ')[0] || '',
          nom:    inviterName.split(' ').slice(1).join(' ') || '',
        },
        status:     data.status || 'pending',
        created_at: data.created_at || new Date().toISOString(),
      };

      return {
        invitations: [newInvitation, ...state.invitations],
      };
    });
>>>>>>> import/master
  }
}));

export default useInvitationStore;
