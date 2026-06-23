import React, { useState, useEffect, useCallback } from 'react';
import { Info, Archive, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import communicationService from '../../../services/communicationService';
import useAuth from '../../../hooks/useAuth';

const ChatContainer = ({ conversation, onToggleDetails, showDetails, onMessageSent }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await communicationService.getMessages(conversation.id);
        const data = Array.isArray(response) ? response : response?.data || [];
        setMessages([...data].reverse());
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversation.id]);

  const handleSendMessage = useCallback(async (content, files) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      content,
      user_id: user?.id,
      user: user,
      created_at: new Date().toISOString(),
      sending: true,
      attachments: files ? Array.from(files).map(f => ({ name: f.name, size: f.size, loading: true })) : []
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      let response;
      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));
        if (content) formData.append('content', content);
        response = await communicationService.sendMessage(conversation.id, formData);
      } else {
        response = await communicationService.sendMessage(conversation.id, { content });
      }
      const realMessage = response?.data || response;
      setMessages(prev => prev.map(msg => msg.id === tempId ? realMessage : msg));
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === tempId ? { ...msg, sending: false, error: true } : msg
      ));
    }
  }, [user, conversation.id, onMessageSent]);

  const handleArchive = async () => {
    try {
      await communicationService.archiveConversation(conversation.id);
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const name = conversation.type === 'group' ? conversation.name : conversation.other_user?.name;
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
  const isOnline = conversation.other_user?.online;
  const isBlocked = conversation.type === 'private' && (conversation.is_blocked_by_me || conversation.has_blocked_me);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Chat Header ── */}
      <div className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-gray-100 bg-white">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 text-[#1428C9] rounded-full flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 leading-none">{name}</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {conversation.type === 'group'
                ? `${conversation.participants?.length || 0} membres`
                : isOnline ? '● En ligne' : 'Hors ligne'
              }
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Archive — inline, no dropdown needed */}
          <button
            onClick={handleArchive}
            title="Archiver la conversation"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Archive size={17} />
          </button>

          {/* Toggle Details Panel */}
          <button
            onClick={onToggleDetails}
            title={showDetails ? 'Masquer les détails' : 'Voir les détails'}
            className={`p-2 rounded-lg transition-all ${
              showDetails
                ? 'bg-[#1428C9] text-white'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Info size={17} />
          </button>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-hidden bg-[#F9FAFB]">
        <MessageList messages={messages} loading={loading} />
      </div>

      {/* ── Typing Indicator ── */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="px-5 py-1.5 bg-white border-t border-gray-50"
          >
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {typingUsers.length === 1 ? `${typingUsers[0]} est en train d'écrire` : 'Plusieurs personnes écrivent'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input / Blocked States ── */}
      {conversation.type === 'private' && conversation.is_blocked_by_me ? (
        <div className="px-5 py-4 bg-white border-t border-gray-100 text-center">
          <p className="text-xs text-orange-500 flex items-center justify-center gap-2">
            <Ban size={14} />
            Vous avez bloqué ce contact — <button onClick={() => {}} className="underline">Débloquer</button>
          </p>
        </div>
      ) : conversation.type === 'private' && conversation.has_blocked_me ? (
        <div className="px-5 py-4 bg-white border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Ban size={14} />
            Vous ne pouvez pas envoyer de message à cet utilisateur
          </p>
        </div>
      ) : (
        <ChatInput onSend={handleSendMessage} conversationId={conversation.id} />
      )}
    </div>
  );
};

export default ChatContainer;
