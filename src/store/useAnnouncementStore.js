import { create } from 'zustand';

/**
 * Centralise l'état des annonces pour le temps réel.
 * AnnouncementsTab s'abonne ici et useWebSockets pousse les updates.
 */
const useAnnouncementStore = create((set, get) => ({
  announcements: [],           // liste complète (hydratée au montage de l'onglet)
  initialised: false,          // true dès que l'onglet a fait un premier fetch

  // ── Hydratation ───────────────────────────────────────────────────────────
  setAnnouncements: (list) => set({ announcements: list, initialised: true }),

  // ── CRUD local (optimistic + temps réel) ──────────────────────────────────
  upsertAnnouncement: (ann) => {
    set((state) => {
      const exists = state.announcements.some(a => a.id === ann.id);
      if (exists) {
        return { announcements: state.announcements.map(a => a.id === ann.id ? ann : a) };
      }
      // Nouvelle annonce : insérer en tête, pinned en priorité
      const next = [ann, ...state.announcements].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      return { announcements: next };
    });
  },

  removeAnnouncement: (id) => {
    set((state) => ({ announcements: state.announcements.filter(a => a.id !== id) }));
  },

  // ── Commentaire temps réel ────────────────────────────────────────────────
  addCommentToAnnouncement: (announcementId, comment) => {
    set((state) => ({
      announcements: state.announcements.map(a => {
        if (a.id !== announcementId) return a;
        const alreadyExists = (a.comments || []).some(c => c.id === comment.id);
        if (alreadyExists) return a;
        return { ...a, comments: [...(a.comments || []), { ...comment, replies: comment.replies || [] }] };
      }),
    }));
  },

  // ── Réponse temps réel ────────────────────────────────────────────────────
  addReplyToComment: (announcementId, commentId, reply) => {
    set((state) => ({
      announcements: state.announcements.map(a => {
        if (a.id !== announcementId) return a;
        return {
          ...a,
          comments: (a.comments || []).map(c => {
            if (c.id !== commentId) return c;
            const alreadyExists = (c.replies || []).some(r => r.id === reply.id);
            if (alreadyExists) return c;
            return { ...c, replies: [...(c.replies || []), reply] };
          }),
        };
      }),
    }));
  },

  // ── Réactions temps réel ──────────────────────────────────────────────────
  updateAnnouncementReactions: (announcementId, reactions) => {
    set((state) => ({
      announcements: state.announcements.map(a =>
        a.id === announcementId ? { ...a, reactions } : a
      ),
    }));
  },
}));

export default useAnnouncementStore;
