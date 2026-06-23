import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { Info, Ban, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import MessageBubble from './MessageBubble';
import ChatComposer from './ChatComposer';
import useChatStore from '../../../store/useChatStore';
import useAuth from '../../../hooks/useAuth';
import useInView from '../../../hooks/useInView';
import communicationService from '../../../services/communicationService';

// ── Date divider ──────────────────────────────────────────────────────────────
const DateDivider = ({ date }) => (
  <div className="flex items-center gap-3 my-5 px-4">
    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.5)' }} />
    <span
      className="text-[11px] font-semibold text-gray-500 select-none whitespace-nowrap px-3 py-1 rounded-full"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.7)',
      }}
    >
      {date}
    </span>
    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.5)' }} />
  </div>
);

const EmptyState = ({ name }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="flex-1 flex flex-col items-center justify-center p-8 text-center"
  >
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(20,40,201,0.08)',
      }}
    >
      <svg className="w-7 h-7 text-[#1428C9]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-gray-700 mb-1">Démarrez la conversation</h3>
    <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
      Envoyez votre premier message à {name || 'votre interlocuteur'}.
    </p>
  </motion.div>
);

// ── No conversation ───────────────────────────────────────────────────────────
const NoConversation = () => (
  <div
    className="flex-1 flex flex-col items-center justify-center text-center p-8"
    style={{ background: 'transparent' }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 mx-auto"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.75)',
          boxShadow: '0 8px 32px rgba(20,40,201,0.10)',
        }}
      >
        <MessageSquare size={32} className="text-[#1428C9]/30" />
      </div>
      <h2 className="text-base font-semibold text-gray-700 mb-1">Sélectionnez une discussion</h2>
      <p className="text-sm text-gray-400">Commencez à collaborer avec votre équipe</p>
    </motion.div>
  </div>
);

// ── Helper ────────────────────────────────────────────────────────────────────
const groupMessagesByDate = (msgs) => {
  const groups = [];
  if (!Array.isArray(msgs)) return groups;
  msgs.forEach((msg) => {
    const date = new Date(msg.created_at);
    let label = '';
    if (isToday(date)) label = "Aujourd'hui";
    else if (isYesterday(date)) label = 'Hier';
    else label = format(date, 'EEEE d MMMM', { locale: fr });
    const last = groups[groups.length - 1];
    if (!last || last.date !== label) groups.push({ date: label, messages: [msg] });
    else last.messages.push(msg);
  });
  return groups;
};

