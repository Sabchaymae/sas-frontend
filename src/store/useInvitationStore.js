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
  addInvitation: (invitationData) => {
    set(state => {
      // Avoid duplicates
      if (state.invitations.some(inv => inv.id === invitationData.invitation_id)) {
        return state;
      }
      return {
        invitations: [{
          id: invitationData.invitation_id,
          conversation_id: invitationData.conversation_id,
          conversation: { name: invitationData.conversation_name },
          invited_by: invitationData.inviter_id,
          inviter: { prenom: invitationData.inviter_name.split(' ')[0], nom: invitationData.inviter_name.split(' ').slice(1).join(' ') },
          status: 'pending',
          created_at: new Date().toISOString()
        }, ...state.invitations]
      };
    });
  }
}));

export default useInvitationStore;
