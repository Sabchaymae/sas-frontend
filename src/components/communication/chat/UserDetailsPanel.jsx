<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Users, UserPlus, Loader2, Check, Search, Archive, Ban, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import { userService } from '../../../services/userService';

const Section = ({ title, children }) => (
  <div className="py-4 border-b border-gray-50 last:border-0">
    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-5">{title}</h4>
=======
import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Mail, Phone, Users, UserPlus, Loader2, Check,
  Search, Archive, Ban, Trash2, ChevronRight, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../hooks/useAuth';
import { userService } from '../../../services/userService';
import { useActionToastStore } from '../../../components/common/ActionToast';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Spinner = ({ size = 14 }) => <Loader2 size={size} className="animate-spin shrink-0" />;

const Section = ({ title, children }) => (
  <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-5">{title}</h4>
>>>>>>> import/master
    {children}
  </div>
);

<<<<<<< HEAD
=======
// ── Action Button with loading ────────────────────────────────────────────────
const ActionBtn = ({ onClick, loading, disabled, icon: Icon, label, danger = false, success = false }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={clsx(
      'w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all text-sm font-medium text-left',
      loading ? 'opacity-70 cursor-wait' : 'active:scale-[0.98]',
      danger ? 'text-red-500 hover:bg-red-50/70' : success ? 'text-green-600 hover:bg-green-50/70' : 'text-gray-600 hover:bg-white/50'
    )}
  >
    {loading
      ? <Spinner size={16} />
      : <Icon size={16} className="shrink-0" />
    }
    <span>{loading ? 'En cours...' : label}</span>
  </button>
);

// clsx mini helper (inline, no import needed)
function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

>>>>>>> import/master
const UserDetailsPanel = ({
  conversation,
  isArchived,
  onClose,
  onDelete,
  onArchive,
  onUnarchive,
  onBlock,
  onUnblock,
  onLeaveGroup,
  onInviteGroupMembers,
  onRemoveGroupMember,
<<<<<<< HEAD
  onDeleteGroup
=======
  onDeleteGroup,
>>>>>>> import/master
}) => {
  const { user } = useAuth();
  const otherUser = conversation.other_user;
  const isGroup = conversation.type === 'group';
  const name = isGroup ? conversation.name : otherUser?.name;
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
<<<<<<< HEAD
  const currentUserParticipant = isGroup ? conversation.participants?.find(p => p.id === user?.id) : null;
=======
  const currentUserParticipant = isGroup
    ? conversation.participants?.find(p => p.id === user?.id)
    : null;
>>>>>>> import/master
  const isCurrentUserAdmin = isGroup && currentUserParticipant?.pivot?.role === 'admin';

  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToInvite, setSelectedToInvite] = useState([]);
<<<<<<< HEAD
  const [inviting, setInviting] = useState(false);
=======

  // Per-action loading states
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState('');
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingDeleteGroup, setLoadingDeleteGroup] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
>>>>>>> import/master

  useEffect(() => {
    if (isCurrentUserAdmin && showInviteSection) {
      setLoadingUsers(true);
      userService.getUsers({ all: true })
        .then(r => setAllUsers(r.data || []))
        .catch(console.error)
        .finally(() => setLoadingUsers(false));
    }
  }, [isCurrentUserAdmin, showInviteSection]);

