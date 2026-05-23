import React, { memo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Download } from 'lucide-react';

const MessageBubble = memo(({ message, isOwn, showAvatar }) => {

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

  return (
    <div className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar column */}
      <div className="w-8 flex-shrink-0 mb-1">
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 rounded-sm bg-[#1428C9]/10 text-[#1428C9] flex items-center justify-center text-[10px] font-black border border-[#1428C9]/5 shadow-sm">
            {getInitials(message.user?.name)}
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {showAvatar && !isOwn && (
          <span className="text-[10px] font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-[0.1em]">
            {message.user?.name}
          </span>
        )}
        
        <div className={`px-4 py-3 rounded-sm relative group transition-all duration-300 ${
          isOwn 
            ? 'bg-[#1428C9] text-white shadow-md shadow-[#1428C9]/10 bubble-out' 
            : 'bg-white border border-slate-100 text-[#111827] shadow-sm bubble-in'
        }`}>
          {/* Attachments */}
          {message.attachments?.map((file, i) => (
            <div key={i} className={`mb-3 p-3 rounded-sm flex items-center gap-4 border ${
              isOwn ? 'bg-white/10 border-white/20' : 'bg-[#F9FAFB] border-slate-50 shadow-inner'
            }`}>
              <div className={`w-10 h-10 flex items-center justify-center rounded-sm ${isOwn ? 'bg-white/20' : 'bg-white shadow-sm border border-slate-100'}`}>
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate leading-tight">{file.name}</p>
                <p className={`text-[9px] font-medium mt-0.5 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button className={`p-2 rounded-sm transition-all ${
                isOwn ? 'hover:bg-white/20' : 'hover:bg-white shadow-sm border border-slate-100'
              }`}>
                <Download size={16} />
              </button>
            </div>
          ))}

          <p className="text-[13px] leading-[1.6] whitespace-pre-wrap font-medium tracking-tight">
            {message.content}
          </p>

          <div className={`flex items-center gap-2 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${
              isOwn ? 'text-white/50' : 'text-gray-300'
            }`}>
              {message.sending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
                  Envoi...
                </span>
              ) : message.error ? (
                <span className="text-red-300 flex items-center gap-1">
                  ⚠️ Échec
                </span>
              ) : (
                getTime(message.created_at)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if crucial properties have actually changed
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.sending === nextProps.message.sending &&
    prevProps.message.error === nextProps.message.error &&
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.showAvatar === nextProps.showAvatar
  );
});

export default MessageBubble;
