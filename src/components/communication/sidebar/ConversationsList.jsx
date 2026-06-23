<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Search, Plus, Archive, ArrowLeft, MessageSquare, Check, X, UserPlus, Users } from 'lucide-react';
=======
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Archive, ArrowLeft, MessageSquare, Check, X, UserPlus, Users, Loader2, LogIn } from 'lucide-react';
>>>>>>> import/master
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import useChatStore from '../../../store/useChatStore';
import useInvitationStore from '../../../store/useInvitationStore';
<<<<<<< HEAD
import useAuth from '../../../hooks/useAuth';

const ConversationsList = ({ onNewChat }) => {
  const { user } = useAuth();
=======
import { communicationService } from '../../../services/communicationService';

// ── Spinner inline ────────────────────────────────────────────────────────────
const Spinner = ({ size = 13 }) => (
  <Loader2 size={size} className="animate-spin shrink-0" />
);

const ConversationsList = ({ onNewChat }) => {
>>>>>>> import/master
  const {
    conversations,
    archivedConversations,
    activeConversation,
    setActiveConversation,
    loading,
    markConversationAsRead,
    archiveConversation,
    unarchiveConversation,
<<<<<<< HEAD
    typingUsers
  } = useChatStore();

  const {
    invitations,
    fetchInvitations,
    acceptInvitation,
    rejectInvitation
=======
    typingUsers,
  } = useChatStore();

  const { invitations, fetchInvitations, acceptInvitation, rejectInvitation,
    rejoinRequests, fetchRejoinRequests, acceptRejoinRequest, rejectRejoinRequest,
>>>>>>> import/master
  } = useInvitationStore();

  const [filterTab, setFilterTab] = useState('all');
  const [viewingArchived, setViewingArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

<<<<<<< HEAD
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleAccept = async (invitationId, e) => {
    e.stopPropagation();
    await acceptInvitation(invitationId);
  };

  const handleReject = async (invitationId, e) => {
    e.stopPropagation();
    await rejectInvitation(invitationId);
  };
=======
  // Per-invitation loading states
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // Per-conversation archive loading
  const [archivingId, setArchivingId] = useState(null);

  // Conversation selection loading
  const [selectingId, setSelectingId] = useState(null);

  // Rejoin request: track which conversation has a pending request sent
  const [rejoinPending, setRejoinPending] = useState({}); // { [convId]: 'idle'|'sending'|'sent' }

  useEffect(() => {
    fetchInvitations();
    fetchRejoinRequests();
  }, [fetchInvitations, fetchRejoinRequests]);

  const handleSendRejoinRequest = useCallback(async (e, convId) => {
    e.stopPropagation();
    setRejoinPending(prev => ({ ...prev, [convId]: 'sending' }));
    try {
      await communicationService.sendRejoinRequest(convId);
      setRejoinPending(prev => ({ ...prev, [convId]: 'sent' }));
    } catch (err) {
      // Already pending
      if (err?.status === 409 || err?.message?.includes('attente')) {
        setRejoinPending(prev => ({ ...prev, [convId]: 'sent' }));
      } else {
        setRejoinPending(prev => ({ ...prev, [convId]: 'idle' }));
      }
    }
  }, []);

  const handleAccept = useCallback(async (id, e) => {
    e.stopPropagation();
    setAcceptingId(id);
    try { await acceptInvitation(id); }
    finally { setAcceptingId(null); }
  }, [acceptInvitation]);

  const handleReject = useCallback(async (id, e) => {
    e.stopPropagation();
    setRejectingId(id);
    try { await rejectInvitation(id); }
    finally { setRejectingId(null); }
  }, [rejectInvitation]);

  const handleArchiveToggle = useCallback(async (e, convId, isArchived) => {
    e.stopPropagation();
    setArchivingId(convId);
    try {
      if (isArchived) await unarchiveConversation(convId);
      else await archiveConversation(convId);
    } finally { setArchivingId(null); }
  }, [archiveConversation, unarchiveConversation]);

  const handleSelectConversation = useCallback(async (conv) => {
    setSelectingId(conv.id);
    setActiveConversation(conv);
    await markConversationAsRead(conv.id);
    setSelectingId(null);
  }, [setActiveConversation, markConversationAsRead]);
>>>>>>> import/master

  const listToFilter = viewingArchived ? archivedConversations : conversations;

  const filteredConversations = listToFilter.filter(conv => {
    const name = conv.type === 'group' ? conv.name : (conv.other_user?.name || 'Utilisateur');
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.last_message?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (viewingArchived) return matchesSearch;
    if (filterTab === 'unread') return matchesSearch && conv.unread_count > 0;
    if (filterTab === 'groups') return matchesSearch && conv.type === 'group';
    return matchesSearch;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isToday(date)) return format(date, 'HH:mm', { locale: fr });
      if (isYesterday(date)) return 'Hier';
      return format(date, 'd MMM', { locale: fr });
<<<<<<< HEAD
    } catch (e) {
      return '';
    }
=======
    } catch { return ''; }
>>>>>>> import/master
  };

  const unreadCount = conversations.filter(c => c.unread_count > 0).length;

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full bg-white select-none">

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
=======
    <div className="flex flex-col h-full select-none">

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
>>>>>>> import/master
        {viewingArchived ? (
          <div className="flex items-center gap-2.5 mb-4">
            <button
              onClick={() => { setViewingArchived(false); setSearchTerm(''); }}
<<<<<<< HEAD
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className="text-sm font-semibold text-gray-800">Archives</h2>
=======
              className="p-1.5 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
              style={{ background: 'rgba(255,255,255,0.5)' }}
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className="text-sm font-bold text-gray-800">Archives</h2>
>>>>>>> import/master
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Messages</h2>
              {unreadCount > 0 && (
<<<<<<< HEAD
                <p className="text-xs text-gray-400 mt-0.5">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {invitations.length > 0 && (
                <div className="relative">
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {invitations.length}
                  </span>
                </div>
              )}
              <button
                onClick={onNewChat}
                title="Nouvelle conversation"
                className="w-8 h-8 bg-[#1428C9] text-white rounded-lg flex items-center justify-center hover:bg-[#1020A8] transition-colors shadow-sm"
              >
                <Plus size={16} />
              </button>
            </div>
=======
                <p className="text-xs text-[#1428C9]/70 mt-0.5 font-medium">
                  {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <motion.button
              onClick={onNewChat}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              title="Nouvelle conversation"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                boxShadow: '0 4px 12px rgba(20,40,201,0.35)',
              }}
            >
              <Plus size={16} className="text-white" />
            </motion.button>
>>>>>>> import/master
          </div>
        )}

        {/* Search */}
        <div className="relative">
<<<<<<< HEAD
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
=======
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
>>>>>>> import/master
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
<<<<<<< HEAD
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1428C9]/30 focus:bg-white transition-all"
=======
            className="w-full pl-9 pr-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
            }}
