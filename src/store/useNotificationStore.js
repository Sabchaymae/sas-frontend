import { create } from 'zustand';

<<<<<<< HEAD
const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  setNotifications: (notifications) => {
    set({ 
      notifications,
      unreadCount: notifications.filter(n => !n.read_at).length
    });
=======
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
>>>>>>> import/master
  },

  markAsRead: (id) => {
    set((state) => ({
<<<<<<< HEAD
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read_at: new Date().toISOString() })),
      unreadCount: 0
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  }
=======
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
>>>>>>> import/master
}));

export default useNotificationStore;
