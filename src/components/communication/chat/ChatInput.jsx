import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import communicationService from '../../../services/communicationService';

const ChatInput = ({ onSend, conversationId }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleTyping = () => {
    if (!conversationId) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      communicationService.sendTypingIndicator(conversationId, true).catch(() => {});
    }
    typingTimeoutRef.current = setTimeout(() => {
      communicationService.sendTypingIndicator(conversationId, false).catch(() => {});
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (content.trim() || files.length > 0) {
      onSend(content, files);
      setContent('');
      setFiles([]);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        communicationService.sendTypingIndicator(conversationId, false).catch(() => {});
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = content.trim().length > 0 || files.length > 0;

  return (
    <div className="bg-white border-t border-gray-100 px-4 py-3">

      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-medium animate-in fade-in zoom-in duration-200"
            >
              <Paperclip size={12} className="text-blue-400 shrink-0" />
              <span className="truncate max-w-[140px]">{file.name}</span>
              <button
                onClick={() => removeFile(i)}
                className="ml-0.5 hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">
        {/* Left actions */}
        <div className="flex items-center gap-0.5 pb-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Joindre un fichier"
            className="p-2 text-gray-400 hover:text-[#1428C9] hover:bg-blue-50 rounded-lg transition-all"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            title="Emoji"
            className="p-2 text-gray-400 hover:text-[#1428C9] hover:bg-blue-50 rounded-lg transition-all"
          >
            <Smile size={18} />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Écrivez un message..."
            value={content}
            onChange={(e) => { setContent(e.target.value); handleTyping(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1428C9]/40 focus:bg-white focus:ring-2 focus:ring-[#1428C9]/8 transition-all min-h-[42px] max-h-[120px] overflow-y-auto leading-relaxed"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSend}
          title="Envoyer (Entrée)"
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 mb-0.5
            disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
            bg-[#1428C9] text-white hover:bg-[#1020A8] active:scale-90 shadow-sm shadow-[#1428C9]/20"
        >
          <Send size={16} className="ml-0.5" />
        </button>

        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {/* Hint */}
      <p className="text-[10px] text-gray-300 mt-1.5 ml-1">
        Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
      </p>
    </div>
  );
};

export default ChatInput;