>>>>>>> import/master
          />
        </div>

        {/* Filter Tabs */}
        {!viewingArchived && (
<<<<<<< HEAD
          <div className="flex gap-1 mt-3">
=======
          <div className="flex gap-1 mt-3 p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.5)' }}
          >
>>>>>>> import/master
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'unread', label: 'Non lues', count: unreadCount },
              { id: 'groups', label: 'Groupes' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={clsx(
<<<<<<< HEAD
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filterTab === tab.id
                    ? 'bg-[#1428C9] text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={clsx(
                    'w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center leading-none',
                    filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  )}>
=======
                  'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  filterTab === tab.id ? 'text-[#1428C9] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
                style={filterTab === tab.id ? {
                  background: 'rgba(255,255,255,0.85)',
                  boxShadow: '0 1px 6px rgba(20,40,201,0.10)',
                } : {}}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center bg-red-500 text-white">
>>>>>>> import/master
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── List ── */}
<<<<<<< HEAD
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">

        {/* Invitations Section */}
        {!viewingArchived && invitations.length > 0 && (
          <div className="space-y-1">
            <div className="px-4 py-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                Invitations en attente
              </p>
            </div>
            {invitations.map((invitation) => {
              const inviterName = invitation.inviter?.prenom 
                ? `${invitation.inviter.prenom} ${invitation.inviter.nom || ''}` 
                : 'Utilisateur';
              const groupName = invitation.conversation?.name || 'Groupe';
              
              return (
                <div key={invitation.id} className="px-4 py-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <UserPlus size={16} />
=======
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/40">

        {/* Invitations + rejoin requests */}
        {!viewingArchived && (invitations.length > 0 || rejoinRequests.length > 0) && (
          <div className="space-y-1 mb-2">
            <div className="px-4 py-1.5">
              <p className="text-[10px] font-bold text-[#1428C9]/60 uppercase tracking-[0.15em]">
                Invitations Groupes
              </p>
            </div>

            {/* Regular invitations */}
            {invitations.map((inv) => {
              const inviterName = inv.inviter?.prenom
                ? `${inv.inviter.prenom} ${inv.inviter.nom || ''}`
                : 'Utilisateur';
              const groupName = inv.conversation?.name || 'Groupe';
              const isAccepting = acceptingId === inv.id;
              const isRejecting = rejectingId === inv.id;

              return (
                <div key={`inv-${inv.id}`} className="px-3">
                  <div className="rounded-2xl p-3"
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
                      >
                        <UserPlus size={15} className="text-white" />
>>>>>>> import/master
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{groupName}</p>
                        <p className="text-[10px] text-gray-500">Invité par {inviterName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
<<<<<<< HEAD
                        onClick={(e) => handleAccept(invitation.id, e)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                      >
                        <Check size={14} />
                        Accepter
                      </button>
                      <button
                        onClick={(e) => handleReject(invitation.id, e)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                        Refuser
=======
                        onClick={(e) => !isAccepting && !isRejecting && handleAccept(inv.id, e)}
                        disabled={isAccepting || isRejecting}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                        style={{ background: isAccepting ? 'rgba(34,197,94,0.7)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                      >
                        {isAccepting ? <><Spinner /> En cours...</> : <><Check size={13} /> Accepter</>}
                      </button>
                      <button
                        onClick={(e) => !isAccepting && !isRejecting && handleReject(inv.id, e)}
                        disabled={isAccepting || isRejecting}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                        style={{ background: isRejecting ? 'rgba(239,68,68,0.7)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                      >
                        {isRejecting ? <><Spinner /> En cours...</> : <><X size={13} /> Refuser</>}
>>>>>>> import/master
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
<<<<<<< HEAD
            <div className="mx-4 border-t border-gray-100 my-2" />
          </div>
        )}

        {/* Archives Entry */}
        {!viewingArchived && archivedConversations.length > 0 && (
          <button
            onClick={() => { setViewingArchived(true); setSearchTerm(''); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group mx-0"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
              <Archive size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Archives</p>
              <p className="text-xs text-gray-400 truncate">{archivedConversations.length} conversation{archivedConversations.length > 1 ? 's' : ''}</p>
            </div>
          </button>
        )}

        {/* Separator */}
        {!viewingArchived && archivedConversations.length > 0 && (
          <div className="mx-4 border-t border-gray-100 my-1" />
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-1 px-2 pt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-4/5" />
=======

            {/* Rejoin requests shown inside the same section */}
            {rejoinRequests.length > 0 && (
              <>
                {invitations.length > 0 && (
                  <div className="px-4 pt-2 pb-0.5">
                    <p className="text-[9px] font-bold text-orange-500/70 uppercase tracking-[0.15em]">Demandes de rejoindre</p>
                  </div>
                )}
                {rejoinRequests.map((req) => {
                  const isAccepting = acceptingId === `req-${req.id}`;
                  const isRejecting = rejectingId === `req-${req.id}`;
                  return (
                    <div key={`req-${req.id}`} className="px-3">
                      <div className="rounded-2xl p-3"
                        style={{
                          background: 'rgba(255,237,213,0.5)',
                          border: '1px solid rgba(251,146,60,0.25)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
                          >
                            <LogIn size={15} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{req.user_name}</p>
                            <p className="text-[10px] text-gray-500 truncate">
                              Veut rejoindre <span className="font-semibold">{req.conversation_name}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setAcceptingId(`req-${req.id}`);
                              await acceptRejoinRequest(req.id);
                              setAcceptingId(null);
                            }}
                            disabled={isAccepting || isRejecting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                            style={{ background: isAccepting ? 'rgba(34,197,94,0.7)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                          >
                            {isAccepting ? <><Spinner /> En cours...</> : <><Check size={13} /> Accepter</>}
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setRejectingId(`req-${req.id}`);
                              await rejectRejoinRequest(req.id);
                              setRejectingId(null);
                            }}
                            disabled={isAccepting || isRejecting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                            style={{ background: isRejecting ? 'rgba(239,68,68,0.7)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                          >
                            {isRejecting ? <><Spinner /> En cours...</> : <><X size={13} /> Refuser</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <div className="mx-4 my-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }} />
          </div>
        )}

        {/* Archives entry */}
        {!viewingArchived && archivedConversations.length > 0 && (
          <>
            <button
              onClick={() => { setViewingArchived(true); setSearchTerm(''); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/20"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}
              >
                <Archive size={15} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700">Archives</p>
                <p className="text-xs text-gray-400">{archivedConversations.length} conversation{archivedConversations.length > 1 ? 's' : ''}</p>
              </div>
            </button>
            <div className="mx-4 my-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }} />
          </>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-1 px-3 pt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 animate-pulse">
                <div className="w-10 h-10 rounded-full shrink-0 shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-full w-2/3 shimmer" />
                  <div className="h-2.5 rounded-full w-4/5 shimmer" />
>>>>>>> import/master
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const isActive = activeConversation?.id === conv.id;
<<<<<<< HEAD
            const name = conv.type === 'group' ? conv.name : conv.other_user?.name;
            const hasUnread = conv.unread_count > 0;
            
            // Filter out current user from typing indicator
            const currentTyping = (typingUsers[conv.id] || []).filter(u => u.id !== user?.id);
            const isTyping = currentTyping.length > 0;
            
            const hasAttachments = conv.last_message?.attachments?.length > 0;
            const isLastMessageImage = hasAttachments && conv.last_message.attachments.some(a => a.file_type?.startsWith('image/'));
            
            const lastMsg = isTyping 
              ? (conv.type === 'group' 
                  ? `${currentTyping[0].name} écrit...` 
                  : "En train d'écrire...")
              : (hasAttachments 
                  ? (isLastMessageImage ? "📷 Photo" : "📎 Fichier")
=======
            const isSelecting = selectingId === conv.id;
            const isArchivingThis = archivingId === conv.id;
            const name = conv.type === 'group' ? conv.name : conv.other_user?.name;
            const hasUnread = conv.unread_count > 0;
            const currentTyping = typingUsers[conv.id] || [];
            const isTypingConv = currentTyping.length > 0;
            const hasAttachments = conv.last_message?.attachments?.length > 0;
            const isLastMsgImage = hasAttachments && conv.last_message.attachments.some(a => a.file_type?.startsWith('image/'));
            const lastMsg = isTypingConv
              ? (conv.type === 'group' ? `${currentTyping[0].name} écrit...` : "En train d'écrire...")
              : (hasAttachments
                  ? (isLastMsgImage ? '📷 Photo' : '📎 Fichier')
>>>>>>> import/master
                  : (conv.last_message?.content || 'Démarrer la discussion'));

            return (
              <motion.div
                key={conv.id}
                layout
<<<<<<< HEAD
                role="button"
                tabIndex={0}
                onClick={() => {
                  setActiveConversation(conv);
                  markConversationAsRead(conv.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveConversation(conv);
                    markConversationAsRead(conv.id);
                  }
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left relative group cursor-pointer focus:outline-none focus:bg-gray-50/80',
                  isActive
                    ? 'bg-blue-50/70'
                    : 'hover:bg-gray-50'
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#1428C9] rounded-r-full" />
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full shrink-0">
                    {/* Avatar supprimé mais espace conservé */}
                  </div>
                  {conv.other_user?.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
=======
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(20,40,201,0.08)" }}
                whileTap={{ scale: 0.99 }}
                role="button"
                tabIndex={0}
                onClick={() => !isSelecting && handleSelectConversation(conv)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isSelecting) {
                    e.preventDefault();
                    handleSelectConversation(conv);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-150 text-left relative group cursor-pointer focus:outline-none rounded-2xl"
                style={isActive ? {
                  background: 'rgba(255,255,255,0.75)',
                  boxShadow: '0 2px 16px rgba(20,40,201,0.12)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(8px)',
                  margin: '2px 8px',
                  width: 'calc(100% - 16px)',
                } : {
                  margin: '2px 8px',
                  width: 'calc(100% - 16px)',
                }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={isActive ? {
                      background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(20,40,201,0.35)',
                    } : {
                      background: 'rgba(255,255,255,0.65)',
                      color: '#374151',
                      border: '1px solid rgba(255,255,255,0.8)',
                    }}
                  >
                    {isSelecting
                      ? <Loader2 size={16} className="animate-spin" style={{ color: isActive ? 'white' : '#1428C9' }} />
                      : conv.type === 'group' ? <Users size={16} /> : getInitials(name)
                    }
                  </div>
                  {conv.other_user?.online && !isSelecting && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
>>>>>>> import/master
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
<<<<<<< HEAD
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={clsx(
                        'text-sm truncate',
                        hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800',
                        isActive && 'text-[#1428C9]'
                      )}>
                        {name}
                      </span>
                      {conv.user_status !== 'active' && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                          {conv.user_status === 'left' ? 'Quitté' : (conv.user_status === 'group_deleted' ? 'Supprimé' : 'Retiré')}
                        </span>
                      )}
                    </div>
=======
                    <span className={clsx(
                      'text-sm truncate',
                      hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700',
                      isActive && 'text-[#1428C9]',
                      isSelecting && 'text-[#1428C9]/70'
                    )}>
                      {name}
                    </span>
>>>>>>> import/master
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {formatDateTime(conv.last_message?.created_at || conv.last_message_at || conv.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
<<<<<<< HEAD
                    {isTyping ? (
                      <div className="flex items-center gap-1.5 text-green-500 italic font-medium">
                        <span className="text-xs truncate">{lastMsg}</span>
                        <div className="flex gap-0.5 items-center">
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-1 h-1 bg-green-500 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1 h-1 bg-green-500 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1 h-1 bg-green-500 rounded-full"
                          />
=======
                    {isTypingConv ? (
                      <div className="flex items-center gap-1.5 text-green-500 italic">
                        <span className="text-xs truncate">{lastMsg}</span>
                        <div className="flex gap-0.5 items-center">
                          {[0, 0.2, 0.4].map((delay, i) => (
                            <motion.span key={i}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1, delay }}
                              className="w-1 h-1 bg-green-500 rounded-full"
                            />
                          ))}
>>>>>>> import/master
                        </div>
                      </div>
                    ) : (
                      <p className={clsx(
                        'text-xs truncate',
                        hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'
                      )}>
                        {lastMsg}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
<<<<<<< HEAD
                      {/* Unread Badge */}
                      {hasUnread && (
                        <span className="w-5 h-5 bg-[#1428C9] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                      {/* Archive on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewingArchived ? unarchiveConversation(conv.id) : archiveConversation(conv.id);
                        }}
                        title={viewingArchived ? 'Désarchiver' : 'Archiver'}
                        className="p-1 text-gray-300 hover:text-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100"
                      >
                        <Archive size={13} className={viewingArchived ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  </div>
=======
                      {hasUnread && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                          style={{ background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)' }}
                        >
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                      {/* Archive button */}
                      <button
                        onClick={(e) => !isArchivingThis && handleArchiveToggle(e, conv.id, viewingArchived)}
                        disabled={isArchivingThis}
                        title={viewingArchived ? 'Désarchiver' : 'Archiver'}
                        className="p-1 rounded-lg text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/50 disabled:opacity-40"
                      >
                        {isArchivingThis
                          ? <Loader2 size={12} className="animate-spin text-[#1428C9]" />
                          : <Archive size={12} className={viewingArchived ? 'rotate-180' : ''} />
                        }
                      </button>
                    </div>
                  </div>

                  {/* ── Rejoin banner for groups the user has left ── */}
                  {conv.type === 'group' && conv.user_status === 'left' && (
                    <div className="mt-1.5 flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="text-[10px] text-red-500 font-semibold truncate">Vous avez quitté ce groupe</span>
                      {rejoinPending[conv.id] === 'sent' ? (
                        <span className="text-[10px] text-green-600 font-bold shrink-0 flex items-center gap-1">
                          <Check size={10} /> Demande envoyée
                        </span>
                      ) : (
                        <button
                          onClick={(e) => rejoinPending[conv.id] !== 'sending' && handleSendRejoinRequest(e, conv.id)}
                          disabled={rejoinPending[conv.id] === 'sending'}
                          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95 disabled:opacity-60"
                          style={{ background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)' }}
                        >
                          {rejoinPending[conv.id] === 'sending'
                            ? <Loader2 size={10} className="animate-spin" />
                            : <LogIn size={10} />
                          }
                          Demander à rejoindre
                        </button>
                      )}
                    </div>
                  )}
>>>>>>> import/master
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
<<<<<<< HEAD
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
              <MessageSquare size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">
              {viewingArchived ? 'Aucune archive' : 'Aucune conversation'}
            </p>
            {!viewingArchived && (
              <p className="text-xs text-gray-300 mt-1">Commencez par créer une conversation</p>
=======
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}
            >
              <MessageSquare size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {viewingArchived ? 'Aucune archive' : 'Aucune conversation'}
            </p>
            {!viewingArchived && (
              <p className="text-xs text-gray-400 mt-1">Commencez par créer une conversation</p>
>>>>>>> import/master
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
