import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Bell, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import CommunicationLayout from '../../components/communication/layout/CommunicationLayout';
import ConversationsList from '../../components/communication/sidebar/ConversationsList';
import ChatArea from '../../components/communication/chat/ChatArea';
import NewConversationModal from '../../components/communication/chat/NewConversationModal';
import UserDetailsPanel from '../../components/communication/chat/UserDetailsPanel';
import AnnouncementsTab from '../../components/communication/announcements/AnnouncementsTab';
import useChatStore from '../../store/useChatStore';

const TABS = [
  { id: 'chat',          label: 'Messagerie',  icon: MessageSquare },
  { id: 'announcements', label: 'Publications', icon: Bell          },
];

const CommunicationPage = () => {
  const {
    fetchConversations,
    activeConversation,
    archivedConversations,
    createConversation,
    deleteConversation,
    archiveConversation,
    unarchiveConversation,
    blockUser,
    unblockUser,
    leaveGroup,
    addGroupMembers,
    removeGroupMember,
    deleteGroup,
  } = useChatStore();

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab]   = useState(() => searchParams.get('tab') === 'announcements' ? 'announcements' : 'chat');
  const [highlightId, setHighlightId] = useState(() => searchParams.get('id') ? Number(searchParams.get('id')) : null);
  const [showDetails, setShowDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React to URL param changes (e.g. when navigating from the notification bell)
  useEffect(() => {
    const tab = searchParams.get('tab');
    const id  = searchParams.get('id');
    if (tab === 'announcements') setActiveTab('announcements');
    setHighlightId(id ? Number(id) : null);
  }, [searchParams]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const handleSelectUser = useCallback(async (data) => {
    try {
      await createConversation(data);
      setActiveTab('chat');
    } catch (error) {
      console.error('Failed to create conversation', error);
    }
  }, [createConversation]);

  return (
    <div className="w-full h-full animate-in fade-in duration-700">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        <motion.div
          initial={{ y: -50, x: -50, opacity: 0.1 }}
          animate={{ y: 50, x: 50, opacity: 0.2 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, #1428C9 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ y: 50, x: 50, opacity: 0.1 }}
          animate={{ y: -50, x: -50, opacity: 0.15 }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)]">

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 shrink-0">
          {TABS.map(tab => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02, boxShadow: "0 4px 16px rgba(20,40,201,0.15)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all relative"
              style={activeTab === tab.id ? {
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                color: '#1428C9',
                boxShadow: '0 -2px 12px rgba(20,40,201,0.08)',
                border: '1px solid rgba(255,255,255,0.9)',
                borderBottom: '1px solid rgba(255,255,255,0)',
              } : {
                background: 'transparent', // Fond transparent pour les onglets inactifs
                color: '#6b7280',
                border: '1px solid transparent', // Bordure transparente
              }}
            >
              <tab.icon size={15} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#1428C9' }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden"
          style={{
            background: '#f5f5f5', // Fond gris clair pour le conteneur principal
            // backdropFilter: 'none', // Supprimé
            // border: 'none', // Supprimé
            // boxShadow: 'none', // Supprimé
          }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.div key="chat"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}
                className="h-full"
              >
                <CommunicationLayout
                  sidebar={<ConversationsList onNewChat={() => setIsModalOpen(true)} />}
                  details={
                    activeConversation ? (
                      <UserDetailsPanel
                        conversation={activeConversation}
                        isArchived={(archivedConversations || []).some(c => c.id === activeConversation.id)}
                        onClose={() => setShowDetails(false)}
                        onDelete={async (id) => { await deleteConversation(id); setShowDetails(false); }}
                        onArchive={async (id) => { await archiveConversation(id); setShowDetails(false); }}
                        onUnarchive={async (id) => { await unarchiveConversation(id); setShowDetails(false); }}
                        onBlock={async (userId) => { await blockUser(userId); }}
                        onUnblock={async (userId) => { await unblockUser(userId); }}
                        onLeaveGroup={async (id) => { await leaveGroup(id); setShowDetails(false); }}
                        onInviteGroupMembers={async (id, userIds) => {
                          console.debug('Inviting group members', { conversationId: id, userIds });
                          const { useActionToastStore } = await import('../../components/common/ActionToast');

                          const sanitized = (userIds || []).map(x => Number(x)).filter(n => Number.isInteger(n) && n > 0);
                          if (!sanitized.length) {
                            useActionToastStore.getState().showActionToast({ message: 'Aucun membre valide sélectionné', type: 'error' });
                            return;
                          }
                          if (sanitized.length !== (userIds || []).length) {
                            useActionToastStore.getState().showActionToast({ message: 'Certains identifiants étaient invalides et ont été ignorés', type: 'error' });
                          }

                          const { communicationService } = await import('../../services/communicationService');
                          try {
                            await communicationService.inviteGroupMembers(id, sanitized);
                            useActionToastStore.getState().showActionToast({ message: 'Invitations envoyées', type: 'success' });
                          } catch (e) {
                            console.error('InviteGroupMembers failed', e);
                            try { console.error('Invite response data', e.data); } catch(_){}
                            // If backend returned validation errors, show them
                            if (e && e.data && e.data.message) {
                              useActionToastStore.getState().showActionToast({ message: e.data.message, type: 'error' });
                            }
                            throw e;
                          }
                        }}
                        onRemoveGroupMember={async (id, userId) => { await removeGroupMember(id, userId); }}
                        onDeleteGroup={async (id) => { await deleteGroup(id); setShowDetails(false); }}
                      />
                    ) : (
                      <div className="p-6 text-center text-gray-400 font-bold text-xs uppercase">
                        Aucune conversation sélectionnée
                      </div>
                    )
                  }
                  showDetails={showDetails}
                >
                  <ChatArea onShowDetails={() => setShowDetails(!showDetails)} />
                </CommunicationLayout>
              </motion.div>
            ) : (
              <motion.div key="announcements"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}
                className="h-full"
              >
                <AnnouncementsTab highlightId={highlightId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
};

export default CommunicationPage;
