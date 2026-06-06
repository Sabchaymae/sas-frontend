import { useEffect, useRef } from 'react';
import { getEcho, resetEcho } from '../lib/echoManager';
import useChatStore from '../store/useChatStore';
import useNotificationStore from '../store/useNotificationStore';
import useInvitationStore from '../store/useInvitationStore';
import useAuth from './useAuth';

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

export { initAudioContext };
export const useWebSockets = () => {
  // ALWAYS CALL ALL HOOKS FIRST, NO CONDITIONALS!
  const { user, isAuthenticated } = useAuth();
  const addMessage = useChatStore(state => state.addMessage);
  const addNotification = useNotificationStore(state => state.addNotification);
  const addInvitation = useInvitationStore(state => state.addInvitation);
  const conversations = useChatStore(state => state.conversations);
  const activeConversation = useChatStore(state => state.activeConversation);
  
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
        const type = data.type || notification.type;
        
        console.log('📨 Notification processed type:', type, 'data:', data);

        if (type === 'new_message' && data.full_message) {
          // If message belongs to a conversation we don't have yet, fetch list
          const state = useChatStore.getState();
          const convExists = state.conversations.some(c => c.id === data.full_message.conversation_id);
          if (!convExists) {
            state.fetchConversations();
          }

          if (activeConversation?.id !== data.full_message.conversation_id) {
            playNotificationSound();
          }
        } else if (type === 'group_invitation' || type === 'App\\Notifications\\GroupInvitationNotification' || type.includes('GroupInvitation')) {
          console.log('🎁 Group Invitation DETECTED!', data);
          playNotificationSound();
          addInvitation(data);
        }
      };

      channel.notification(handleNotification);

      // Cleanup function for this subscription
      const cleanup = () => {
        console.log('🧹 Unsubscribing from notifications channel');
        channel.stopListening('.notification');
      };

      subscriptionsRef.current.set(notificationChannelName, { channel, cleanup });
    }

    // 2. Presence channel
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
            state.setMessages(
              state.messages.filter(m => m.id !== e.message.id)
            );
          }
        };
        
        channel.listen('.message.sent', handleMessageSent);
        channel.listen('.message.deleted', handleMessageDeleted);

        const cleanup = () => {
          console.log('🧹 Unsubscribing from chat channel:', chatChannelName);
          channel.stopListening('.message.sent');
          channel.stopListening('.message.deleted');
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
