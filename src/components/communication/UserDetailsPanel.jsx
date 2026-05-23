import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Users, UserPlus, Loader2, Check, Search, Archive, Ban, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const Section = ({ title, children }) => (
  <div className="py-4 border-b border-gray-50 last:border-0">
    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-5">{title}</h4>
    {children}
  </div>
);

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
  onDeleteGroup
}) => {
  const { user } = useAuth();
  const otherUser = conversation.other_user;
  const isGroup = conversation.type === 'group';
  const name = isGroup ? conversation.name : otherUser?.name;
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
  const currentUserParticipant = isGroup ? conversation.participants?.find(p => p.id === user?.id) : null;
  const isCurrentUserAdmin = isGroup && currentUserParticipant?.pivot?.role === 'admin';

  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToInvite, setSelectedToInvite] = useState([]);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isCurrentUserAdmin && showInviteSection) {
      setLoadingUsers(true);
      userService.getUsers({ all: true })
        .then(r => setAllUsers(r.data || []))
        .catch(console.error)
        .finally(() => setLoadingUsers(false));
    }
  }, [isCurrentUserAdmin, showInviteSection]);

  const handleInvite = async () => {
    if (!selectedToInvite.length) return;
    setInviting(true);
    try {
      await onInviteGroupMembers(conversation.id, selectedToInvite);
      setSelectedToInvite([]);
      setShowInviteSection(false);
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
          <X size={16} />
        </button>
      </div>

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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            </div>
          </Section>
        )}

        {/* Contact Info */}
        {!isGroup && (
          <Section title="Coordonnées">
            <div className="px-5 space-y-1">
              {[{ icon: Mail, label: 'Email', value: otherUser?.email || 'N/A' }, { icon: Phone, label: 'Téléphone', value: otherUser?.phone || 'N/A' }].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0"><Icon size={15} /></div>
                  <div className="min-w-0"><p className="text-[10px] text-gray-400 mb-0.5">{label}</p><p className="text-sm font-medium text-gray-800 truncate">{value}</p></div>
                </div>
              ))}
            </div>
          </Section>
        )}

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
                )}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default UserDetailsPanel;
