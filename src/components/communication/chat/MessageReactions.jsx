import { useMemo } from 'react';
import useAuth from '../../../hooks/useAuth';
import communicationService from '../../../services/communicationService';
import clsx from 'clsx';

const MessageReactions = ({ message, conversationId, onUpdate }) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const reactions = message.reactions || [];

  // Grouper les réactions par emoji
  const groupedReactions = useMemo(() => {
    return reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {});
  }, [reactions]);

  // Vérifier si l'utilisateur a réagi avec cet emoji
  const hasUserReacted = (emoji) => {
    return groupedReactions[emoji]?.some(r => r.user_id === currentUserId);
  };

  // Obtenir la liste des utilisateurs qui ont réagi
  const getUsersWhoReacted = (emoji) => {
    return groupedReactions[emoji]
      ?.map(r => `${r.user.prenom} ${r.user.nom}`)
      .join(', ') || '';
  };

  // Toggle une réaction
  const handleToggle = async (emoji) => {
    try {
      const result = await communicationService.toggleReaction(
        conversationId,
        message.id,
        emoji
      );
      
      // Mettre à jour localement (le WebSocket mettra à jour aussi)
      if (onUpdate) {
        onUpdate(message.id, result.reactions);
      }
    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
    }
  };

  if (Object.keys(groupedReactions).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1 px-2">
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
        <button
          key={emoji}
          onClick={() => handleToggle(emoji)}
          title={getUsersWhoReacted(emoji)}
          className={clsx(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all",
            "border hover:scale-105",
            hasUserReacted(emoji)
              ? "bg-blue-100 border-blue-300 text-blue-700 font-semibold"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
          )}
        >
          <span className="text-sm">{emoji}</span>
          <span className="text-[10px] font-bold">{reactionList.length}</span>
        </button>
      ))}
    </div>
  );
};

export default MessageReactions;
