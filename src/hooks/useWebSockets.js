import { useEffect, useRef } from 'react';
import { getEcho } from '../lib/echoManager';
import useChatStore from '../store/useChatStore';
import useNotificationStore from '../store/useNotificationStore';
import useInvitationStore from '../store/useInvitationStore';
import useAuth from './useAuth';

export const useWebSockets = () => {
  const { user, isAuthenticated } = useAuth();
  const addMessage = useChatStore(state => state.addMessage);
  const addNotification = useNotificationStore(state => state.addNotification);
  const addInvitation = useInvitationStore(state => state.addInvitation);
  const conversations = useChatStore(state => state.conversations);
  
  const userRef = useRef(user);
  const echoRef = useRef(null);
  const subscribedChannelsRef = useRef(new Set());

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('❌ No authenticated user, skipping WebSockets');
      return;
    }

    console.log('🚀 Starting WebSocket connection for user:', user.id);
    const echo = getEcho();
    echoRef.current = echo;

    // 1. Subscribe to notifications channel
    const notificationChannelName = `notifications.${user.id}`;
    if (!subscribedChannelsRef.current.has(notificationChannelName)) {
      console.log('📡 Subscribing to notifications channel:', notificationChannelName);
      const channel = echo.private(notificationChannelName);
      
      channel.notification((notification) => {
        console.log('📨 Notification RECEIVED:', notification);
        addNotification(notification);
        
        if (notification.type === 'new_message' && notification.full_message) {
          addMessage(notification.full_message);
        }
        
        if (notification.type === 'group_invitation') {
          addInvitation(notification);
        }
      });
      
      subscribedChannelsRef.current.add(notificationChannelName);
    }

    // 2. Subscribe to presence channel
    const presenceChannelName = 'presence.chat';
    if (!subscribedChannelsRef.current.has(presenceChannelName)) {
      console.log('📡 Subscribing to presence channel:', presenceChannelName);
      const channel = echo.join(presenceChannelName);
      
      channel.here((users) => {
        console.log('👥 Online users (here):', users);
        useChatStore.getState().setOnlineUsers(users);
      });
      
      channel.joining((joiningUser) => {
        console.log('✅ User joined:', joiningUser);
        useChatStore.getState().setUserPresence(joiningUser, true);
      });
      
      channel.leaving((leavingUser) => {
        console.log('❌ User left:', leavingUser);
        useChatStore.getState().setUserPresence(leavingUser, false);
      });
      
      subscribedChannelsRef.current.add(presenceChannelName);
    }

    return () => {
      // Don't cleanup to keep connections alive
    };
  }, [user, isAuthenticated, addNotification, addMessage, addInvitation]);

  // 3. Subscribe to chat channels for each conversation
  useEffect(() => {
    if (!user || !conversations || !echoRef.current) {
      console.log('❌ Missing user/conversations/echo, skipping chat channels');
      return;
    }

    console.log('🔄 Checking chat channels for', conversations.length, 'conversations');
    
    conversations.forEach(conv => {
      const chatChannelName = `chat.${conv.id}`;
      if (!subscribedChannelsRef.current.has(chatChannelName)) {
        console.log('📡 Subscribing to chat channel:', chatChannelName);
        const channel = echoRef.current.private(chatChannelName);
        
        // Listen to ALL possible event variations
        channel.listen('.message.sent', (e) => {
          console.log('💬 MESSAGE RECEIVED (.message.sent):', e);
          if (e.message && e.message.user_id !== userRef.current?.id) {
            addMessage(e.message);
          }
        });
        
        channel.listen('message.sent', (e) => {
          console.log('💬 MESSAGE RECEIVED (message.sent):', e);
          if (e.message && e.message.user_id !== userRef.current?.id) {
            addMessage(e.message);
          }
        });
        
        channel.listen('App\\Events\\MessageSent', (e) => {
          console.log('💬 MESSAGE RECEIVED (App\\Events\\MessageSent):', e);
          if (e.message && e.message.user_id !== userRef.current?.id) {
            addMessage(e.message);
          }
        });
        
        // Listen to EVERYTHING on the channel
        channel.listenToAll((event, data) => {
          console.log('🔍 ALL EVENTS on', chatChannelName, ':', event, data);
        });
        
        subscribedChannelsRef.current.add(chatChannelName);
      }
    });
  }, [user, conversations, addMessage]);

  return {
    subscribeToChat: (conversationId) => {
      if (!conversationId || !echoRef.current) {
        return () => {};
      }
      
      const convChannelName = `conversation.${conversationId}`;
      if (!subscribedChannelsRef.current.has(convChannelName)) {
        console.log('📡 Subscribing to conversation channel:', convChannelName);
        const channel = echoRef.current.private(convChannelName);
        
        channel.listen('.user.typing', (e) => {
          console.log('⌨️ User typing:', e);
          useChatStore.getState().setTyping(conversationId, e.userId, e.isTyping);
        });
        
        channel.listen('user.typing', (e) => {
          console.log('⌨️ User typing (no dot):', e);
          useChatStore.getState().setTyping(conversationId, e.userId, e.isTyping);
        });
        
        channel.listen('.conversation.read', (e) => {
          console.log('✅ Conversation read:', e);
          useChatStore.getState().setParticipantLastRead(conversationId, e.userId, new Date().toISOString());
        });
        
        channel.listen('conversation.read', (e) => {
          console.log('✅ Conversation read (no dot):', e);
          useChatStore.getState().setParticipantLastRead(conversationId, e.userId, new Date().toISOString());
        });
        
        subscribedChannelsRef.current.add(convChannelName);
      }
      
      return () => {};
    }
  };
};
