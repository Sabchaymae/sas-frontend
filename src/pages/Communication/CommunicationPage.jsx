import React, { useState, useEffect } from 'react';
import CommunicationLayout from '../../components/communication/layout/CommunicationLayout';
import ConversationsList from '../../components/communication/sidebar/ConversationsList';
import ChatArea from '../../components/communication/chat/ChatArea';
import NewConversationModal from '../../components/communication/chat/NewConversationModal';
import UserDetailsPanel from '../../components/communication/chat/UserDetailsPanel';
import useChatStore from '../../store/useChatStore';

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
    deleteGroup
  } = useChatStore();
  
  const [showDetails, setShowDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectUser = async (data) => {
    try {
      await createConversation(data);
    } catch (error) {
      console.error('Failed to create conversation', error);
    }
  };

  return (
    <div className="w-full h-full animate-in fade-in duration-700">
      <CommunicationLayout
        sidebar={<ConversationsList onNewChat={() => setIsModalOpen(true)} />}
        details={
          activeConversation ? (
            <UserDetailsPanel
              conversation={activeConversation}
              isArchived={(archivedConversations || []).some(c => c.id === activeConversation.id)}
              onClose={() => setShowDetails(false)}
              onDelete={async (id) => {
                await deleteConversation(id);
                setShowDetails(false);
              }}
              onArchive={async (id) => {
                await archiveConversation(id);
                setShowDetails(false);
              }}
              onUnarchive={async (id) => {
                await unarchiveConversation(id);
                setShowDetails(false);
              }}
              onBlock={async (userId) => {
                await blockUser(userId);
              }}
              onUnblock={async (userId) => {
                await unblockUser(userId);
              }}
              onLeaveGroup={async (id) => {
                await leaveGroup(id);
                setShowDetails(false);
              }}
              onInviteGroupMembers={async (id, userIds) => {
                // Call communicationService directly instead of modifying useChatStore
                const { communicationService } = await import('../../services/communicationService');
                await communicationService.inviteGroupMembers(id, userIds);
              }}
              onRemoveGroupMember={async (id, userId) => {
                await removeGroupMember(id, userId);
              }}
              onDeleteGroup={async (id) => {
                await deleteGroup(id);
                setShowDetails(false);
              }}
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

      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
};

export default CommunicationPage;
