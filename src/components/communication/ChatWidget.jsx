import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Minus, Send, Search, ArrowLeft, Smile, Paperclip, Users, Check, CheckCheck, Plus } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import useChatStore from '../../store/useChatStore';
import useAuth from '../../hooks/useAuth';
import communicationService from '../../services/communicationService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'HH:mm', { locale: fr });
    if (isYesterday(date)) return 'Hier';
    return format(date, 'd MMM', { locale: fr });
  } catch { return ''; }
};

// ─── Glass style helpers ──────────────────────────────────────────────────────
const glassPanel = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 24px 64px rgba(20,40,201,0.18), 0 4px 24px rgba(0,0,0,0.08)',
};

// ─── Mini bubble ─────────────────────────────────────────────────────────────
const MiniBubble = ({ msg, isOwn }) => {
  const time = msg.sending ? '...' : (msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : '');

  if (msg.is_deleted) {
    return (
      <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start', 'mb-1')}>
        <span className="text-[11px] italic text-gray-400 px-2 py-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        >
          Message supprimé
        </span>
      </div>
    );
  }

  if (msg.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[10px] text-gray-400 px-3 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        >
          {msg.content}
        </span>
      </div>
    );
  }

  const attachments = msg.attachments || [];
  const hasImage = attachments.some(a => a.file_type?.startsWith('image/'));
  const hasFile = attachments.some(a => !a.file_type?.startsWith('image/'));

  return (
    <div className={clsx('flex mb-1', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className="max-w-[75%] px-2.5 py-1.5 rounded-2xl relative"
        style={isOwn ? {
          background: 'linear-gradient(135deg, rgba(20,40,201,0.88) 0%, rgba(79,110,247,0.88) 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(79,110,247,0.3)',
          color: 'white',
        } : {
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.85)',
          color: '#111827',
        }}
      >
        {/* Attachment preview */}
        {hasImage && (
          <p className={clsx('text-[12px]', isOwn ? 'text-white/80' : 'text-gray-500')}>📷 Photo</p>
        )}
        {hasFile && !hasImage && (
          <p className={clsx('text-[12px]', isOwn ? 'text-white/80' : 'text-gray-500')}>📎 Fichier</p>
        )}

        {/* Content */}
        {msg.content && (
          <p className="text-[13px] leading-[1.4] whitespace-pre-wrap pr-10 break-words">
            {msg.content}
          </p>
        )}

        {/* Time + status */}
        <div className="flex items-center justify-end gap-0.5 mt-0.5">
          <span className={clsx('text-[10px]', isOwn ? 'text-white/60' : 'text-gray-400')}>{time}</span>
          {isOwn && !msg.sending && (
            <CheckCheck size={11} className={isOwn ? 'text-white/50' : 'text-gray-400'} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Chat panel ──────────────────────────────────────────────────────────────
const ChatPanel = ({ onClose, onMinimize }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    typingUsers,
    loading,
    fetchConversations,
    setActiveConversation,
    markConversationAsRead,
  } = useChatStore();

  const [view, setView] = useState('list'); // 'list' | 'chat'
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, view]);

  // Focus input when switching to chat view
  useEffect(() => {
    if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 100);
  }, [view]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    markConversationAsRead(conv.id);
    setView('chat');
    setInputValue('');
  };

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || !activeConversation || sending) return;
    setInputValue('');
    setSending(true);
    try {
      await useChatStore.getState().sendMessage(activeConversation.id, content, user);
    } catch (err) {
      console.error('Widget send error', err);
    } finally {
      setSending(false);
    }
  }, [inputValue, activeConversation, sending, user]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    const q = searchTerm.toLowerCase();
    return conversations.filter(c => {
      const name = c.type === 'group' ? c.name : c.other_user?.name || '';
      return name.toLowerCase().includes(q);
    });
  }, [conversations, searchTerm]);

  const convName = activeConversation?.type === 'group'
    ? activeConversation.name
    : activeConversation?.other_user?.name;
  const isOnline = activeConversation?.other_user?.online;
  const currentTyping = activeConversation ? (typingUsers[activeConversation.id] || []) : [];
  const isTyping = currentTyping.length > 0;
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{ ...glassPanel, width: 360, height: 520 }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
          boxShadow: '0 2px 12px rgba(20,40,201,0.3)',
        }}
      >
        {view === 'chat' ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <button
              onClick={() => setView('list')}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#1428C9] shrink-0"
              style={{ background: 'rgba(255,255,255,0.9)' }}
            >
              {getInitials(convName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-none">{convName}</p>
              <p className="text-[10px] mt-0.5" style={{ color: isOnline ? '#86efac' : 'rgba(255,255,255,0.5)' }}>
                {isTyping ? 'En train d\'écrire...' : (isOnline ? 'En ligne' : 'Hors ligne')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Messages</span>
            {totalUnread > 0 && (
              <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Search */}
            <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none rounded-xl transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.7)',
                  }}
                />
              </div>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/30">
              {loading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                      <div className="w-9 h-9 rounded-full shrink-0"
                        style={{ background: 'rgba(255,255,255,0.4)' }} />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 rounded-full w-1/2"
                          style={{ background: 'rgba(255,255,255,0.4)' }} />
                        <div className="h-2 rounded-full w-3/4"
                          style={{ background: 'rgba(255,255,255,0.3)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conv => {
                  const name = conv.type === 'group' ? conv.name : conv.other_user?.name;
                  const hasUnread = conv.unread_count > 0;
                  const lastMsg = conv.last_message?.content || 'Démarrer la discussion';
                  const currentTypingConv = typingUsers[conv.id] || [];

                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:bg-white/30 rounded-xl mx-1 my-0.5"
                      style={{ width: 'calc(100% - 8px)' }}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: hasUnread
                              ? 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)'
                              : 'rgba(255,255,255,0.6)',
                            color: hasUnread ? 'white' : '#374151',
                            border: '1px solid rgba(255,255,255,0.8)',
                            boxShadow: hasUnread ? '0 2px 8px rgba(20,40,201,0.25)' : 'none',
                          }}
                        >
                          {conv.type === 'group' ? <Users size={14} /> : getInitials(name)}
                        </div>
                        {conv.other_user?.online && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={clsx('text-xs truncate', hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700')}>
                            {name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                            {formatTime(conv.last_message?.created_at || conv.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className={clsx('text-[11px] truncate', hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400')}>
                            {currentTypingConv.length > 0 ? 'En train d\'écrire...' : lastMsg}
                          </p>
                          {hasUnread && (
                            <span className="min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)' }}
                            >
                              {conv.unread_count > 9 ? '9+' : conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}
                  >
                    <MessageSquare size={20} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400">Aucune conversation</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/30"
              style={{ background: 'transparent' }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ background: 'rgba(255,255,255,0.5)' }}
                  >
                    <MessageSquare size={18} className="text-[#1428C9]/30" />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Aucun message</p>
                </div>
              ) : (
                messages.map(msg => (
                  <MiniBubble key={msg.id} msg={msg} isOwn={msg.user_id === user?.id} />
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.8)' }}
                  >
                    {[0, 150, 300].map((d, i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              className="flex items-end gap-2 px-3 py-2.5 shrink-0"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.45)',
              }}
            >
              <div
                className="flex-1 rounded-xl px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 2px 8px rgba(20,40,201,0.05)',
                }}
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Écrire un message..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full resize-none bg-transparent border-none text-[13px] text-gray-800 placeholder-gray-400 focus:ring-0 p-0 min-h-[20px] max-h-[80px] overflow-y-auto leading-tight"
                  style={{ outline: 'none' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || sending}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0"
                style={inputValue.trim() ? {
                  background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                  boxShadow: '0 4px 12px rgba(20,40,201,0.35)',
                } : {
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.7)',
                }}
              >
                <Send size={15} className={inputValue.trim() ? 'text-white ml-0.5' : 'text-gray-300'} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main widget ──────────────────────────────────────────────────────────────
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { conversations } = useChatStore();

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <ChatPanel onClose={handleClose} onMinimize={handleMinimize} />
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={isMinimized ? handleOpen : (isOpen ? handleClose : handleOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
        style={{
          background: isOpen && !isMinimized
            ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
            : 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
          boxShadow: isOpen && !isMinimized
            ? '0 8px 24px rgba(0,0,0,0.25)'
            : '0 8px 24px rgba(20,40,201,0.4)',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        aria-label="Ouvrir la messagerie"
      >
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? (
            <motion.span key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} className="text-white" />
            </motion.span>
          ) : (
            <motion.span key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={22} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {totalUnread > 0 && !(isOpen && !isMinimized) && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
            }}
          >
            {totalUnread > 9 ? '9+' : totalUnread}
          </motion.span>
        )}

        {/* Minimized indicator */}
        {isMinimized && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ background: '#f59e0b' }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
