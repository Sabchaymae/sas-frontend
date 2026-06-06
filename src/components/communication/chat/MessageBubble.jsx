import React, { memo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Download, Check, CheckCheck, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const MessageBubble = memo(({ 
  message, 
  isOwn, 
  isContinued, 
  isLast, 
  isSeen, 
  isDelivered,
  onImageClick
}) => {
  const attachments = message.attachments || [];
  
  const getTime = (date) => {
    try {
      return format(new Date(date), 'HH:mm', { locale: fr });
    } catch (e) {
      return '';
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Extract filename from path (path is usually 'chat/filename.ext')
    const filename = path.split('/').pop();
    // Use the new public route to serve files reliably
    return `http://localhost:8080/api/communication/api/chat-files/${filename}`;
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-[#e1f3fb] text-[#54656f] text-[11px] px-3 py-1 rounded-md shadow-sm uppercase font-bold tracking-wider">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "flex w-full mb-0.5 px-4 md:px-6",
      isOwn ? "justify-end" : "justify-start",
      !isContinued && "mt-3"
    )}>
      {/* Avatar column */}
      {!isOwn && !isContinued && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 mr-2 shrink-0 self-start mt-1">
          {getInitials(message.user?.name)}
        </div>
      )}
      {!isOwn && isContinued && <div className="w-10 shrink-0" />}

      <div className={clsx(
        "relative max-w-[85%] md:max-w-[70%] px-1 py-1 shadow-sm",
        isOwn 
          ? "bg-[#d9fdd3] text-[#111b21] rounded-l-lg rounded-br-lg" 
          : "bg-white text-[#111b21] rounded-r-lg rounded-bl-lg",
        !isContinued && (isOwn ? "rounded-tr-none" : "rounded-tl-none")
      )}>
        {/* Tail */}
        {!isContinued && (
          <div className={clsx(
            "absolute top-0 w-3 h-3",
            isOwn 
              ? "-right-2 bg-[#d9fdd3] [clip-path:polygon(0_0,0_100%,100%_0)]" 
              : "-left-2 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)]"
          )} />
        )}

        {/* Sender Name */}
        {!isOwn && !isContinued && message.user?.name && (
          <p className="text-[11px] font-bold text-[#e542a3] px-1.5 mb-0.5">
            {message.user.name}
          </p>
        )}

        {/* Attachments Display */}
        {attachments.length > 0 && (
          <div className="flex flex-col gap-1 mb-1">
            {attachments.map((file, i) => {
              const isImage = file.file_type?.startsWith('image/');
              const url = getFileUrl(file.file_path);
              
              if (isImage) {
                return (
                  <div key={i} className="relative rounded-lg overflow-hidden max-h-80 group">
                    <img 
                      src={url} 
                      alt={file.file_name} 
                      className="w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => onImageClick(url)}
                    />
                  </div>
                );
              }

              return (
                <div key={i} className={clsx(
                  "flex items-center gap-3 p-2 rounded-lg border m-0.5",
                  isOwn ? "bg-[#c1e6b9] border-[#b0d9a7]" : "bg-gray-50 border-gray-100"
                )}>
                  <div className="w-10 h-10 bg-white/50 rounded flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{file.file_name}</p>
                    <p className="text-[10px] text-gray-500">
                      {(file.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <Download size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Content & Metadata */}
        <div className="px-1.5 py-0.5">
          <div className="relative inline-block w-full">
            <p className="text-[14.5px] leading-[1.4] whitespace-pre-wrap pr-16 pb-1">
              {message.content}
            </p>
            
            {/* Metadata (Time + Status) */}
            <div className="absolute bottom-0 right-0 flex items-center gap-1">
              <span className="text-[10px] text-[#667781]">
                {message.sending ? "..." : getTime(message.created_at)}
              </span>
              {isOwn && !message.sending && !message.error && (
                <span className={clsx(
                  "flex items-center",
                  isSeen ? "text-[#53bdeb]" : "text-[#667781]"
                )}>
                  {isSeen || isDelivered ? (
                    <CheckCheck size={14} strokeWidth={2.5} />
                  ) : (
                    <Check size={14} strokeWidth={2.5} />
                  )}
                </span>
              )}
              {isOwn && message.error && (
                <span className="text-red-500 text-[10px]">⚠️</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.sending === nextProps.message.sending &&
    prevProps.message.error === nextProps.message.error &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.isContinued === nextProps.isContinued &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.isSeen === nextProps.isSeen &&
    prevProps.isDelivered === nextProps.isDelivered
  );
});

export default MessageBubble;
