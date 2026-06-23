import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  reactionNotifications: [],
  unreadReactionCount: 0,

  // ── Annonces temps réel ────────────────────────────────────────────────────
  announcementNotifications: [],   // { id, type, announcement_id, title, body, author_name, created_at }
  unreadAnnouncementCount: 0,

  addAnnouncementNotification: (notif) => {
    set((state) => ({
      announcementNotifications: [notif, ...state.announcementNotifications],
      unreadAnnouncementCount: state.unreadAnnouncementCount + 1,
    }));
  },

  markAllAnnouncementsRead: () => {
    set({ unreadAnnouncementCount: 0 });
  },

  clearAnnouncementNotifications: () => {
    set({ announcementNotifications: [], unreadAnnouncementCount: 0 });
  },
  // ──────────────────────────────────────────────────────────────────────────

  addNotification: (notification) => {
    const data = notification.data || notification;
    const type = data.type || notification.type || '';

    if (type === 'message_reaction') {
      set((state) => ({
        reactionNotifications: [{ ...data, read_at: null }, ...state.reactionNotifications],
        unreadReactionCount: state.unreadReactionCount + 1,
      }));
    } else {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    }
  },

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.read_at).length;
    set({ notifications, unreadCount: unread });
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllReactionsRead: () => {
    set((state) => ({
      reactionNotifications: state.reactionNotifications.map(n => ({
        ...n, read_at: new Date().toISOString(),
      })),
      unreadReactionCount: 0,
    }));
  },
}));

export default useNotificationStore;
