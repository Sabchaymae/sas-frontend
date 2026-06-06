import { useEffect } from 'react';
import echo from '@/services/echo';

const useKanbanWebsocket = (onTaskEscalated) => {
  useEffect(() => {
    const channel = echo.channel('kanban-channel');

    channel.listen('TaskEscalatedEvent', (updatedTask) => {
      console.log('🚀 Escalade reçue en temps réel:', updatedTask);
      
      // Jouer le signal sonore
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.warn('Audio play failed:', e));

      // Callback pour mettre à jour l'état
      if (onTaskEscalated) {
        onTaskEscalated(updatedTask);
      }
    });

    return () => {
      channel.stopListening('TaskEscalatedEvent');
      echo.leaveChannel('kanban-channel');
    };
  }, [onTaskEscalated]);
};

export default useKanbanWebsocket;