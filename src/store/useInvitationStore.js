import { create } from 'zustand';
import communicationService from '../services/communicationService';

const useInvitationStore = create((set, get) => ({
  invitations: [],
  loading: false,

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
  },

  acceptInvitation: async (id) => {
    try {
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
    }
  },

  rejectInvitation: async (id) => {
    try {
      await communicationService.rejectInvitation(id);
      set((state) => ({
        invitations: state.invitations.filter(i => i.id !== id)
      }));
    } catch (error) {
      console.error('Failed to reject invitation', error);
      throw error;
    }
  }
}));

export default useInvitationStore;
