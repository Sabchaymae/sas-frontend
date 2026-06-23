import { useEffect, useRef } from 'react';
import { getEcho, resetEcho } from '../lib/echoManager';
import useChatStore from '../store/useChatStore';
import useNotificationStore from '../store/useNotificationStore';
import useInvitationStore from '../store/useInvitationStore';
import useAnnouncementStore from '../store/useAnnouncementStore';
import useAuth from './useAuth';
import { useReactionToastStore } from '../components/common/ReactionToast';

// Shared audio context (initialized on first user interaction)
let audioContext = null;

// Standard notification sound (Base64 encoded short beep/ping)
const NOTIFICATION_SOUND_BASE64 = 'data:audio/wav;base64,UklGRl9vT19XQVZFRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV92T19'; // Placeholder, I will use a better one or synthesis

// Initialize audio context on user interaction
const initAudioContext = () => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  
  // Always resume if suspended (browsers suspend contexts when not in use)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(err => console.error('Failed to resume AudioContext:', err));
  }
  return audioContext;
};

// Add global listener to unlock audio on first interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    initAudioContext();
    console.log('🔊 AudioContext unlocked via user interaction');
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

// Function to play notification sound using Web Audio API
const playNotificationSound = () => {
  console.log('🔔 playNotificationSound called');
  try {
    const ctx = initAudioContext();
    if (!ctx) {
      console.warn('⚠️ No audio context available');
      return;
    }

    // Ensure context is running
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playTone(ctx));
    } else {
      playTone(ctx);
    }
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};

const playTone = (ctx) => {
  // Play a pleasant two-tone notification sound
  const now = ctx.currentTime;
  
  // First tone (higher)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, now); // A5
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.2);

  // Second tone (slightly lower, overlapping)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(698.46, now + 0.1); // F5
  gain2.gain.setValueAtTime(0, now + 0.1);
  gain2.gain.linearRampToValueAtTime(0.2, now + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.1);
  osc2.stop(now + 0.3);
  
  console.log('🔊 Tones played');
};

// Son doux pour les réactions (note unique, légère)
const playReactionSound = () => {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;
    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6 — note claire et légère
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    });
  } catch (e) {
    // ignore
  }
};

