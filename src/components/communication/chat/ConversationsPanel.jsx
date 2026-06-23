import React, { useState, useMemo } from 'react';
import { Search, Plus, MessageSquare, Users, Hash, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

const ConversationsPanel = ({ conversations, archivedConversations = [], selectedId, onSelect, loading, refresh, onNewChat, onUnarchive }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const listToFilter = activeTab === 'archived' ? archivedConversations : conversations;

  const filteredConversations = useMemo(() => {
    return listToFilter.filter(conv => {
      const name = conv.type === 'group' ? conv.name : (conv.other_user?.name || 'Utilisateur inconnu');
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeTab === 'direct') return matchesSearch && conv.type === 'private';
      if (activeTab === 'groups') return matchesSearch && conv.type === 'group';
      return matchesSearch;
    });
  }, [listToFilter, searchTerm, activeTab]);

  const getInitials = (conv) => {
    const name = conv.type === 'group' ? conv.name : conv.other_user?.name || 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const tabs = [
    { key: 'all', label: 'Tous' },
    { key: 'direct', label: 'Directs' },
    { key: 'groups', label: 'Groupes' },
    { key: 'archived', label: 'Archivés' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-5 border-b border-slate-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black text-[#111827] uppercase tracking-[0.15em]">Messages</h2>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1428C9]" />
          </div>
          <button
            onClick={onNewChat}
            className="group flex items-center gap-2 px-3 py-1.5 bg-[#1428C9] text-white rounded-sm hover:bg-[#1428C9]/90 active:scale-95 transition-all duration-300 shadow-lg shadow-[#1428C9]/20"
            title="Nouvelle conversation"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Nouveau</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1428C9] transition-colors" size={14} />
          <input
            type="text"
            placeholder="Rechercher une discussion..."
            className="w-full bg-[#F9FAFB] border border-slate-100 rounded-sm py-2.5 pl-9 pr-3 text-xs text-[#111827] focus:outline-none focus:border-[#1428C9]/30 focus:ring-4 focus:ring-[#1428C9]/5 transition-all placeholder:text-gray-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-[#F9FAFB] border border-slate-100 rounded-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-1.5 text-[9px] font-black rounded-sm transition-all uppercase tracking-[0.1em] ${
                activeTab === tab.key
                  ? 'bg-white text-[#1428C9] shadow-sm border border-slate-100'
                  : 'text-gray-400 hover:text-[#111827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-sm shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 bg-slate-50 rounded-full shimmer w-1/2" />
                  <div className="h-2 bg-slate-50 rounded-full shimmer w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="py-2">
            {filteredConversations.map((conv) => {
              const isActive = selectedId === conv.id;
              const name = conv.type === 'group' ? conv.name : conv.other_user?.name;
              const initials = getInitials(conv);
              const lastMsg = conv.last_message?.content || 'Débuter la conversation...';
              const time = conv.last_message_at
                ? new Date(conv.last_message_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-300 relative group ${
                    isActive
                      ? 'bg-[#1428C9]/5'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Indicator for Active */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[#1428C9]" 
                    />
                  )}

                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-sm flex-shrink-0 flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#1428C9] text-white shadow-lg shadow-[#1428C9]/30' 
                      : 'bg-[#1428C9]/5 text-[#1428C9] border border-[#1428C9]/10 group-hover:bg-[#1428C9] group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-[#1428C9]/20'
                  }`}>
                    {conv.type === 'group' ? <Users size={16} /> : initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[13px] font-bold truncate transition-colors ${isActive ? 'text-[#111827]' : 'text-[#111827]'}`}>
                        {name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight ml-2">{time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[11px] truncate flex-1 transition-colors ${isActive ? 'text-[#1428C9] font-semibold' : 'text-gray-400 font-medium'}`}>
                        {lastMsg}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#1428C9] text-white text-[9px] font-black rounded-sm flex items-center justify-center px-1.5 shadow-sm">
                          {conv.unread_count}
                        </span>
                      )}
                      {activeTab === 'archived' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnarchive(conv.id);
                          }}
                          className="flex-shrink-0 p-1.5 bg-[#1428C9]/10 text-[#1428C9] rounded-sm hover:bg-[#1428C9] hover:text-white transition-all"
                          title="Désarchiver"
                        >
                          <Archive size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 px-10 text-center">
            <div className="w-16 h-16 bg-[#F9FAFB] rounded-full flex items-center justify-center mb-4 border border-slate-50">
              <MessageSquare size={24} className="text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-[#111827] mb-1">Aucune discussion</h3>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
              Utilisez le bouton nouveau pour démarrer une conversation professionnelle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPanel;
