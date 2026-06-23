import React, { useEffect, useRef, useMemo } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import MessageBubble from './MessageBubble';
import useAuth from '../../../hooks/useAuth';
import useInView from '../../../hooks/useInView';
import useChatStore from '../../../store/useChatStore';

const DateDivider = ({ date }) => (
  <div className="flex items-center gap-3 my-4 px-4">
    <div className="flex-1 h-px bg-gray-100" />
    <span className="text-[11px] font-medium text-gray-400 select-none whitespace-nowrap">{date}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const MessageList = ({ messages, loading }) => {
  const { user } = useAuth();
  const { loadingMoreMessages, fetchMoreMessages } = useChatStore();
  const messagesEndRef = useRef(null);
  const [loadMoreRef, isLoadMoreInView] = useInView({ threshold: 0.5 });
  
  // When loadMoreRef is in view, fetch more messages
  useEffect(() => {
    if (isLoadMoreInView && !loading) {
      fetchMoreMessages();
    }
  }, [isLoadMoreInView, loading, fetchMoreMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupMessagesByDate = (msgs) => {
    const groups = [];
    msgs.forEach((message) => {
      const date = new Date(message.created_at);
      let dateStr = '';
      if (isToday(date)) dateStr = "Aujourd'hui";
      else if (isYesterday(date)) dateStr = 'Hier';
      else dateStr = format(date, 'EEEE d MMMM', { locale: fr });

      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.date !== dateStr) {
        groups.push({ date: dateStr, messages: [message] });
      } else {
        lastGroup.messages.push(message);
      }
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex-1 h-full flex flex-col justify-end px-4 py-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 animate-pulse ${i % 2 === 0 ? 'justify-start' : 'justify-end flex-row-reverse'}`}
          >
            {i % 2 === 0 && <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />}
            <div
              className="h-10 rounded-2xl bg-gray-200"
              style={{ width: `${80 + Math.random() * 120}px` }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-[#1428C9]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Commencez la conversation</h3>
        <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">Envoyez votre premier message pour démarrer la discussion.</p>
      </div>
    );
  }

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 flex flex-col scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
      {/* Loading indicator for more messages */}
      <div ref={loadMoreRef} className="flex justify-center py-2">
        {loadingMoreMessages && (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <span>Chargement des messages...</span>
          </div>
        )}
      </div>
      
      {groupedMessages.map((group) => (
        <div key={group.date} className="flex flex-col">
          <DateDivider date={group.date} />
          <div className="flex flex-col space-y-1">
            {group.messages.map((message, index) => {
              const prevMessage = group.messages[index - 1];
              const nextMessage = group.messages[index + 1];
              const isOwn = message.user_id === user?.id;
              // Consecutive messages from same sender are grouped
              const isContinued = prevMessage && prevMessage.user_id === message.user_id;
              const isLast = !nextMessage || nextMessage.user_id !== message.user_id;
              return (
                <MessageBubble
                  key={message.id || `${group.date}-${index}`}
                  message={message}
                  isOwn={isOwn}
                  isContinued={isContinued}
                  isLast={isLast}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} className="h-2" />
    </div>
  );
};

export default MessageList;