export { initAudioContext };
export const useWebSockets = () => {
  // ALWAYS CALL ALL HOOKS FIRST, NO CONDITIONALS!
  const { user, isAuthenticated } = useAuth();
  const addMessage = useChatStore(state => state.addMessage);
  const addNotification = useNotificationStore(state => state.addNotification);
  const addAnnouncementNotification = useNotificationStore(state => state.addAnnouncementNotification);
  const addInvitation = useInvitationStore(state => state.addInvitation);
  const addRejoinRequest = useInvitationStore(state => state.addRejoinRequest);
  const handleRejoinResponse = useInvitationStore(state => state.handleRejoinResponse);
  const conversations = useChatStore(state => state.conversations);
  const activeConversation = useChatStore(state => state.activeConversation);
  const showReactionToast = useReactionToastStore(state => state.showReactionToast);
  const upsertAnnouncement = useAnnouncementStore(state => state.upsertAnnouncement);
  const addCommentToAnnouncement = useAnnouncementStore(state => state.addCommentToAnnouncement);
  const addReplyToComment = useAnnouncementStore(state => state.addReplyToComment);
  const updateAnnouncementReactions = useAnnouncementStore(state => state.updateAnnouncementReactions);
  const setBlockedByUser = useChatStore(state => state.setBlockedByUser);
  
  const userRef = useRef(user);
  const echoRef = useRef(null);
  // Track subscriptions with cleanup functions
  const subscriptionsRef = useRef(new Map()); // key: channelName, value: {channel, cleanup}

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Handle auth state changes: SETUP/TEARDOWN
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('👋 Logging out, resetting WebSocket');
      // Cleanup all subscriptions
      subscriptionsRef.current.forEach(({ cleanup }) => cleanup());
      subscriptionsRef.current.clear();
      resetEcho();
      echoRef.current = null;
      return;
    }

    console.log('🚀 Starting WebSocket connection for user:', user.id);
    const echo = getEcho();
    echoRef.current = echo;

    // Proactively fetch conversations to set up subscriptions early
    useChatStore.getState().fetchConversations();

    // Cleanup function for auth effect
    return () => {
      console.log('🧹 Cleaning up auth WebSocket subscriptions');
      subscriptionsRef.current.forEach(({ cleanup }) => cleanup());
      subscriptionsRef.current.clear();
    };
  }, [user, isAuthenticated]);

  // Subscribe to notifications and presence channels ONLY if auth is good
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const echo = getEcho();

    // 1. Notifications channel
    const notificationChannelName = `notifications.${user.id}`;
    if (!subscriptionsRef.current.has(notificationChannelName)) {
      console.log('📡 Subscribing to notifications channel:', notificationChannelName);
      const channel = echo.private(notificationChannelName);

      const handleNotification = (notification) => {
        console.log('📨 Notification RECEIVED raw:', notification);
        
        // 1. Handle basic notification store
        addNotification(notification);
        
        // 2. Specialized handling based on type
        // Laravel Echo's .notification() might put the payload in notification or notification.data
        const data = notification.data || notification;
        // Normalize type for robust matching (handle namespaced PHP types like App\\Notifications\\...)
        const rawType = data.type || notification.type || '';
        const normType = String(rawType).toLowerCase().replace(/\\\\/g, '.');

        console.log('📨 Notification processed type:', rawType, 'normalized:', normType, 'data:', data);

        // Messages
        if ((normType === 'new_message' || normType.includes('message')) && data.full_message) {
          const state = useChatStore.getState();
          const convExists = state.conversations.some(c => c.id === data.full_message.conversation_id);
          if (!convExists) state.fetchConversations();
          if (activeConversation?.id !== data.full_message.conversation_id) playNotificationSound();

        // Message reactions
        } else if (normType === 'message_reaction' || normType.includes('messagereaction') || rawType.includes('MessageReaction')) {
          console.log('😀 Reaction Notification DETECTED!', data);
          showReactionToast({
            reactorName: data.reactor_name || 'Quelqu\'un',
            emoji: data.emoji || '❤️',
          });
          playReactionSound();

        // Group invitations
        } else if (normType === 'group_invitation' || normType.includes('groupinvitation') || rawType.includes('GroupInvitation')) {
          console.log('🎁 Group Invitation DETECTED!', data);
          playNotificationSound();
          addInvitation(data);

        // Rejoin requests (admin side)
        } else if (normType === 'rejoin_request' || (rawType.includes('RejoinRequest') && !rawType.includes('Response')) || (normType.includes('rejoin') && !normType.includes('response'))) {
          console.log('🔄 Rejoin Request DETECTED!', data);
          playNotificationSound();
          addRejoinRequest(data);

        // Rejoin responses (requester side)
        } else if (normType === 'rejoin_response' || rawType.includes('RejoinRequestResponse') || (normType.includes('rejoin') && normType.includes('response'))) {
          console.log('✅ Rejoin Response DETECTED!', data);
          handleRejoinResponse(data);
          if (data.status === 'accepted') playNotificationSound();
        }
      };

      channel.notification(handleNotification);

      // Real-time block/unblock from the other user
      channel.listen('.user.blocked', (e) => {
        console.log('🚫 user.blocked event received', e);
        if (e.blocker_id && e.is_blocked !== undefined) {
          setBlockedByUser(e.blocker_id, e.is_blocked);
        }
      });

      // Cleanup function for this subscription
      const cleanup = () => {
        console.log('🧹 Unsubscribing from notifications channel');
        channel.stopListening('.notification');
        channel.stopListening('.user.blocked');
      };

      subscriptionsRef.current.set(notificationChannelName, { channel, cleanup });
    }

    // 2. Announcements channel (public — toutes les annonces/commentaires/réponses)
    const announcementsChannelName = 'announcements';
    if (!subscriptionsRef.current.has(announcementsChannelName)) {
      console.log('📡 Subscribing to announcements channel');
      const channel = echo.channel(announcementsChannelName);

      // Nouvelle annonce créée
      channel.listen('.announcement.created', (e) => {
        console.log('📢 announcement.created', e);
        if (!e.announcement) return;
        upsertAnnouncement(e.announcement);
        // Ne pas notifier l'auteur lui-même
        if (e.announcement.author_id !== userRef.current?.id) {
          addAnnouncementNotification({
            id:              `ann-${e.announcement.id}-${Date.now()}`,
            type:            'announcement_created',
            announcement_id: e.announcement.id,
            ann_type:        e.announcement.type,
            title:           e.announcement.title,
            body:            e.announcement.body,
            author_name:     e.announcement.author_name,
            created_at:      e.announcement.created_at,
          });
          playNotificationSound();
        }
      });

      // Nouveau commentaire
      channel.listen('.announcement.comment.added', (e) => {
        console.log('💬 announcement.comment.added', e);
        if (!e.announcement_id || !e.comment) return;
        addCommentToAnnouncement(e.announcement_id, e.comment);
        if (e.comment.user_id !== userRef.current?.id) {
          addAnnouncementNotification({
            id:              `cmt-${e.comment.id}-${Date.now()}`,
            type:            'announcement_comment',
            announcement_id: e.announcement_id,
            title:           `Commentaire de ${e.comment.user_name}`,
            body:            e.comment.body,
            author_name:     e.comment.user_name,
            created_at:      e.comment.created_at,
          });
          playNotificationSound();
        }
      });

      // Nouvelle réponse
      channel.listen('.announcement.comment.replied', (e) => {
        console.log('↩️ announcement.comment.replied', e);
        if (!e.announcement_id || !e.comment_id || !e.reply) return;
        addReplyToComment(e.announcement_id, e.comment_id, e.reply);
        if (e.reply.user_id !== userRef.current?.id) {
          addAnnouncementNotification({
            id:              `rep-${e.reply.id}-${Date.now()}`,
            type:            'announcement_reply',
            announcement_id: e.announcement_id,
            title:           `Réponse de ${e.reply.user_name}`,
            body:            e.reply.body,
            author_name:     e.reply.user_name,
            created_at:      e.reply.created_at,
          });
          playNotificationSound();
        }
      });

      // Réaction mise à jour
      channel.listen('.announcement.reaction.updated', (e) => {
        console.log('😀 announcement.reaction.updated', e);
        if (!e.announcement_id || !e.reactions) return;
        updateAnnouncementReactions(e.announcement_id, e.reactions);
        // Afficher le toast seulement si c'est une réaction ajoutée/modifiée par quelqu'un d'autre
        if (e.action !== 'removed' && e.user_id !== userRef.current?.id) {
          showReactionToast({
            reactorName: e.reactor_name || 'Quelqu\'un',
            emoji: e.emoji,
          });
          playReactionSound();
        }
      });

      const cleanup = () => {
        console.log('🧹 Unsubscribing from announcements channel');
        channel.stopListening('.announcement.created');
        channel.stopListening('.announcement.comment.added');
        channel.stopListening('.announcement.comment.replied');
        channel.stopListening('.announcement.reaction.updated');
        echo.leaveChannel(announcementsChannelName);
      };
      subscriptionsRef.current.set(announcementsChannelName, { channel, cleanup });
    }

    // 3. Presence channel
    const presenceChannelName = 'presence.chat';
    if (!subscriptionsRef.current.has(presenceChannelName)) {
      console.log('📡 Subscribing to presence channel:', presenceChannelName);
      const channel = echo.join(presenceChannelName);

      channel.here((users) => {
        console.log('👥 Online users INITIAL LIST:', users);
        useChatStore.getState().setOnlineUsers(users);
      });
      
      channel.joining((joiningUser) => {
        console.log('✅ User JOINED:', joiningUser);
        useChatStore.getState().setUserPresence(joiningUser, true);
      });
      
      channel.leaving((leavingUser) => {
        console.log('❌ User LEFT:', leavingUser);
        useChatStore.getState().setUserPresence(leavingUser, false);
      });

      channel.error((error) => {
        console.error('❌ Presence channel ERROR:', error);
      });

      const cleanup = () => {
        console.log('🧹 Leaving presence channel:', presenceChannelName);
        echo.leave(presenceChannelName);
      };
      
      subscriptionsRef.current.set(presenceChannelName, { channel, cleanup });
    }
  }, [user, isAuthenticated]);

  // 3. Subscribe to chat channels for each conversation
  useEffect(() => {
    if (!isAuthenticated || !user || !conversations) return;

    const echo = getEcho();

    console.log('🔄 Checking chat channels for', conversations.length, 'conversations');
    
    conversations.forEach(conv => {
      const chatChannelName = `chat.${conv.id}`;
      const convChannelName = `conversation.${conv.id}`;

      // 1. Subscribe to chat channel (messages)
      if (!subscriptionsRef.current.has(chatChannelName)) {
        console.log('📡 Subscribing to chat channel:', chatChannelName);
        const channel = echo.private(chatChannelName);
        
        const handleMessageSent = (e) => {
          console.log('💬 Message RECEIVED (.message.sent):', e);
          if (e.message) {
            const state = useChatStore.getState();
            const existingMsg = state.messages.find(m => m.id === e.message.id);
            if (existingMsg) {
              state.setMessages(
                state.messages.map(m => 
                  m.id === e.message.id ? e.message : m
                )
              );
            } else if (e.message.user_id !== userRef.current?.id) {
              addMessage(e.message);
              // Play sound if message is not in active conversation!
              if (!state.activeConversation || state.activeConversation.id !== e.message.conversation_id) {
                playNotificationSound();
              }
            }
          }
        };

        const handleMessageDeleted = (e) => {
          console.log('🗑️ Message DELETED (.message.deleted):', e);
          if (e.message) {
            const state = useChatStore.getState();
            // Remplacer par la version "supprimé" — ne pas filtrer
            state.setMessages(
              state.messages.map(m =>
                m.id === e.message.id
                  ? { ...m, is_deleted: true, content: null, attachments: [] }
                  : m
              )
            );
          }
        };

        const handleMessageReactionUpdated = (e) => {
          console.log('😀 Reaction UPDATED (.MessageReactionUpdated):', e);
          if (e.message_id && e.reactions) {
            useChatStore.getState().updateMessageReactions(e.message_id, e.reactions);
          }

          // Toast si c'est une réaction sur un de mes messages
          if (e.action !== 'removed' && e.user_id !== userRef.current?.id) {
            const state = useChatStore.getState();
            const targetMsg = state.messages.find(m => m.id === e.message_id);
            if (targetMsg && targetMsg.user_id === userRef.current?.id) {
              showReactionToast({
                reactorName: e.reactor_name || 'Quelqu\'un',
                emoji: e.emoji,
              });
              playReactionSound();
            }
          }
        };
        
        channel.listen('.message.sent', handleMessageSent);
        channel.listen('.message.deleted', handleMessageDeleted);
        channel.listen('.MessageReactionUpdated', handleMessageReactionUpdated);

        const cleanup = () => {
          console.log('🧹 Unsubscribing from chat channel:', chatChannelName);
          channel.stopListening('.message.sent');
          channel.stopListening('.message.deleted');
          channel.stopListening('.MessageReactionUpdated');
        };
        
        subscriptionsRef.current.set(chatChannelName, { channel, cleanup });
      }

      // 2. Subscribe to conversation channel (typing/read)
      if (!subscriptionsRef.current.has(convChannelName)) {
        console.log('📡 Subscribing to conversation channel:', convChannelName);
        const channel = echo.private(convChannelName);
        
        const handleTyping = (e) => {
          // Ignore typing events from the current user
          if (e.userId === userRef.current?.id) return;
          
          console.log('⌨️ User typing (from list):', e);
          useChatStore.getState().setTyping(conv.id, e.userId, e.userName, e.isTyping);
        };

        const handleRead = (e) => {
          console.log('✅ Conversation read (from list):', e);
          useChatStore.getState().setParticipantLastRead(conv.id, e.userId, new Date().toISOString());
        };
        
        channel.listen('.user.typing', handleTyping);
        channel.listen('.conversation.read', handleRead);

        const cleanup = () => {
          console.log('🧹 Unsubscribing from conversation channel:', convChannelName);
          channel.stopListening('.user.typing');
          channel.stopListening('.conversation.read');
        };
        
        subscriptionsRef.current.set(convChannelName, { channel, cleanup });
      }
    });
  }, [user, isAuthenticated, conversations, addMessage]);

  // Remove the old redundant activeConversation typing effect as it's now handled for all conversations above
  useEffect(() => {
    // This effect is now empty or can be removed entirely
  }, [activeConversation]);

  return {};
};
