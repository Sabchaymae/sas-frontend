import React, { useEffect, useRef, useMemo } from 'react';
import { Info, Archive, Ban, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import MessageBubble from './MessageBubble';
import ChatComposer from './ChatComposer';
import useChatStore from '../../../store/useChatStore';
import { useWebSockets } from '../../../hooks/useWebSockets';
import useAuth from '../../../hooks/useAuth';

// ── Date divider ──────────────────────────────────────────────
const DateDivider = ({ date }) => (
  <div className="flex items-center gap-3 my-5 px-4">
    <div className="flex-1 h-px bg-gray-100" />
    <span className="text-[11px] font-medium text-gray-400 select-none whitespace-nowrap">{date}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

// ── Empty state ───────────────────────────────────────────────
const EmptyState = ({ name }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
      <svg className="w-7 h-7 text-[#1428C9]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-gray-700 mb-1">Démarrez la conversation</h3>
    <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
      Envoyez votre premier message à {name || 'votre interlocuteur'}.
    </p>
  </div>
);

// ── No conversation selected ──────────────────────────────────
const NoConversation = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
        <MessageSquare size={28} className="text-gray-200" />
      </div>
      <h2 className="text-base font-semibold text-gray-700 mb-1">Sélectionnez une discussion</h2>
      <p className="text-sm text-gray-400">Commencez à collaborer avec votre équipe</p>
    </motion.div>
  </div>
);

// ── Helper ────────────────────────────────────────────────────
const groupMessagesByDate = (msgs) => {
  const groups = [];
  if (!Array.isArray(msgs)) return groups;
  msgs.forEach((message) => {
    const date = new Date(message.created_at);
    let label = '';
    if (isToday(date)) label = "Aujourd'hui";
    else if (isYesterday(date)) label = 'Hier';
    else label = format(date, 'EEEE d MMMM', { locale: fr });

    const last = groups[groups.length - 1];
    if (!last || last.date !== label) groups.push({ date: label, messages: [message] });
    else last.messages.push(message);
  });
  return groups;
};

// ── Main component ────────────────────────────────────────────
const ChatArea = ({ onShowDetails }) => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    typingUsers,
    archiveConversation,
  } = useChatStore();
  const { subscribeToChat } = useWebSockets();
  const scrollRef = useRef(null);

  // Subscribe to realtime channel for active conversation
  useEffect(() => {
    if (activeConversation) {
      const unsubscribe = subscribeToChat(activeConversation.id);
      return () => unsubscribe();
    }
  }, [activeConversation, subscribeToChat]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content) => {
    try {
      await useChatStore.getState().sendMessage(activeConversation.id, content, user);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  // ── Empty / no conversation ──
  if (!activeConversation) return <NoConversation />;

  const name = activeConversation.type === 'group'
    ? activeConversation.name
    : activeConversation.other_user?.name;

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';
  const isOnline = activeConversation.other_user?.online;
  const otherParticipant = activeConversation.type === 'private'
    ? activeConversation.participants?.find(p => p.id !== user?.id)
    : null;
  const otherLastRead = otherParticipant?.pivot?.last_read_at;
  const currentTyping = typingUsers[activeConversation.id] || [];
  const isTyping = currentTyping.length > 0;
  const isBlockedByMe = activeConversation.type === 'private' && activeConversation.is_blocked_by_me;
  const hasBlockedMe = activeConversation.type === 'private' && activeConversation.has_blocked_me;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Chat Header ── */}
      <div className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-gray-100 bg-white">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[#1428C9] flex items-center justify-center text-sm font-semibold shrink-0">
              {initials}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate leading-none mb-1.5">
              {name}
            </h3>
            <div className="text-[10px] font-medium leading-none">
              {activeConversation.type === 'group' ? (
                <span className="text-gray-400">{activeConversation.participants?.length || 0} membres</span>
              ) : isOnline ? (
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0" />
                  En ligne
                </span>
              ) : (
                <span className="text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0" />
                  Hors ligne
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right — inline actions, no dropdown */}
        <div className="flex items-center gap-1">
          <button
            onClick={onShowDetails}
            title="Voir les détails"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Info size={17} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[#F9FAFB] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200"
      >
        {groupedMessages.length === 0 ? (
          <EmptyState name={name} />
        ) : (
          <div className="px-2 pt-4 pb-2">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateDivider date={group.date} />
                <div className="flex flex-col space-y-0.5">
                  {group.messages.map((msg, index) => {
                    const prev = group.messages[index - 1];
                    const next = group.messages[index + 1];
                    const isSeen = activeConversation.type === 'private' && otherLastRead && msg.created_at && (new Date(msg.created_at) <= new Date(otherLastRead));
                    const isDelivered = isSeen || (activeConversation.type === 'private' && isOnline);
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.user_id === user?.id}
                        isContinued={!!prev && prev.user_id === msg.user_id}
                        isLast={!next || next.user_id !== msg.user_id}
                        isSeen={isSeen}
                        isDelivered={isDelivered}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="px-6 pb-3"
            >
              <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full w-fit shadow-sm">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span className="text-xs text-gray-400">
                  {currentTyping.length === 1 ? `${currentTyping[0]} écrit...` : 'Plusieurs personnes écrivent...'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Input / Blocked ── */}
      {isBlockedByMe ? (
        <div className="px-5 py-4 bg-white border-t border-gray-100 text-center">
          <p className="text-xs text-orange-500 flex items-center justify-center gap-2">
            <Ban size={14} /> Vous avez bloqué ce contact
          </p>
        </div>
      ) : hasBlockedMe ? (
        <div className="px-5 py-4 bg-white border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Ban size={14} /> Vous ne pouvez pas envoyer de message à cet utilisateur
          </p>
        </div>
      ) : (
        <ChatComposer onSend={handleSendMessage} onTyping={() => {}} />
      )}
    </div>
  );
};

export default ChatArea;
