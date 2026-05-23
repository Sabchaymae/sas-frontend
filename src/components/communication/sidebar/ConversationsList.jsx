import React, { useState } from 'react';
import { Search, Plus, Archive, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import useChatStore from '../../../store/useChatStore';

const ConversationsList = ({ onNewChat }) => {
  const {
    conversations,
    archivedConversations,
    activeConversation,
    setActiveConversation,
    loading,
    markConversationAsRead,
    archiveConversation,
    unarchiveConversation
  } = useChatStore();

  const [filterTab, setFilterTab] = useState('all');
  const [viewingArchived, setViewingArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
            <button
              onClick={onNewChat}
              title="Nouvelle conversation"
              className="w-8 h-8 bg-[#1428C9] text-white rounded-lg flex items-center justify-center hover:bg-[#1020A8] transition-colors shadow-sm"
            >
              <Plus size={16} />
            </button>
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
            const lastMsg = conv.last_message?.content || 'Démarrer la discussion';
            const hasUnread = conv.unread_count > 0;

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
                    {getInitials(name)}
                  </div>
                  {conv.other_user?.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={clsx(
                      'text-sm truncate',
                      hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800',
                      isActive && 'text-[#1428C9]'
                    )}>
                      {name}
                    </span>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {formatDateTime(conv.last_message?.created_at || conv.last_message_at || conv.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={clsx(
                      'text-xs truncate',
                      hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'
                    )}>
                      {lastMsg}
                    </p>

                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      {/* Unread Badge */}
                      {hasUnread && (
                        <span className="w-5 h-5 bg-[#1428C9] text-white text-[10px] font-bold rounded-full flex items-center justify-center group-hover:scale-0 transition-transform origin-center">
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