<<<<<<< HEAD
  const handleInvite = async () => {
    if (!selectedToInvite.length) return;
    setInviting(true);
=======
  const handleInvite = useCallback(async () => {
    if (!selectedToInvite.length) return;
    const count = selectedToInvite.length;
    setLoadingInvite(true);
>>>>>>> import/master
    try {
      await onInviteGroupMembers(conversation.id, selectedToInvite);
      setSelectedToInvite([]);
      setShowInviteSection(false);
<<<<<<< HEAD
    } catch (e) { console.error(e); }
    finally { setInviting(false); }
  };

  const toggleCandidate = (id) =>
    setSelectedToInvite(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const existingIds = conversation.participants?.map(p => p.id) || [];
  const candidates = allUsers.filter(u =>
    !existingIds.includes(u.id) &&
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
        <h3 className="text-sm font-semibold text-gray-800">{isGroup ? 'Infos du groupe' : 'Profil'}</h3>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
=======
      const msg = `Invitation${count > 1 ? 's' : ''} envoyée${count > 1 ? 's' : ''} !`;
      setInviteFeedback(msg);
      useActionToastStore.getState().showActionToast({ message: msg, type: 'success' });
      setTimeout(() => setInviteFeedback(''), 3000);
    } catch (e) {
      console.error('Invite error', e);
      try { console.error('Invite error details', e.data); } catch (_) {}
      // Try to extract useful message from backend 422 response
      let msg = 'Erreur lors de l\'envoi des invitations';
      try {
        if (e && typeof e === 'object') {
          if (e.data && e.data.message) msg = e.data.message;
          else if (e.data && e.data.errors) {
            // Flatten validation errors
            const errs = e.data.errors;
            msg = Object.values(errs).flat().join(' ');
          } else if (e.message) msg = e.message;
        }
      } catch (ex) {
        // ignore
      }
      setInviteFeedback(msg);
      useActionToastStore.getState().showActionToast({ message: msg, type: 'error' });
    } finally { setLoadingInvite(false); }
  }, [selectedToInvite, onInviteGroupMembers, conversation.id]);

  const handleBlock = useCallback(async () => {
    setLoadingBlock(true);
    try {
      if (conversation.is_blocked_by_me) await onUnblock(otherUser?.id);
      else await onBlock(otherUser?.id);
    } finally { setLoadingBlock(false); }
  }, [conversation.is_blocked_by_me, onBlock, onUnblock, otherUser]);

  const handleArchiveToggle = useCallback(async () => {
    setLoadingArchive(true);
    try {
      if (isArchived) await onUnarchive(conversation.id);
      else await onArchive(conversation.id);
    } finally { setLoadingArchive(false); }
  }, [isArchived, onArchive, onUnarchive, conversation.id]);

  const handleLeave = useCallback(async () => {
    if (!window.confirm('Quitter ce groupe ?')) return;
    setLoadingLeave(true);
    try {
      if (onLeaveGroup) await onLeaveGroup(conversation.id);
      else await onArchive(conversation.id);
    } finally { setLoadingLeave(false); }
  }, [onLeaveGroup, onArchive, conversation.id]);

  const handleDelete = useCallback(async () => {
    const msg = isGroup
      ? "Supprimer l'historique de ce groupe ? La discussion disparaîtra de votre liste uniquement."
      : "Supprimer l'historique ? La conversation disparaîtra de votre liste uniquement.";
    if (!window.confirm(msg)) return;
    setLoadingDelete(true);
    try { await onDelete(conversation.id); }
    finally { setLoadingDelete(false); }
  }, [onDelete, conversation.id, isGroup]);

  const handleDeleteGroup = useCallback(async () => {
    if (!window.confirm('Supprimer le groupe ? Action irréversible.')) return;
    setLoadingDeleteGroup(true);
    try { await onDeleteGroup(conversation.id); }
    finally { setLoadingDeleteGroup(false); }
  }, [onDeleteGroup, conversation.id]);

  const handleRemoveMember = useCallback(async (memberId, memberName) => {
    if (!window.confirm(`Retirer ${memberName} du groupe ?`)) return;
    setRemovingMemberId(memberId);
    try { await onRemoveGroupMember(conversation.id, memberId); }
    finally { setRemovingMemberId(null); }
  }, [onRemoveGroupMember, conversation.id]);

  const toggleCandidate = (id) =>
    setSelectedToInvite(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const existingIds = conversation.participants?.map(p => p.id) || [];
  // Exclude from invite candidates only those still active in the group
  const activeParticipantIds = conversation.participants
    ?.filter(p => p.pivot?.status !== 'left' && p.pivot?.status !== 'removed')
    .map(p => p.id) || [];
  const candidates = allUsers.filter(u =>
    !activeParticipantIds.includes(u.id) &&
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full"
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 h-16 shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.6)',
          background: 'rgba(255,255,255,0.6)',
        }}
      >
        <h3 className="text-sm font-bold text-gray-800">
          {isGroup ? 'Infos du groupe' : 'Profil'}
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-700 rounded-xl transition-all"
          style={{ background: 'rgba(0,0,0,0.04)' }}
        >
>>>>>>> import/master
          <X size={16} />
        </button>
      </div>