// ── Main component ────────────────────────────────────────────────────────────
const ChatArea = ({ onShowDetails }) => {
  const { user } = useAuth();
  const { activeConversation, messages, typingUsers, loadingMoreMessages, fetchMoreMessages } = useChatStore();
  const scrollRef = useRef(null);
  const [loadMoreRef, isLoadMoreInView] = useInView({ threshold: 0.5 });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isLoadMoreInView && activeConversation) fetchMoreMessages();
  }, [isLoadMoreInView, activeConversation, fetchMoreMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleImageClick = useCallback((url) => setSelectedImage(url), []);

  const handleSendMessage = async (content) => {
    try {
      await useChatStore.getState().sendMessage(activeConversation.id, content, user);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleTyping = useCallback((isTyping) => {
    if (activeConversation) communicationService.sendTypingIndicator(activeConversation.id, isTyping);
  }, [activeConversation]);

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

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
  const typingUserNames = currentTyping.map(u => u.name);
  const isBlockedByMe = activeConversation.type === 'private' && activeConversation.is_blocked_by_me;
  const hasBlockedMe = activeConversation.type === 'private' && activeConversation.has_blocked_me;
  const isUserActive = activeConversation.user_status === 'active';

  return (
    <div className="flex flex-col h-full" style={{ background: 'transparent' }}>

      {/* ── Chat Header ── */}
      <div
        className="h-16 flex-shrink-0 flex items-center justify-between px-5"
        style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 2px 16px rgba(20,40,201,0.06)',
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(20,40,201,0.3)',
              }}
            >
              {initials}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate leading-none mb-1">
              {name}
            </h3>
            <div className="text-[11px] font-medium leading-none">
              {isTyping ? (
                <span className="text-green-500 italic flex items-center gap-1">
                  {activeConversation.type === 'group'
                    ? (typingUserNames.length === 1 ? `${typingUserNames[0]} écrit...` : 'Plusieurs personnes écrivent...')
                    : 'En train d\'écrire...'}
                  <span className="flex gap-0.5">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.span key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: d }}
                        className="w-1 h-1 bg-green-500 rounded-full"
                      />
                    ))}
                  </span>
                </span>
              ) : activeConversation.type === 'group' ? (
                <span className="text-gray-400">{activeConversation.participants?.filter(p => p.pivot?.status !== 'left' && p.pivot?.status !== 'removed').length || 0} membres</span>
              ) : isOnline ? (
                <span className="flex items-center gap-1 text-green-500">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shrink-0" />
                  En ligne
                </span>
              ) : (
                <span className="text-gray-400">Hors ligne</span>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowDetails}
          title="Voir les détails"
          className="p-2 rounded-xl transition-all text-gray-400 hover:text-[#1428C9]"
          style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}
        >
          <Info size={17} />
        </motion.button>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/40"
        style={{ background: 'transparent' }}
      >
        {/* Load more trigger */}
        <div ref={loadMoreRef} className="flex justify-center py-3">
          {loadingMoreMessages && (
            <div className="flex items-center gap-2 text-gray-400 text-xs px-4 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}
            >
              <div className="w-4 h-4 border-2 border-[#1428C9]/20 border-t-[#1428C9] rounded-full animate-spin" />
              <span>Chargement...</span>
            </div>
          )}
        </div>

        {groupedMessages.length === 0 ? (
          <EmptyState name={name} />
        ) : (
          <div className="px-3 pb-3">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <DateDivider date={group.date} />
                <div className="flex flex-col space-y-0.5">
                  {group.messages.map((msg, index) => {
                    const prev = group.messages[index - 1];
                    const next = group.messages[index + 1];
                    const isSeen = activeConversation.type === 'private' &&
                      otherLastRead && msg.created_at &&
                      new Date(msg.created_at) <= new Date(otherLastRead);
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
                        onImageClick={handleImageClick}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="px-6 pb-3"
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-2xl w-fit"
                style={{
                  background: 'rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.7)',
                  boxShadow: '0 2px 12px rgba(20,40,201,0.07)',
                }}
              >
                <span className="flex gap-0.5">
                  {[0, 150, 300].map((d, i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </span>
                <span className="text-xs text-gray-400">
                  {typingUserNames.length === 1
                    ? `${typingUserNames[0]} écrit...`
                    : 'Plusieurs personnes écrivent...'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Input / Blocked ── */}
      {!isUserActive ? (
        <div className="px-5 py-4 text-center"
          style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.6)' }}
        >
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            {activeConversation.user_status === 'group_deleted'
              ? 'Ce groupe a été supprimé.'
              : 'Vous avez quitté ce groupe.'}
          </p>
        </div>
      ) : isBlockedByMe ? (
        <div className="px-5 py-4 text-center"
          style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.6)' }}
        >
          <p className="text-xs text-orange-500 flex items-center justify-center gap-2">
            <Ban size={13} /> Vous avez bloqué ce contact
          </p>
        </div>
      ) : hasBlockedMe ? (
        <div className="px-5 py-4 text-center"
          style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.6)' }}
        >
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Ban size={13} /> Vous ne pouvez pas envoyer de message
          </p>
        </div>
      ) : (
        <ChatComposer key={activeConversation.id} autoFocus={true} onSend={handleSendMessage} onTyping={handleTyping} />
      )}

      {/* ── Image Lightbox ── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatArea;
