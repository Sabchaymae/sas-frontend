import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Loader2, Check, Users, MessageSquare } from 'lucide-react';
import { userService } from '../../../services/userService';
import communicationService from '../../../services/communicationService';
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

  const existingPrivateUserIds = conversations
    .filter(c => c.type === 'private' && c.other_user)
    .map(c => c.other_user.id);

  const filteredUsers = users.filter(u =>
    u.id !== currentUser?.id &&
    (mode === 'group' ? true : !existingPrivateUserIds.includes(u.id)) &&
    ((u.name || u.full_name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleUser = (u) =>
    setSelectedUsers(prev =>
      prev.find(x => x.id === u.id) ? prev.filter(x => x.id !== u.id) : [...prev, u]
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
            <div>
              <h3 className="text-base font-bold text-gray-900">Nouvelle conversation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sélectionnez vos collaborateurs</p>
            </div>
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
              </button>
            </div>
          </div>

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
          <div className="flex-1 overflow-y-auto px-3 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-2.5 bg-gray-100 rounded-full w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-0.5">
                {filteredUsers.map(u => {
                  const isSelected = !!selectedUsers.find(x => x.id === u.id);
                  return (
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
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3"><Search size={22} className="text-gray-200" /></div>
                <p className="text-sm font-medium text-gray-400">Aucun résultat</p>
                <p className="text-xs text-gray-300 mt-1">Essayez un autre terme de recherche</p>
              </div>
            )}
          </div>

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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewConversationModal;
