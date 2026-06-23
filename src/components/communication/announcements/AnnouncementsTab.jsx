import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pin, Trash2, Edit2, MessageCircle, ChevronDown, ChevronUp,
  Send, Loader2, X, Calendar, Clock, AlertTriangle, Users, Bell,
  CheckCircle2, BarChart2, CornerDownRight
} from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import communicationService from '../../../services/communicationService';
import useAuth from '../../../hooks/useAuth';
import useAnnouncementStore from '../../../store/useAnnouncementStore';

// ── Constants ─────────────────────────────────────────────────────────────────
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

const TYPE_CONFIG = {
  event:   { label: 'Événement',  color: '#8b5cf6', bg: 'bg-purple-50',  icon: Calendar },
  meeting: { label: 'Réunion',    color: '#1428C9', bg: 'bg-blue-50',    icon: Users    },
  notice:  { label: 'Annonce',    color: '#0ea5e9', bg: 'bg-sky-50',     icon: Bell     },
  urgent:  { label: 'Urgent',     color: '#ef4444', bg: 'bg-red-50',     icon: AlertTriangle },
};

// ── CreateAnnouncementModal ───────────────────────────────────────────────────
const CreateAnnouncementModal = ({ onClose, onCreated, initial }) => {
  const [form, setForm] = useState({
    title:      initial?.title      || '',
    body:       initial?.body       || '',
    type:       initial?.type       || 'notice',
    color:      initial?.color      || '#1428C9',
    pinned:     initial?.pinned     || false,
    expires_at: initial?.expires_at ? initial.expires_at.slice(0, 16) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const isEdit = !!initial;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim() || !form.expires_at) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let result;
      if (isEdit) {
        result = await communicationService.updateAnnouncement(initial.id, form);
      } else {
        result = await communicationService.createAnnouncement(form);
      }
      onCreated(result);
      onClose();
    } catch (err) {
      setError(err?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      />
      <motion.div initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }} transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 24px 64px rgba(20,40,201,0.18)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {isEdit ? 'Modifier la publication' : 'Nouvelle publication'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Type tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <button key={key} type="button" onClick={() => set('type', key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={form.type === key
                  ? { background: cfg.color, color: 'white', boxShadow: `0 4px 12px ${cfg.color}40` }
                  : { background: '#f3f4f6', color: '#6b7280' }}
              >
                <cfg.icon size={12} /> {cfg.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Titre *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Ex: Réunion d'équipe mensuelle"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 focus:outline-none transition-all"
              style={{ background: 'rgba(20,40,201,0.04)', border: '1.5px solid rgba(20,40,201,0.1)' }}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Contenu *</label>
            <textarea value={form.body} onChange={e => set('body', e.target.value)}
              placeholder="Détails de la publication..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 focus:outline-none transition-all resize-none"
              style={{ background: 'rgba(20,40,201,0.04)', border: '1.5px solid rgba(20,40,201,0.1)' }}
            />
          </div>

          {/* Expiry + pin row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Date d'expiration *
              </label>
              <input type="datetime-local" value={form.expires_at}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => set('expires_at', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-gray-800 focus:outline-none transition-all"
                style={{ background: 'rgba(20,40,201,0.04)', border: '1.5px solid rgba(20,40,201,0.1)' }}
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl hover:bg-gray-50 transition-all">
                <div onClick={() => set('pinned', !form.pinned)}
                  className="w-5 h-5 rounded flex items-center justify-center transition-all"
                  style={form.pinned
                    ? { background: 'linear-gradient(135deg, #1428C9, #4f6ef7)', border: '2px solid #1428C9' }
                    : { border: '2px solid #d1d5db', background: 'transparent' }}
                >
                  {form.pinned && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className="text-sm font-semibold text-gray-700">Épingler</span>
              </label>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
              boxShadow: '0 4px 16px rgba(20,40,201,0.35)' }}
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Sauvegarde...</> :
              isEdit ? <><Edit2 size={16} /> Mettre à jour</> : <><Plus size={16} /> Publier</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ── CommentItem ───────────────────────────────────────────────────────────────
const CommentItem = ({ comment, annId, annColor, currentUser, isAdmin, onCommentUpdate, onCommentDelete }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText]           = useState('');
  const [sendingReply, setSendingReply]     = useState(false);
  const [showReplies, setShowReplies]       = useState(false);
  const replyInputRef = useRef(null);

  const replyCount = comment.replies?.length || 0;
  const canDelete  = (uid) => isAdmin || uid === currentUser?.id;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      const newReply = await communicationService.replyToAnnouncementComment(annId, comment.id, replyText.trim());
      onCommentUpdate({ ...comment, replies: [...(comment.replies || []), newReply] });
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
    } catch {}
    finally { setSendingReply(false); }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await communicationService.deleteAnnouncementComment(annId, replyId);
      onCommentUpdate({ ...comment, replies: comment.replies.filter(r => r.id !== replyId) });
    } catch {}
  };

  return (
    <div className="group">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #1428C9, #4f6ef7)' }}>
          {comment.user_name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="text-xs font-bold text-gray-700">{comment.user_name}</span>
            <span className="text-[10px] text-gray-400">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{comment.body}</p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => { setShowReplyInput(v => !v); if (!showReplyInput) setTimeout(() => replyInputRef.current?.focus(), 50); }}
              className="text-[10px] font-semibold text-gray-400 hover:text-[#1428C9] transition-colors flex items-center gap-1"
            >
              <CornerDownRight size={10} /> Répondre
            </button>
            {replyCount > 0 && (
              <button onClick={() => setShowReplies(v => !v)}
                className="text-[10px] font-semibold text-gray-400 hover:text-[#1428C9] transition-colors flex items-center gap-1">
                <MessageCircle size={10} />
                {showReplies ? 'Masquer' : `${replyCount} réponse${replyCount > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
          <AnimatePresence>
            {showReplyInput && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
                onSubmit={handleReply} className="flex items-center gap-1.5 mt-2 overflow-hidden">
                <input ref={replyInputRef} value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder={`Répondre à ${comment.user_name}…`}
                  className="flex-1 px-2.5 py-1.5 rounded-xl text-[11px] text-gray-800 focus:outline-none transition-all"
                  style={{ background: 'rgba(20,40,201,0.04)', border: '1px solid rgba(20,40,201,0.15)' }}
                />
                <button type="submit" disabled={!replyText.trim() || sendingReply}
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
                  style={{ background: replyText.trim() ? 'linear-gradient(135deg, #1428C9, #4f6ef7)' : '#e5e7eb' }}>
                  {sendingReply ? <Loader2 size={11} className="animate-spin text-white" />
                    : <Send size={11} className={replyText.trim() ? 'text-white' : 'text-gray-400'} />}
                </button>
                <button type="button" onClick={() => { setShowReplyInput(false); setReplyText(''); }}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0">
                  <X size={11} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showReplies && replyCount > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                className="mt-2 space-y-2 overflow-hidden">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="flex items-start gap-1.5 group/reply pl-2 border-l-2"
                    style={{ borderColor: `${annColor}40` }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #4f6ef7, #818cf8)' }}>
                      {reply.user_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] font-bold text-gray-700">{reply.user_name}</span>
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{reply.body}</p>
                    </div>
                    {canDelete(reply.user_id) && (
                      <button onClick={() => handleDeleteReply(reply.id)}
                        className="p-1 opacity-0 group-hover/reply:opacity-100 text-gray-300 hover:text-red-500 rounded transition-all shrink-0">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {canDelete(comment.user_id) && (
          <button onClick={() => onCommentDelete(comment.id)}
            className="p-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 rounded transition-all shrink-0">
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
};

// ── AnnouncementCard ──────────────────────────────────────────────────────────
const AnnouncementCard = ({ ann, currentUser, isAdmin, onUpdate, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState('');
  const [sendingCmt, setSendingCmt]     = useState(false);
  const [reacting, setReacting]         = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingPin, setLoadingPin]     = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editing, setEditing]           = useState(false);
  const pickerRef = useRef(null);

  const cfg     = TYPE_CONFIG[ann.type] || TYPE_CONFIG.notice;
  const expired = ann.is_expired;
  const canManage = isAdmin || ann.author_id === currentUser?.id;

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleReact = async (emoji) => {
    if (reacting) return;
    setShowEmojiPicker(false);
    setReacting(true);
    try {
      const result = await communicationService.reactToAnnouncement(ann.id, emoji);
      onUpdate({ ...ann, reactions: result.reactions, my_reaction: result.my_reaction });
    } finally { setReacting(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || sendingCmt) return;
    setSendingCmt(true);
    try {
      const newComment = await communicationService.addAnnouncementComment(ann.id, commentText.trim());
      onUpdate({ ...ann, comments: [...(ann.comments || []), { ...newComment, replies: [] }] });
      setCommentText('');
    } finally { setSendingCmt(false); }
  };

  const handleCommentUpdate = (updatedComment) => {
    onUpdate({ ...ann, comments: ann.comments.map(c => c.id === updatedComment.id ? updatedComment : c) });
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await communicationService.deleteAnnouncementComment(ann.id, commentId);
      onUpdate({ ...ann, comments: ann.comments.filter(c => c.id !== commentId) });
    } catch {}
  };

  const handlePin = async () => {
    setLoadingPin(true);
    try {
      const result = await communicationService.pinAnnouncement(ann.id);
      onUpdate({ ...ann, pinned: result.pinned });
    } finally { setLoadingPin(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    setLoadingDelete(true);
    try {
      await communicationService.deleteAnnouncement(ann.id);
      onDelete(ann.id);
    } finally { setLoadingDelete(false); }
  };

  // Total count = top-level + all replies
  const totalCommentCount = (ann.comments || []).reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0), 0
  );

  return (
    <>
      {editing && (
        <AnimatePresence>
          <CreateAnnouncementModal
            initial={ann}
            onClose={() => setEditing(false)}
            onCreated={(updated) => { onUpdate(updated); setEditing(false); }}
          />
        </AnimatePresence>
      )}

      <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`rounded-2xl overflow-hidden transition-all ${expired ? 'opacity-60' : ''}`}
        style={{ background: '#ffffff', // Fond blanc uni
          border: '1px solid #e5e7eb', // Bordure subtile
          boxShadow: ann.pinned ? `0 8px 32px ${ann.color}25` : '0 4px 16px rgba(0,0,0,0.08)' }}
      >
        {/* Accent line */}
        <div className="h-1 w-full" style={{ background: ann.color }} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {ann.pinned && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#e0e7ff', color: '#1428C9' }}>
                  <Pin size={9} /> Épinglé
                </span>
              )}
              <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full`}
                style={{ background: cfg.bg, color: cfg.color }}>
                <cfg.icon size={10} /> {cfg.label}
              </span>
              {expired && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                  Expiré
                </span>
              )}
            </div>
            {canManage && (
              <div className="flex items-center gap-1 shrink-0">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePin} disabled={loadingPin}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#1428C9] hover:bg-blue-50 transition-all disabled:opacity-40">
                  {loadingPin ? <Loader2 size={13} className="animate-spin" /> : <Pin size={13} />}
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all">
                  <Edit2 size={13} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleDelete} disabled={loadingDelete}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40">
                  {loadingDelete ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </motion.button>
              </div>
            )}
          </div>

          {/* Title + body */}
          <h3 className="text-sm font-bold text-gray-900 mb-1.5">{ann.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.body}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true, locale: fr })}
            </span>
            <span>par <span className="font-semibold text-gray-600">{ann.author_name}</span></span>
            <span className="flex items-center gap-1 ml-auto">
              <Calendar size={11} />
              Expire le {format(new Date(ann.expires_at), 'd MMM yyyy à HH:mm', { locale: fr })}
            </span>
          </div>

          {/* Reactions bar */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {ann.reactions?.map((r) => (
              <motion.button key={r.emoji} onClick={() => handleReact(r.emoji)}
                whileTap={{ scale: 1.1 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all hover:scale-105"
                style={ann.my_reaction === r.emoji
                  ? { background: `${ann.color}18`, border: `1px solid ${ann.color}40`, color: ann.color, fontWeight: 700 }
                  : { background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <span>{r.emoji}</span>
                <span className="font-bold">{r.count}</span>
              </motion.button>
            ))}

            {/* Emoji picker trigger */}
            <div className="relative" ref={pickerRef}>
              <button onClick={() => setShowEmojiPicker(v => !v)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-gray-400 hover:text-amber-500 transition-all"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
                {reacting ? <Loader2 size={12} className="animate-spin" /> : '😊 +'}
              </button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 left-0 flex gap-0.5 p-1.5 rounded-2xl z-50"
                    style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(20,40,201,0.15)' }}
                  >
                    {EMOJIS.map(e => (
                      <button key={e} onMouseDown={() => handleReact(e)}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-xl transition-all hover:scale-125">
                        {e}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Comments toggle */}
            <button onClick={() => setShowComments(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs text-gray-500 hover:text-[#1428C9] transition-all ml-auto"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <MessageCircle size={12} />
              <span>{totalCommentCount}</span>
              {showComments ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>

          {/* Comments section */}
          <AnimatePresence>
            {showComments && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <div className="space-y-3 mb-3 max-h-72 overflow-y-auto pr-1">
                  {(!ann.comments || ann.comments.length === 0) && (
                    <p className="text-xs text-gray-400 text-center py-3">Aucun commentaire</p>
                  )}
                  {ann.comments?.map(c => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      annId={ann.id}
                      annColor={ann.color}
                      currentUser={currentUser}
                      isAdmin={isAdmin}
                      onCommentUpdate={handleCommentUpdate}
                      onCommentDelete={handleDeleteComment}
                    />
                  ))}
                </div>

                {/* Add comment */}
                <form onSubmit={handleAddComment} className="flex items-center gap-2">
                  <input value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none transition-all"
                    style={{ background: 'rgba(20,40,201,0.04)', border: '1px solid rgba(20,40,201,0.12)' }}
                  />
                  <button type="submit" disabled={!commentText.trim() || sendingCmt}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                    style={{ background: commentText.trim() ? 'linear-gradient(135deg, #1428C9, #4f6ef7)' : '#e5e7eb' }}>
                    {sendingCmt ? <Loader2 size={13} className="animate-spin text-white" /> :
                      <Send size={13} className={commentText.trim() ? 'text-white' : 'text-gray-400'} />}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

// ── Main AnnouncementsTab ─────────────────────────────────────────────────────
const AnnouncementsTab = ({ highlightId = null }) => {
  const { user } = useAuth();
  // Accept any admin-like role name
  const isAdmin = !!(
    user?.role?.toLowerCase().includes('admin') ||
    user?.role_type?.toLowerCase().includes('admin')
  );

  // Use the announcement store as the source of truth so WebSocket updates
  // (reactions, comments, replies) are reflected immediately.
  const storeAnnouncements    = useAnnouncementStore(state => state.announcements);
  const setStoreAnnouncements = useAnnouncementStore(state => state.setAnnouncements);
  const upsertAnnouncement    = useAnnouncementStore(state => state.upsertAnnouncement);
  const removeAnnouncement    = useAnnouncementStore(state => state.removeAnnouncement);

  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter]     = useState('active'); // 'active' | 'all'
  const [typeFilter, setTypeFilter] = useState('all');
  const [adminView, setAdminView]   = useState(false);
  const [dimmedHighlight, setDimmedHighlight] = useState(false);
  const cardRefs = useRef({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await communicationService.getAnnouncements(filter === 'all' || adminView);
      setStoreAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load announcements', err);
      setStoreAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [filter, adminView, setStoreAnnouncements]);

  useEffect(() => { load(); }, [load]);

  // Scroll to and highlight the target announcement when highlightId changes or cards finish loading
  useEffect(() => {
    if (!highlightId || loading) return;
    setDimmedHighlight(false);
    const target = storeAnnouncements.find(a => a.id === highlightId);
    if (target?.is_expired && filter === 'active') {
      setFilter('all');
      return;
    }
    const el = cardRefs.current[highlightId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const t = setTimeout(() => setDimmedHighlight(true), 3000);
      return () => clearTimeout(t);
    }
  }, [highlightId, loading, storeAnnouncements, filter]);

  const handleUpdate = useCallback((updated) => {
    upsertAnnouncement(updated);
  }, [upsertAnnouncement]);

  const handleDelete = useCallback((id) => {
    removeAnnouncement(id);
  }, [removeAnnouncement]);

  const handleCreated = useCallback((created) => {
    upsertAnnouncement(created);
  }, [upsertAnnouncement]);

  const filtered = storeAnnouncements.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Stats for admin
  const stats = {
    total:   storeAnnouncements.length,
    active:  storeAnnouncements.filter(a => !a.is_expired).length,
    expired: storeAnnouncements.filter(a => a.is_expired).length,
    pinned:  storeAnnouncements.filter(a => a.pinned).length,
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'transparent' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{
          background: '#ffffff', // Fond blanc pour l'en-tête des publications
          backdropFilter: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 2px 16px rgba(20,40,201,0.06)' }}
      >
        <div>
          <h2 className="text-base font-bold text-gray-900">Publications</h2>
          <p className="text-xs text-gray-400 mt-0.5">Réunions, événements et annonces</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setAdminView(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={adminView
                ? { background: '#1428C9', color: 'white', boxShadow: '0 4px 12px rgba(20,40,201,0.3)' }
                : { background: 'rgba(255,255,255,0.6)', color: '#1428C9', border: '1px solid rgba(20,40,201,0.2)' }}
            >
              {adminView ? '← Vue normale' : '⚙ Gérer'}
            </button>
          )}
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                boxShadow: '0 4px 12px rgba(20,40,201,0.35)' }}
            >
              <Plus size={16} /> Publier
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Admin view: stats + management table ── */}
      {isAdmin && adminView ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total,   color: '#1428C9', bg: 'rgba(20,40,201,0.08)' },
              { label: 'Actives',  value: stats.active,  color: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
              { label: 'Expirées', value: stats.expired, color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
              { label: 'Épinglées',value: stats.pinned,  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.8)', border: `1px solid ${s.color}25`,
                  backdropFilter: 'blur(12px)' }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Management table */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(20,40,201,0.08)' }}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">Toutes les publications ({storeAnnouncements.length})</p>
              <button onClick={load} className="p-1.5 rounded-lg text-gray-400 hover:text-[#1428C9] hover:bg-blue-50 transition-all">
                <Clock size={14} />
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-gray-300" />
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {storeAnnouncements.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-10">Aucune publication</p>
                ) : storeAnnouncements.map(ann => {
                  const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.notice;
                  return (
                    <div key={ann.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors group">
                      {/* Color bar */}
                      <div className="w-1 h-10 rounded-full shrink-0" style={{ background: ann.color }} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {ann.pinned && <Pin size={10} className="text-amber-500 shrink-0" />}
                          <p className="text-sm font-semibold text-gray-800 truncate">{ann.title}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: `${cfg.color}18`, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          {ann.is_expired && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 shrink-0">
                              Expiré
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          <span>Par {ann.author_name}</span>
                          <span>{format(new Date(ann.created_at), 'd MMM yyyy', { locale: fr })}</span>
                          <span className="flex items-center gap-0.5">
                            <Calendar size={9} />
                            Expire {format(new Date(ann.expires_at), 'd MMM yyyy à HH:mm', { locale: fr })}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageCircle size={9} /> {ann.comments?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Actions — always visible for admin */}
                      <div className="flex items-center gap-1">
                        <button onClick={async () => {
                          const result = await communicationService.pinAnnouncement(ann.id);
                          handleUpdate({ ...ann, pinned: result.pinned });
                        }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                          title={ann.pinned ? 'Désépingler' : 'Épingler'}>
                          <Pin size={13} className={ann.pinned ? 'text-amber-500' : ''} />
                        </button>
                        <button
                          onClick={() => {
                            // open edit by setting a temp state — use inline trigger
                            setAnnouncements(prev => prev.map(a =>
                              a.id === ann.id ? { ...a, _editing: true } : a
                            ));
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                        >
                          <Edit2 size={13} />
                        </button>
                        {ann._editing && (
                          <CreateAnnouncementModal
                            initial={ann}
                            onClose={() => setAnnouncements(prev => prev.map(a =>
                              a.id === ann.id ? { ...a, _editing: false } : a
                            ))}
                            onCreated={(updated) => {
                              handleUpdate({ ...updated, _editing: false });
                            }}
                          />
                        )}
                        <button onClick={async () => {
                          if (!window.confirm('Supprimer cette publication ?')) return;
                          await communicationService.deleteAnnouncement(ann.id);
                          handleDelete(ann.id);
                        }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── Filters (normal view) ── */}
          <div className="flex items-center gap-2 px-4 py-3 shrink-0 flex-wrap">
            <div className="flex gap-1 p-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}
            >
              {[{ k: 'active', l: 'Actives' }, { k: 'all', l: 'Toutes les publications' }].map(({ k, l }) => (
                <button key={k} onClick={() => setFilter(k)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={filter === k
                    ? { background: 'rgba(255,255,255,0.9)', color: '#1428C9', boxShadow: '0 1px 6px rgba(20,40,201,0.10)' }
                    : { color: '#6b7280' }}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setTypeFilter('all')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={typeFilter === 'all'
                  ? { background: '#1428C9', color: 'white' }
                  : { background: 'rgba(255,255,255,0.6)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.8)' }}>
                Tous les types
              </button>
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setTypeFilter(key)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                  style={typeFilter === key
                    ? { background: cfg.color, color: 'white' }
                    : { background: 'rgba(255,255,255,0.6)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.8)' }}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Cards ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/40">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.7)' }}>
                  <div className="h-1 w-full bg-gray-200 rounded-full mb-3" />
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded-full w-full mb-1" />
                  <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                </div>
              ))
            ) : filtered.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filtered.map(ann => (
                  <div
                    key={ann.id}
                    ref={el => { cardRefs.current[ann.id] = el; }}
                    className="transition-all duration-700"
                    style={highlightId === ann.id && !dimmedHighlight
                      ? { borderRadius: '1rem', boxShadow: '0 0 0 3px #1428C9, 0 8px 32px rgba(20,40,201,0.25)' }
                      : {}}
                  >
                    <AnnouncementCard
                      ann={ann}
                      currentUser={user}
                      isAdmin={isAdmin}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)' }}>
                  <Bell size={28} className="text-gray-200" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Aucune publication</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isAdmin ? 'Cliquez sur "Publier" pour créer une annonce' : 'Aucune annonce disponible pour le moment'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateAnnouncementModal
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementsTab;
