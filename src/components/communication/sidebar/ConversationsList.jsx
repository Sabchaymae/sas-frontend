import React, { useState, useEffect } from 'react';
import { Search, Plus, Archive, ArrowLeft, MessageSquare, Check, X, UserPlus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import useChatStore from '../../../store/useChatStore';
import useInvitationStore from '../../../store/useInvitationStore';

const ConversationsList = ({ onNewChat }) => {
  const {
    conversations,
    archivedConversations,
    activeConversation,
    setActiveConversation,
    loading,
    markConversationAsRead,
    archiveConversation,
    unarchiveConversation,
    typingUsers
  } = useChatStore();

  const {
    invitations,
    fetchInvitations,
    acceptInvitation,
    rejectInvitation
  } = useInvitationStore();

  const [filterTab, setFilterTab] = useState('all');
  const [viewingArchived, setViewingArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    } catch (e) {
      return '';
    }
  };

  const unreadCount = conversations.filter(c => c.unread_count > 0).length;

  return (
    <div className="flex flex-col h-full bg-white select-none">

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        {viewingArchived ? (
          <div className="flex items-center gap-2.5 mb-4">
            <button
              onClick={() => { setViewingArchived(false); setSearchTerm(''); }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className="text-sm font-semibold text-gray-800">Archives</h2>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Messages</h2>
              {unreadCount > 0 && (
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
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1428C9]/30 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Tabs */}
        {!viewingArchived && (
          <div className="flex gap-1 mt-3">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'unread', label: 'Non lues', count: unreadCount },
              { id: 'groups', label: 'Groupes' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={clsx(
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
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── List ── */}
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
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{groupName}</p>
                        <p className="text-[10px] text-gray-500">Invité par {inviterName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
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
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const isActive = activeConversation?.id === conv.id;
            const name = conv.type === 'group' ? conv.name : conv.other_user?.name;
            const hasUnread = conv.unread_count > 0;
            
            // Filter out current user from typing indicator
            const currentTyping = (typingUsers[conv.id] || []);
            const isTyping = currentTyping.length > 0;
            
            const hasAttachments = conv.last_message?.attachments?.length > 0;
            const isLastMessageImage = hasAttachments && conv.last_message.attachments.some(a => a.file_type?.startsWith('image/'));
            
            const lastMsg = isTyping 
              ? (conv.type === 'group' 
                  ? `${currentTyping[0].name} écrit...` 
                  : "En train d'écrire...")
              : (hasAttachments 
                  ? (isLastMessageImage ? "📷 Photo" : "📎 Fichier")
                  : (conv.last_message?.content || 'Démarrer la discussion'));

            return (
              <motion.div
                key={conv.id}
                layout
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
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
                    isActive
                      ? 'bg-[#1428C9] text-white'
                      : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'
                  )}>
                    {conv.type === 'group' ? <Users size={16} /> : getInitials(name)}
                  </div>
                  {conv.other_user?.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
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
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {formatDateTime(conv.last_message?.created_at || conv.last_message_at || conv.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
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
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
              <MessageSquare size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">
              {viewingArchived ? 'Aucune archive' : 'Aucune conversation'}
            </p>
            {!viewingArchived && (
              <p className="text-xs text-gray-300 mt-1">Commencez par créer une conversation</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
