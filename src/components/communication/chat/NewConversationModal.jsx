import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Loader2, Check, Users, MessageSquare } from 'lucide-react';
<<<<<<< HEAD
import { userService } from '../../../services/userService';
import communicationService from '../../../services/communicationService';
=======
import clsx from 'clsx';
import { userService } from '../../../services/userService';
>>>>>>> import/master
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
<<<<<<< HEAD
      // Utiliser un debounce ou une recherche réelle si nécessaire
      const fetchUsers = async () => {
        try {
          // On essaie d'abord via le service communication (recherche sémantique/nom/email)
          const response = await communicationService.searchUsers(searchTerm);
          setUsers(response || []);
        } catch (e) {
          console.error('Failed to search users via communication service, falling back to user service', e);
          // Fallback sur le service utilisateur global
          const r = await userService.getUsers({ all: true, search: searchTerm });
          setUsers(r.data || []);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
      setSelectedUsers([]);
      setGroupName('');
      setMode('direct');
    }
  }, [isOpen, searchTerm]);
=======
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
>>>>>>> import/master

  const existingPrivateUserIds = conversations
    .filter(c => c.type === 'private' && c.other_user)
    .map(c => c.other_user.id);

  const filteredUsers = users.filter(u =>
    u.id !== currentUser?.id &&
    (mode === 'group' ? true : !existingPrivateUserIds.includes(u.id)) &&
<<<<<<< HEAD
    ((u.name || u.full_name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
=======
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
>>>>>>> import/master
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleUser = (u) =>
    setSelectedUsers(prev =>
<<<<<<< HEAD
      prev.find(x => x.id === u.id) ? prev.filter(x => x.id !== u.id) : [...prev, u]
=======
      prev.find(x => x.id === u.id)
        ? prev.filter(x => x.id !== u.id)
        : [...prev, u]
>>>>>>> import/master
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

<<<<<<< HEAD
  const canCreate = mode === 'group' ? groupName.trim() && selectedUsers.length > 0 : false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <motion.div initial={{ scale: 0.96, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 16 }} transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '82vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
=======
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
>>>>>>> import/master
            <div>
              <h3 className="text-base font-bold text-gray-900">Nouvelle conversation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sélectionnez vos collaborateurs</p>
            </div>
<<<<<<< HEAD
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
              <button onClick={() => { setMode('direct'); setSelectedUsers([]); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'direct' ? 'bg-white text-[#1428C9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <MessageSquare size={15} />Direct
              </button>
              <button onClick={() => { setMode('group'); setSelectedUsers([]); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'group' ? 'bg-white text-[#1428C9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Users size={15} />Groupe
=======
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
>>>>>>> import/master
              </button>
            </div>
          </div>

<<<<<<< HEAD
          {/* Group Name Input */}
          <AnimatePresence>
            {mode === 'group' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-3">
                <input type="text" placeholder="Nom du groupe..." value={groupName} onChange={e => setGroupName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1428C9]/40 focus:ring-2 focus:ring-[#1428C9]/8 transition-all" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type="text" placeholder="Rechercher un collègue..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1428C9]/30 focus:bg-white transition-all" />
            </div>
          </div>

          {/* Selected Users Chips (group mode) */}
          <AnimatePresence>
            {mode === 'group' && selectedUsers.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 px-5 pb-3">
                  {selectedUsers.map(u => (
                    <span key={u.id} className="flex items-center gap-1.5 bg-blue-50 text-[#1428C9] px-2.5 py-1 rounded-full text-xs font-medium">
                      {u.name}
                      <button onClick={() => toggleUser(u)} className="hover:text-blue-800 transition-colors"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User List */}
=======
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
>>>>>>> import/master
          <div className="flex-1 overflow-y-auto px-3 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
<<<<<<< HEAD
                    <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-2.5 bg-gray-100 rounded-full w-3/4" />
=======
                    <div className="w-9 h-9 rounded-full shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 shimmer rounded-full w-1/2" />
                      <div className="h-2.5 shimmer rounded-full w-3/4" />
>>>>>>> import/master
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-0.5">
                {filteredUsers.map(u => {
                  const isSelected = !!selectedUsers.find(x => x.id === u.id);
                  return (
<<<<<<< HEAD
                    <button key={u.id} onClick={() => handleSelect(u)} disabled={creating}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all ${isSelected ? 'bg-[#1428C9] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                        {isSelected ? <Check size={15} /> : (u.name ? u.name.charAt(0).toUpperCase() : 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-colors ${isSelected ? 'text-[#1428C9]' : 'text-gray-800'}`}>
                          {u.name || u.full_name || `${u.prenom} ${u.nom}`}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      {mode === 'group' && (
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-[#1428C9] border-[#1428C9]' : 'border-gray-300 group-hover:border-[#1428C9]'}`}>
                          {isSelected && <Check size={9} className="text-white" />}
                        </div>
                      )}
                      {mode === 'direct' && !creating && (
                        <UserPlus size={15} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
=======
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
>>>>>>> import/master
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
<<<<<<< HEAD
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3"><Search size={22} className="text-gray-200" /></div>
                <p className="text-sm font-medium text-gray-400">Aucun résultat</p>
=======
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <Search size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">Aucun résultat</p>
>>>>>>> import/master
                <p className="text-xs text-gray-300 mt-1">Essayez un autre terme de recherche</p>
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Footer — only for group creation */}
          {mode === 'group' && (
            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <button disabled={!canCreate || creating} onClick={handleCreateGroup}
                className="w-full bg-[#1428C9] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#1020A8] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#1428C9]/20">
                {creating ? <><Loader2 size={16} className="animate-spin" />Création...</> : <><UserPlus size={16} />Créer le groupe ({selectedUsers.length})</>}
              </button>
            </div>
          )}
          {mode === 'direct' && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">Sélectionnez une personne pour démarrer</p>
            </div>
          )}
=======
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
>>>>>>> import/master
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewConversationModal;
