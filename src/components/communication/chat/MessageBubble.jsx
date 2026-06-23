
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Download, Check, CheckCheck, Pencil, Trash2, SmilePlus, X, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import useChatStore from '../../../store/useChatStore';
import useAuth from '../../../hooks/useAuth';
import communicationService from '../../../services/communicationService';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
const EmojiPicker = ({ onSelect, onClose, isOwn }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={clsx('absolute bottom-full mb-2 z-50 flex gap-0.5 p-1.5 rounded-2xl', isOwn ? 'right-0' : 'left-0')}
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 8px 32px rgba(20,40,201,0.15)',
      }}
    >
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          onMouseDown={(e) => { e.preventDefault(); onSelect(emoji); }}
          className="w-8 h-8 text-lg hover:bg-white/60 rounded-xl transition-all hover:scale-125 flex items-center justify-center"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

// ─── Reactions Bar ────────────────────────────────────────────────────────────
const ReactionsBar = ({ reactions, currentUserId, onToggle }) => {
  if (!reactions?.length) return null;
  const grouped = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-1 mt-1 px-1">
      {Object.entries(grouped).map(([emoji, list]) => {
        const isMine = list.some(r => r.user_id === currentUserId);
        const names = list.map(r => `${r.user?.prenom ?? ''} ${r.user?.nom ?? ''}`.trim()).join(', ');
        return (
          <button
            key={emoji}
            title={names}
            onMouseDown={(e) => { e.preventDefault(); onToggle(emoji); }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all hover:scale-105"
            style={isMine ? {
              background: 'rgba(20,40,201,0.12)',
              border: '1px solid rgba(20,40,201,0.25)',
              color: '#1428C9',
              fontWeight: 600,
            } : {
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.8)',
              color: '#374151',
            }}
          >
            <span>{emoji}</span>
            <span className="text-[10px] font-bold">{list.length}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Inline Edit Form ─────────────────────────────────────────────────────────
const EditForm = ({ defaultValue, onSave, onCancel }) => {
  const [text, setText] = useState(defaultValue);
  const taRef = useRef(null);

  useEffect(() => {
    taRef.current?.focus();
    const len = taRef.current?.value.length;
    taRef.current?.setSelectionRange(len, len);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSave(text.trim()); }
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="flex flex-col gap-1.5 p-1.5 min-w-[180px]">
      <textarea
        ref={taRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={Math.max(2, text.split('\n').length)}
        className="w-full text-[14px] bg-white/40 border border-[#1428C9]/30 rounded-xl px-2 py-1.5 outline-none resize-none leading-[1.4] backdrop-blur-sm"
      />
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>↵ enregistrer · Échap annuler</span>
        <button onMouseDown={() => onCancel()} className="p-0.5 hover:text-gray-600 rounded">
          <X size={11} />
        </button>
      </div>
    </div>
  );
};

// ─── Deleted Bubble ───────────────────────────────────────────────────────────
const DeletedBubble = ({ isOwn, isContinued, time }) => (
  <div
    className={clsx(
      'relative px-3 py-2 max-w-[280px] rounded-2xl',
      !isContinued && (isOwn ? 'rounded-tr-md' : 'rounded-tl-md')
    )}
    style={{
      background: 'rgba(255,255,255,0.45)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.6)',
    }}
  >
    <div className="flex items-center gap-2 pr-12">
      <Ban size={13} className="text-gray-400 shrink-0" />
      <span className="text-[13px] italic text-gray-400">
        {isOwn ? 'Vous avez supprimé ce message' : 'Ce message a été supprimé'}
      </span>
    </div>
    {time && <span className="absolute bottom-1.5 right-2 text-[10px] text-gray-400">{time}</span>}
  </div>
);

// ─── Main MessageBubble ───────────────────────────────────────────────────────
const MessageBubble = memo(({
  message, isOwn, isContinued, isLast, isSeen, isDelivered, onImageClick,
}) => {
  const { user } = useAuth();
  const { activeConversation, updateMessage, deleteMessage, updateMessageReactions } = useChatStore();
  const [showPicker, setShowPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const attachments = message.attachments || [];
  const reactions = message.reactions || [];

  const getTime = (date) => {
    try { return format(new Date(date), 'HH:mm', { locale: fr }); }
    catch { return ''; }
  };

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8090/api/communication/chat-files/${path.split('/').pop()}`;
  };

  const handleSaveEdit = useCallback(async (newContent) => {
    if (!newContent || newContent === message.content) { setEditing(false); return; }
    try { await updateMessage(message.id, { content: newContent }); }
    catch { /* logged in store */ }
    setEditing(false);
  }, [message.id, message.content, updateMessage]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try { await deleteMessage(message.id); }
    catch { /* logged in store */ }
  }, [message.id, deleteMessage]);

  const handleToggleReaction = useCallback(async (emoji) => {
    if (!activeConversation) return;
    setShowPicker(false);
    try {
      const result = await communicationService.toggleReaction(activeConversation.id, message.id, emoji);
      updateMessageReactions(message.id, result.reactions);
    } catch (err) {
      console.error('toggleReaction error', err);
    }
  }, [activeConversation, message.id, updateMessageReactions]);

  // ── System message ────────────────────────────────────────────────────────────
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div
          className="text-[11px] px-4 py-1.5 rounded-full text-gray-500 font-medium"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        >

          {message.content}
        </div>
      </div>
    );
  }


  const timeStr = message.sending ? '...' : getTime(message.created_at);

  // ── Deleted ───────────────────────────────────────────────────────────────────
  if (message.is_deleted) {
    return (
      <div className={clsx('flex w-full mb-0.5 px-4 md:px-6', isOwn ? 'justify-end' : 'justify-start', !isContinued && 'mt-3')}>
        {!isOwn && !isContinued && <div className="w-8 h-8 mr-2 shrink-0" />}
        {!isOwn && isContinued && <div className="w-10 shrink-0" />}
        <DeletedBubble isOwn={isOwn} isContinued={isContinued} time={timeStr} />
      </div>
    );
  }

  // ── Own bubble style (glass blue) / Other bubble style (glass white) ────────
  const ownBubbleStyle = {
    background: 'linear-gradient(135deg, rgba(20,40,201,0.85) 0%, rgba(79,110,247,0.85) 100%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(79,110,247,0.4)',
    boxShadow: '0 4px 20px rgba(20,40,201,0.2)',
    color: 'white',
  };

  const otherBubbleStyle = {
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.85)',
    boxShadow: '0 2px 12px rgba(20,40,201,0.07)',
    color: '#111827',
  };

  return (
    <div className={clsx('group flex w-full mb-0.5 px-4 md:px-6', isOwn ? 'justify-end' : 'justify-start', !isContinued && 'mt-3')}>
      {/* Avatar */}
      {!isOwn && !isContinued && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white mr-2 shrink-0 self-start mt-1"
          style={{ background: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)' }}
        >
          {getInitials(message.user?.name)}
        </div>
      )}
      {!isOwn && isContinued && <div className="w-10 shrink-0" />}


      <div className={clsx('flex flex-col', isOwn ? 'items-end' : 'items-start')}>

        {/* ── Toolbar ── */}
        {!editing && (
          <div className={clsx(
            'flex items-center gap-1 mb-1',
            showPicker ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
            isOwn ? 'flex-row-reverse' : 'flex-row'
          )}>
            {/* Réagir */}
            <div className="relative">
              <motion.button
                title="Réagir"
                onClick={() => setShowPicker(v => !v)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-amber-500"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <SmilePlus size={14} />
              </motion.button>
              {showPicker && (
                <EmojiPicker isOwn={isOwn} onSelect={handleToggleReaction} onClose={() => setShowPicker(false)} />
              )}
            </div>

            {isOwn && message.type !== 'file' && (
              <motion.button
                title="Modifier"
                onClick={() => { setEditing(true); setShowPicker(false); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-[#1428C9]"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Pencil size={14} />
              </motion.button>
            )}

            {isOwn && (
              <motion.button
                title="Supprimer"
                onClick={handleDelete}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-red-500"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Trash2 size={14} />
              </motion.button>
            )}
          </div>
        )}

        {/* ── Bubble ── */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={clsx(
            'relative px-1 py-1 rounded-2xl',
            editing ? 'min-w-[240px] max-w-[85%] md:max-w-[70%]' : 'max-w-[85%] md:max-w-[70%]',
            !isContinued && (isOwn ? 'rounded-tr-md' : 'rounded-tl-md')
          )}
          style={isOwn ? ownBubbleStyle : otherBubbleStyle}
        >
          {/* Sender name */}
          {!isOwn && !isContinued && message.user?.name && (
            <p className="text-[11px] font-bold px-1.5 mb-0.5" style={{ color: '#1428C9' }}>
              {message.user.name}
            </p>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-col gap-1 mb-1">
              {attachments.map((file, i) => {
                const isImage = file.file_type?.startsWith('image/');
                const url = getFileUrl(file.file_path);
                if (isImage) {
                  return (
                    <div key={i} className="relative rounded-xl overflow-hidden max-h-80">
                      <img
                        src={url}
                        alt={file.file_name}
                        className="w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => onImageClick?.(url)}
                      />
                    </div>
                  );
                }
                return (
                  <div key={i}
                    className="flex items-center gap-3 p-2 rounded-xl border m-0.5"
                    style={isOwn ? {
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                    } : {
                      background: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.7)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,255,255,0.3)' }}
                    >
                      <FileText size={20} className={isOwn ? 'text-white/70' : 'text-gray-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx('text-[12px] font-medium truncate', isOwn ? 'text-white' : 'text-gray-700')}>{file.file_name}</p>
                      <p className={clsx('text-[10px]', isOwn ? 'text-white/60' : 'text-gray-400')}>{(file.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className={clsx('p-1.5 rounded-full hover:bg-white/20 transition-colors', isOwn ? 'text-white/70 hover:text-white' : 'text-gray-500')}
                    >
                      <Download size={16} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* Content or edit form */}
          <div className="px-1.5 py-0.5">
            {editing ? (
              <EditForm
                defaultValue={message.content}
                onSave={handleSaveEdit}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <div className="relative inline-block w-full">
                <p className={clsx(
                  'text-[14.5px] leading-[1.4] whitespace-pre-wrap pr-16 pb-1',
                  isOwn ? 'text-white' : 'text-gray-800'
                )}>
                  {message.content}
                </p>

                {/* Time + status */}
                <div className="absolute bottom-1 right-2 flex items-center gap-1.5">
                  {message.is_edited && (
                    <span className={clsx('text-[9px] italic', isOwn ? 'text-white/60' : 'text-gray-400')}>modifié</span>
                  )}
                  <span className={clsx('text-[9px]', isOwn ? 'text-white/70' : 'text-gray-400')}>{timeStr}</span>
                  {isOwn && !message.sending && !message.error && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={isSeen ? 'text-blue-200' : (isOwn ? 'text-white/60' : 'text-gray-400')}
                    >
                      {isSeen ? <CheckCheck size={13} strokeWidth={2.5} /> : <Check size={13} strokeWidth={2.5} />}
                    </motion.span>
                  )}
                  {isOwn && message.sending && (
                    <motion.span
                      animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-white/50"
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </motion.span>
                  )}
                  {isOwn && message.error && (
                    <span className="text-red-300 text-[9px]">⚠</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Reactions bar ── */}
        <ReactionsBar reactions={reactions} currentUserId={user?.id} onToggle={handleToggleReaction} />
      </div>
    </div>
  );
}, (prev, next) => (
  prev.message.id         === next.message.id         &&
  prev.message.content    === next.message.content    &&
  prev.message.is_edited  === next.message.is_edited  &&
  prev.message.is_deleted === next.message.is_deleted &&
  prev.message.sending    === next.message.sending    &&
  prev.message.error      === next.message.error      &&
  prev.message.reactions  === next.message.reactions  &&
  prev.isOwn              === next.isOwn              &&
  prev.isContinued        === next.isContinued        &&
  prev.isSeen             === next.isSeen             &&
  prev.isDelivered        === next.isDelivered
));


export default MessageBubble;
