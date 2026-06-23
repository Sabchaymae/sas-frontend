import { useEffect } from 'react';
import useChatStore from '../store/useChatStore';
import useAuth from './useAuth';
import echo, { updateEchoAuthToken } from '../services/echo';

export const useCommunicationWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    addMessage, 
    setTyping, 
    setOnlineUsers, 
    setUserPresence, 
    conversations,
  } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated || !user || !user.id) return;

    // Update Echo auth token when component runs
    updateEchoAuthToken();
    console.log('📡 [WebSocket] Initializing communication WebSockets...');

    const userId = String(user.id);

    // 1. Join presence channel
    let presenceChannel;
    try {
      console.log('📡 [Presence] Joining presence.chat...');
      presenceChannel = echo.join(`presence.chat`);

      presenceChannel
        .here((users) => {
          console.log('📡 [Presence] Current online users:', users);
          setOnlineUsers(users);
        })
        .joining((user) => {
          console.log('📡 [Presence] User joined:', user);
          setUserPresence(user, true);
        })
        .leaving((user) => {
          console.log('📡 [Presence] User left:', user);
          setUserPresence(user, false);
        });
    } catch (error) {
      console.error('⚠️ [WebSocket] Error joining presence channel:', error);
    }

    // Store channels to clean up later
    const chatChannels = [];

    // 2. Listen to conversation channels
    const subscribeToConversations = () => {
      conversations.forEach((conversation) => {
        try {
          const chatChannel = echo.private(`chat.${conversation.id}`);
          const convChannel = echo.private(`conversation.${conversation.id}`);
          chatChannels.push(chatChannel);
          chatChannels.push(convChannel);

          chatChannel.listen('.message.sent', (event) => {
            console.log('📡 [Message] New message received:', event);
            addMessage(event.message);
          });

          convChannel.listen('.user.typing', (event) => {
            console.log('📡 [Typing] User typing event:', event);
            setTyping(conversation.id, event.userId, event.userName, event.isTyping);
          });
        } catch (error) {
          console.error(`⚠️ [WebSocket] Error joining channel for conversation ${conversation.id}:`, error);
        }
      });
    };

    subscribeToConversations();

    return () => {
      console.log('📡 [WebSocket] Cleaning up WebSocket connections...');
      
      // Leave channels
      if (presenceChannel && echo.leave) {
        echo.leave(`presence.chat`);
      }
      chatChannels.forEach((channel) => {
        if (channel && channel.stopListening) {
          channel.stopListening('.message.sent');
          channel.stopListening('.user.typing');
        }
      });
    };
  }, [user, isAuthenticated, conversations, addMessage, setTyping, setOnlineUsers, setUserPresence]);
};

export default useCommunicationWebSocket;
