import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Loader2, Check, Users, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { userService } from '../../../services/userService';
import useAuth from '../../../hooks/useAuth';
import useChatStore from '../../../store/useChatStore';

const NewConversationModal = ({ isOpen, onClose, onSelectUser }) => {
  const { user: currentUser } = useAuth();
  const { conversations } = useChatStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState('direct'); // 'direct' | 'group'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      userService.getUsers({ all: true })
        .then(r => setUsers(r.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
      setSelectedUsers([]);
      setGroupName('');
      setMode('direct');
      setSearchTerm('');
    }
  }, [isOpen]);

  const existingPrivateUserIds = conversations
    .filter(c => c.type === 'private' && c.other_user)
    .map(c => c.other_user.id);

  const filteredUsers = users.filter(u =>
    u.id !== currentUser?.id &&
    (mode === 'group' ? true : !existingPrivateUserIds.includes(u.id)) &&
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleUser = (u) =>
    setSelectedUsers(prev =>
      prev.find(x => x.id === u.id)
        ? prev.filter(x => x.id !== u.id)
        : [...prev, u]
    );

  const handleSelect = async (u) => {
    if (mode === 'group') { toggleUser(u); return; }
    setCreating(true);
    try {
      await onSelectUser({ type: 'private', user_ids: [u.id] });
      onClose();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !selectedUsers.length) return;
    setCreating(true);
    try {
      await onSelectUser({ type: 'group', name: groupName, user_ids: selectedUsers.map(u => u.id) });
      onClose();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  if (!isOpen) return null;

  const canCreate = mode === 'group' && groupName.trim() && selectedUsers.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md flex flex-col overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 24px 64px rgba(20,40,201,0.18), 0 4px 24px rgba(0,0,0,0.08)',
            maxHeight: '85vh',
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(20,40,201,0.08)' }}
          >
            <div>
              <h3 className="text-base font-bold text-gray-900">Nouvelle conversation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sélectionnez vos collaborateurs</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl transition-all"
              style={{ background: 'rgba(0,0,0,0.04)' }}
            >
              <X size={17} />
            </button>
          </div>

          {/* ── Mode Tabs ── */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex gap-1.5 p-1 rounded-xl"
              style={{ background: 'rgba(20,40,201,0.05)', border: '1px solid rgba(20,40,201,0.08)' }}
            >
              <button
                onClick={() => { setMode('direct'); setSelectedUsers([]); setSearchTerm(''); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
                style={mode === 'direct' ? {
                  background: 'white',
                  color: '#1428C9',
                  boxShadow: '0 2px 8px rgba(20,40,201,0.12)',
                } : { color: '#6b7280' }}
              >
                <MessageSquare size={14} />
                Direct
              </button>
              <button
                onClick={() => { setMode('group'); setSelectedUsers([]); setSearchTerm(''); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
                style={mode === 'group' ? {
                  background: 'white',
                  color: '#1428C9',
                  boxShadow: '0 2px 8px rgba(20,40,201,0.12)',
                } : { color: '#6b7280' }}
              >
                <Users size={14} />
                Groupe
              </button>
            </div>
          </div>

          {/* ── Group Name (mode groupe seulement) ── */}
          {mode === 'group' && (
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder="Nom du groupe..."
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="w-full py-2.5 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none rounded-xl transition-all"
                style={{
                  background: 'rgba(20,40,201,0.04)',
                  border: groupName.trim() ? '1.5px solid rgba(20,40,201,0.3)' : '1.5px solid rgba(20,40,201,0.12)',
                }}
              />
              {!groupName.trim() && (
                <p className="text-orange-500 text-[11px] mt-1.5 ml-1">Requis pour créer le groupe</p>
              )}
            </div>
          )}

          {/* ── Search ── */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Rechercher un collègue..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none rounded-xl transition-all"
                style={{
                  background: 'rgba(0,0,0,0.04)',
                  border: '1.5px solid rgba(0,0,0,0.07)',
                }}
              />
            </div>
          </div>

          {/* ── Selected Users Chips (mode groupe) ── */}
          {mode === 'group' && selectedUsers.length > 0 && (
            <div className="px-5 pb-3">
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl"
                style={{ background: 'rgba(20,40,201,0.04)', border: '1px solid rgba(20,40,201,0.1)' }}
              >
                <p className="w-full text-[10px] font-bold text-[#1428C9]/60 uppercase tracking-wider mb-1">
                  Sélectionnés ({selectedUsers.length})
                </p>
                {selectedUsers.map(u => (
                  <span
                    key={u.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, rgba(20,40,201,0.12) 0%, rgba(79,110,247,0.12) 100%)',
                      border: '1px solid rgba(20,40,201,0.2)',
                      color: '#1428C9',
                    }}
                  >
                    {u.name}
                    <button
                      onClick={() => toggleUser(u)}
                      className="hover:opacity-70 transition-opacity rounded-full"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── User List ── */}
          <div className="flex-1 overflow-y-auto px-3 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 shimmer rounded-full w-1/2" />
                      <div className="h-2.5 shimmer rounded-full w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-0.5">
                {filteredUsers.map(u => {
                  const isSelected = !!selectedUsers.find(x => x.id === u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelect(u)}
                      disabled={creating}
                      className={clsx(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group',
                        isSelected ? 'bg-blue-50/80' : 'hover:bg-gray-50/80'
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all"
                        style={isSelected ? {
                          background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(20,40,201,0.3)',
                        } : {
                          background: 'rgba(0,0,0,0.06)',
                          color: '#374151',
                        }}
                      >
                        {isSelected ? <Check size={15} /> : (u.name ? u.name.charAt(0).toUpperCase() : 'U')}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'text-sm font-semibold truncate',
                          isSelected ? 'text-[#1428C9]' : 'text-gray-800'
                        )}>
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>

                      {/* Checkbox (groupe) / Arrow (direct) */}
                      {mode === 'group' ? (
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                          style={isSelected ? {
                            background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                            border: '2px solid #1428C9',
                          } : {
                            background: 'transparent',
                            border: '2px solid #d1d5db',
                          }}
                        >
                          {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                        </div>
                      ) : (
                        <UserPlus
                          size={15}
                          className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <Search size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">Aucun résultat</p>
                <p className="text-xs text-gray-300 mt-1">Essayez un autre terme de recherche</p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(20,40,201,0.08)' }}>
            {mode === 'group' ? (
              <button
                disabled={!canCreate || creating}
                onClick={handleCreateGroup}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={canCreate ? {
                  background: 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
                  boxShadow: '0 4px 16px rgba(20,40,201,0.35)',
                } : {
                  background: 'rgba(20,40,201,0.15)',
                }}
              >
                {creating
                  ? <><Loader2 size={16} className="animate-spin" />Création en cours...</>
                  : <><Users size={16} />Créer le groupe{selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}</>
                }
              </button>
            ) : (
              <p className="text-xs text-gray-400 text-center">
                Sélectionnez une personne pour démarrer une conversation directe
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewConversationModal;
