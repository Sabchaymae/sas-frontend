import { create } from 'zustand';
import { communicationService } from '../services/communicationService';
import useChatStore from './useChatStore';

const useInvitationStore = create((set, get) => ({
  invitations: [],
  loading: false,
  error: null,

  fetchInvitations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await communicationService.getInvitations();
      set({ invitations: response || [], loading: false });
    } catch (error) {
      set({ error: error.message || 'Error fetching invitations', loading: false });
    }
  },

  acceptInvitation: async (id) => {
    try {
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
    }
  },

  rejectInvitation: async (id) => {
    try {
      await communicationService.rejectInvitation(id);
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
      
      const newInvitation = {
        id: invitationId,
        conversation_id: data.conversation_id,
        conversation: data.conversation || { name: data.conversation_name },
        invited_by: data.inviter_id || data.invited_by,
        inviter: data.inviter || { 
          prenom: (data.inviter_name || '').split(' ')[0], 
          nom: (data.inviter_name || '').split(' ').slice(1).join(' ') 
        },
        status: data.status || 'pending',
        created_at: data.created_at || new Date().toISOString()
      };

      return {
        invitations: [newInvitation, ...state.invitations]
      };
    });
  }
}));

export default useInvitationStore;
