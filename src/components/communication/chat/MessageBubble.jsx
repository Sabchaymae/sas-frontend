import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, AlertCircle, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

const MessageBubble = ({ message, isOwn, isContinued, isLast, isSeen, isDelivered }) => {
  if (message.type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="flex justify-center my-3 w-full"
      >
        <span className="bg-gray-50 text-gray-500 text-[11px] font-semibold px-4 py-1.5 rounded-full border border-gray-100 shadow-sm select-none">
          {message.content}
        </span>
      </motion.div>
    );
  }

  const time = (() => {
    try {
      return format(new Date(message.created_at), 'HH:mm', { locale: fr });
    } catch {
      return '';
    }
  })();

  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={clsx(
        'flex items-end gap-2 px-2',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isContinued ? 'mt-0.5' : 'mt-3'
      )}
    >
      {/* Avatar — only for the last message in a group from same sender */}
      {!isOwn && (
        <div className="w-7 h-7 shrink-0 mb-0.5">
          {isLast ? (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white text-[10px] font-semibold flex items-center justify-center">
              {message.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          ) : null}
        </div>
      )}

      {/* Bubble */}
      <div className={clsx('flex flex-col', isOwn ? 'items-end' : 'items-start', 'max-w-[72%]')}>

        {/* Sender name — only on first in group, for received messages */}
        {!isOwn && !isContinued && message.user?.name && (
          <span className="text-[11px] font-semibold text-gray-500 mb-1 ml-1">
            {message.user.name}
          </span>
        )}


        <div
          className={clsx(
            'relative px-3.5 py-2.5 text-sm leading-relaxed transition-all duration-200',
            // Shape: round corners, with a "tail" only on last bubble
            isOwn
              ? clsx(
                'bg-[#1428C9] text-white',
                isContinued
                  ? 'rounded-2xl rounded-tr-lg'
                  : isLast
                    ? 'rounded-2xl rounded-br-sm'
                    : 'rounded-2xl rounded-tr-lg'
              )
              : clsx(
                'bg-white text-gray-800 border border-gray-100',
                isContinued
                  ? 'rounded-2xl rounded-tl-lg'
                  : isLast
                    ? 'rounded-2xl rounded-bl-sm'
                    : 'rounded-2xl rounded-tl-lg'
              ),
            // Error state
            message.error && 'opacity-60 border-red-200',
            // Sending state
            message.sending && 'opacity-70'
          )}
        >
          {/* Content */}
          {message.content && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Attachments */}
          {hasAttachments && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((att, i) => (
                <div
                  key={i}
                  className={clsx(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs',
                    isOwn ? 'bg-white/15 text-white' : 'bg-gray-50 text-gray-700'

                  )}
                >
                  <Paperclip size={11} />
                  <span className="truncate max-w-[160px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Time + Status — always visible at bottom right */}
          <div className={clsx(
            'flex items-center justify-end gap-1 mt-1.5',
            isOwn ? 'text-white/60' : 'text-gray-400'
          )}>
            <span className="text-[10px] leading-none">{time}</span>
            {isOwn && !message.sending && !message.error && (
              isSeen ? (
                <CheckCheck size={13} className="text-sky-300" title="Vu" />
              ) : isDelivered ? (
                <CheckCheck size={13} className="text-white/60" title="Délivré" />
              ) : (
                <Check size={13} className="text-white/40" title="Envoyé" />
              )
            )}
            {message.error && (
              <AlertCircle size={11} className="text-red-400" title="Échec de l'envoi" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