<<<<<<< HEAD
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
        {/* Profile Card */}
        <div className="flex flex-col items-center pt-8 pb-6 px-5 border-b border-gray-50">
          <div className="relative mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-sm ${isGroup ? 'bg-blue-50 text-[#1428C9]' : 'bg-gradient-to-br from-[#1428C9] to-blue-400 text-white'}`}>
              {isGroup ? <Users size={28} /> : initials}
            </div>
            {!isGroup && <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />}
          </div>
          <h2 className="text-base font-bold text-gray-900">{name}</h2>
          <p className="text-xs text-gray-400 mt-1">{isGroup ? `${conversation.participants?.length || 0} participants` : otherUser?.role || 'Collaborateur'}</p>
        </div>

        {/* Group Members */}
        {isGroup && (
          <Section title="Membres">
            {isCurrentUserAdmin && (
              <div className="px-5 mb-3">
                <button onClick={() => setShowInviteSection(!showInviteSection)}
                  className="w-full flex items-center justify-between p-3 border border-dashed border-gray-200 rounded-xl hover:border-[#1428C9]/40 hover:bg-blue-50/30 transition-all text-sm text-gray-500 hover:text-[#1428C9]">
                  <div className="flex items-center gap-2"><UserPlus size={15} /><span className="font-medium">Inviter des membres</span></div>
                  <ChevronRight size={15} className={`transition-transform ${showInviteSection ? 'rotate-90' : ''}`} />
                </button>
              </div>
            )}
            <AnimatePresence>
              {isCurrentUserAdmin && showInviteSection && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 mb-3">
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                      <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1428C9]/40 transition-all" />
                    </div>
                    <div className="max-h-36 overflow-y-auto bg-white border border-gray-100 rounded-lg p-1 space-y-0.5">
                      {loadingUsers ? (
                        <div className="p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5"><Loader2 size={12} className="animate-spin" />Chargement...</div>
                      ) : candidates.length > 0 ? candidates.map(u => {
                        const isSel = selectedToInvite.includes(u.id);
                        return (
                          <button key={u.id} onClick={() => toggleCandidate(u.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${isSel ? 'bg-blue-50 text-[#1428C9]' : 'hover:bg-gray-50'}`}>
                            <div><p className="font-medium text-gray-800">{u.name}</p><p className="text-gray-400 text-[10px]">{u.email}</p></div>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSel ? 'bg-[#1428C9] border-[#1428C9]' : 'border-gray-300'}`}>
                              {isSel && <Check size={9} className="text-white" />}
                            </div>
                          </button>
                        );
                      }) : <p className="p-3 text-center text-xs text-gray-400">Aucun collègue disponible</p>}
                    </div>
                    <button disabled={!selectedToInvite.length || inviting} onClick={handleInvite}
                      className="w-full bg-[#1428C9] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#1020A8] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5">
                      {inviting ? <><Loader2 size={12} className="animate-spin" />Invitation...</> : <><UserPlus size={12} />Ajouter ({selectedToInvite.length})</>}
                    </button>
=======
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/40">

        {/* ── Profile Card ── */}
        <div className="flex flex-col items-center pt-8 pb-6 px-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}
        >
          <div className="relative mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
              style={isGroup ? {
                background: 'linear-gradient(135deg, rgba(20,40,201,0.12) 0%, rgba(79,110,247,0.12) 100%)',
                border: '2px solid rgba(20,40,201,0.2)',
                color: '#1428C9',
              } : {
                background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(20,40,201,0.3)',
              }}
            >
              {isGroup ? <Users size={28} /> : initials}
            </div>
            {!isGroup && (
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>
          <h2 className="text-base font-bold text-gray-900">{name}</h2>
          <p className="text-xs text-gray-400 mt-1">
            {isGroup
              ? `${conversation.participants?.filter(p => p.pivot?.status !== 'left' && p.pivot?.status !== 'removed').length || 0} participants`
              : otherUser?.role || 'Collaborateur'}
          </p>
        </div>

        {/* ── Group Members ── */}
        {isGroup && (
          <Section title="Membres">
            {/* Invite button */}
            {isCurrentUserAdmin && (
              <div className="px-5 mb-3">
                <button
                  onClick={() => setShowInviteSection(!showInviteSection)}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm"
                  style={{
                    border: '1.5px dashed rgba(20,40,201,0.25)',
                    background: showInviteSection ? 'rgba(20,40,201,0.05)' : 'transparent',
                    color: '#1428C9',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <UserPlus size={14} />
                    <span className="font-semibold">Inviter des membres</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="transition-transform duration-200"
                    style={{ transform: showInviteSection ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                </button>
              </div>
            )}

            {/* Invite section */}
            <AnimatePresence>
              {isCurrentUserAdmin && showInviteSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden px-5 mb-3"
                >
                  <div className="p-3 rounded-2xl space-y-2.5"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)' }}
                  >
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs focus:outline-none rounded-xl transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(255,255,255,0.8)',
                        }}
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto rounded-xl p-1 space-y-0.5"
                      style={{ background: 'rgba(255,255,255,0.5)' }}
                    >
                      {loadingUsers ? (
                        <div className="p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                          <Spinner size={12} /> Chargement...
                        </div>
                      ) : candidates.length > 0 ? candidates.map(u => {
                        const isSel = selectedToInvite.includes(u.id);
                        return (
                          <button
                            key={u.id}
                            onClick={() => toggleCandidate(u.id)}
                            className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all hover:bg-white/60"
                            style={isSel ? {
                              background: 'rgba(20,40,201,0.08)',
                              color: '#1428C9',
                            } : {}}
                          >
                            <div>
                              <p className="font-semibold text-gray-800">{u.name}</p>
                              <p className="text-gray-400 text-[10px]">{u.email}</p>
                            </div>
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center transition-all shrink-0"
                              style={isSel ? {
                                background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                                border: '2px solid #1428C9',
                              } : {
                                background: 'transparent',
                                border: '2px solid #d1d5db',
                              }}
                            >
                              {isSel && <Check size={9} className="text-white" strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      }) : (
                        <p className="p-3 text-center text-xs text-gray-400">Aucun collègue disponible</p>
                      )}
                    </div>

                    <button
                      disabled={!selectedToInvite.length || loadingInvite}
                      onClick={handleInvite}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                      style={{
                        background: selectedToInvite.length
                          ? 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)'
                          : 'rgba(20,40,201,0.2)',
                        boxShadow: selectedToInvite.length ? '0 4px 12px rgba(20,40,201,0.3)' : 'none',
                      }}
                    >
                      {loadingInvite
                        ? <><Spinner size={12} /> Envoi en cours...</>
                        : <><UserPlus size={12} /> Ajouter ({selectedToInvite.length})</>
                      }
                    </button>
                    {inviteFeedback && (
                      <p className="text-[11px] text-green-600 font-semibold text-center py-1">
                        ✓ {inviteFeedback}
                      </p>
                    )}
>>>>>>> import/master
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
<<<<<<< HEAD
            <div className="px-5 space-y-0.5">
              {conversation.participants?.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 text-xs font-semibold flex items-center justify-center shrink-0">
                    {p.name ? p.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{p.email}</p>
                  </div>
                  {p.pivot?.role === 'admin' && <span className="text-[9px] font-bold text-[#1428C9] bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">Admin</span>}
                  {isCurrentUserAdmin && p.id !== user?.id && (
                    <button onClick={async () => { if (window.confirm(`Retirer ${p.name} du groupe ?`)) await onRemoveGroupMember(conversation.id, p.id); }}
                      className="p-1 text-gray-300 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"><X size={13} /></button>
                  )}
                </div>
              ))}
=======

            {/* Members list */}
            <div className="px-5 space-y-0.5">
              {conversation.participants
                ?.filter(p => {
                  const s = p.pivot?.status;
                  // Hide only those who explicitly left or were removed
                  return s !== 'left' && s !== 'removed';
                })
                .map(p => {
                const isRemoving = removingMemberId === p.id;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all group hover:bg-white/40"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        color: '#374151',
                      }}
                    >
                      {p.name ? p.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{p.email}</p>
                    </div>
                    {p.pivot?.role === 'admin' && (
                      <span className="text-[9px] font-bold text-[#1428C9] px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                        style={{ background: 'rgba(20,40,201,0.08)', border: '1px solid rgba(20,40,201,0.15)' }}
                      >
                        Admin
                      </span>
                    )}
                    {isCurrentUserAdmin && p.id !== user?.id && (
                      <button
                        onClick={() => !isRemoving && handleRemoveMember(p.id, p.name)}
                        disabled={isRemoving}
                        className="p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50/50 disabled:opacity-40"
                      >
                        {isRemoving ? <Spinner size={13} /> : <X size={13} />}
                      </button>
                    )}
                  </div>
                );
              })}
>>>>>>> import/master
            </div>
          </Section>
        )}

<<<<<<< HEAD
        {/* Contact Info */}
        {!isGroup && (
          <Section title="Coordonnées">
            <div className="px-5 space-y-1">
              {[{ icon: Mail, label: 'Email', value: otherUser?.email || 'N/A' }, { icon: Phone, label: 'Téléphone', value: otherUser?.phone || 'N/A' }].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0"><Icon size={15} /></div>
                  <div className="min-w-0"><p className="text-[10px] text-gray-400 mb-0.5">{label}</p><p className="text-sm font-medium text-gray-800 truncate">{value}</p></div>
=======
        {/* ── Contact Info ── */}
        {!isGroup && (
          <Section title="Coordonnées">
            <div className="px-5 space-y-1">
              {[
                { icon: Mail, label: 'Email', value: otherUser?.email || 'N/A' },
                { icon: Phone, label: 'Téléphone', value: otherUser?.phone || 'N/A' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)' }}
                  >
                    <Icon size={14} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                  </div>
>>>>>>> import/master
                </div>
              ))}
            </div>
          </Section>
        )}

<<<<<<< HEAD
        {/* Actions */}
        <Section title={isGroup ? 'Actions groupe' : 'Zone de sécurité'}>
          <div className="px-5 space-y-1">
            {isGroup ? (
              <>
                {isCurrentUserAdmin && (
                  <button onClick={() => { if (window.confirm("Supprimer le groupe ? Action irréversible.")) onDeleteGroup(conversation.id); }}
                    className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-medium text-left">
                    <Trash2 size={16} />Supprimer le groupe
                  </button>
                )}
                <button onClick={() => onLeaveGroup ? onLeaveGroup(conversation.id) : onArchive(conversation.id)}
                  className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-medium text-left">
                  <X size={16} />Quitter le groupe
                </button>
                {isArchived ? (
                  <button onClick={() => onUnarchive(conversation.id)} className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all text-sm font-medium text-left">
                    <Archive size={16} className="rotate-180 text-gray-400" />Désarchiver le groupe
                  </button>
                ) : (
                  <button onClick={() => onArchive(conversation.id)} className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all text-sm font-medium text-left">
                    <Archive size={16} className="text-gray-400" />Archiver le groupe
                  </button>
=======
        {/* ── Actions ── */}
        <Section title={isGroup ? 'Actions groupe' : 'Zone de sécurité'}>
          <div className="space-y-0.5">
            {isGroup ? (
              <>
                {/* Archive/Unarchive groupe */}
                <ActionBtn
                  onClick={handleArchiveToggle}
                  loading={loadingArchive}
                  icon={Archive}
                  label={isArchived ? 'Désarchiver le groupe' : 'Archiver le groupe'}
                />
                {/* Quitter */}
                <ActionBtn
                  onClick={handleLeave}
                  loading={loadingLeave}
                  icon={LogOut}
                  label="Quitter le groupe"
                  danger
                />
                {/* Supprimer l'historique — visible for all members */}
                <ActionBtn
                  onClick={handleDelete}
                  loading={loadingDelete}
                  icon={Trash2}
                  label="Supprimer l'historique"
                  danger
                />
                {/* Supprimer le groupe — admin only (hard delete for everyone) */}
                {isCurrentUserAdmin && (
                  <ActionBtn
                    onClick={handleDeleteGroup}
                    loading={loadingDeleteGroup}
                    icon={Trash2}
                    label="Supprimer le groupe pour tous"
                    danger
                  />
>>>>>>> import/master
                )}
              </>
            ) : (
              <>
<<<<<<< HEAD
                {conversation.is_blocked_by_me ? (
                  <button onClick={() => onUnblock(otherUser?.id)} className="w-full flex items-center gap-3 p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all text-sm font-medium text-left">
                    <Check size={16} />Débloquer ce contact
                  </button>
                ) : (
                  <button onClick={() => onBlock(otherUser?.id)} className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all text-sm font-medium text-left">
                    <Ban size={16} />Bloquer ce contact
                  </button>
                )}
                {isArchived ? (
                  <button onClick={() => onUnarchive(conversation.id)} className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all text-sm font-medium text-left">
                    <Archive size={16} className="rotate-180 text-gray-400" />Désarchiver la conversation
                  </button>
                ) : (
                  <button onClick={() => onArchive(conversation.id)} className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all text-sm font-medium text-left">
                    <Archive size={16} className="text-gray-400" />Archiver la conversation
                  </button>
                )}
                <button onClick={() => { if (window.confirm("Supprimer l'historique ? Action irréversible.")) onDelete(conversation.id); }}
                  className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-medium text-left">
                  <Trash2 size={16} />Supprimer l'historique
                </button>
=======
                {/* Bloquer/Débloquer */}
                <ActionBtn
                  onClick={handleBlock}
                  loading={loadingBlock}
                  icon={conversation.is_blocked_by_me ? Check : Ban}
                  label={conversation.is_blocked_by_me ? 'Débloquer ce contact' : 'Bloquer ce contact'}
                  success={!!conversation.is_blocked_by_me}
                  danger={!conversation.is_blocked_by_me}
                />
                {/* Archive/Unarchive */}
                <ActionBtn
                  onClick={handleArchiveToggle}
                  loading={loadingArchive}
                  icon={Archive}
                  label={isArchived ? 'Désarchiver la conversation' : 'Archiver la conversation'}
                />
                {/* Supprimer historique */}
                <ActionBtn
                  onClick={handleDelete}
                  loading={loadingDelete}
                  icon={Trash2}
                  label="Supprimer l'historique"
                  danger
                />
>>>>>>> import/master
              </>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default UserDetailsPanel;
