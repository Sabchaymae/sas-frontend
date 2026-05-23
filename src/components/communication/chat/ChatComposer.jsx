import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatComposer = ({ onSend, onTyping }) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (!isTyping) { setIsTyping(true); onTyping(true); }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!content.trim()) return;
    onSend(content);
    setContent('');
    setIsTyping(false);
    onTyping(false);
  };

  return (
    <div className="bg-white border-t border-gray-100 px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Left actions */}
        <div className="flex items-center gap-0.5 pb-1">
          <button type="button" title="Joindre un fichier"
            className="p-2 text-gray-400 hover:text-[#1428C9] hover:bg-blue-50 rounded-lg transition-all">
            <Paperclip size={18} />
          </button>
          <button type="button" title="Emoji"
            className="p-2 text-gray-400 hover:text-[#1428C9] hover:bg-blue-50 rounded-lg transition-all">
            <Smile size={18} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Écrivez un message..."
          className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1428C9]/40 focus:bg-white focus:ring-2 focus:ring-[#1428C9]/8 transition-all min-h-[42px] max-h-[120px] overflow-y-auto leading-relaxed"
          value={content}
          onChange={handleContentChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
          }}
        />

        {/* Send Button */}
        <AnimatePresence mode="wait">
          <motion.button
            key={content.trim() ? 'send' : 'empty'}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.12 }}
            type="submit"
            disabled={!content.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 mb-0.5
              disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
              bg-[#1428C9] text-white hover:bg-[#1020A8] active:scale-90 shadow-sm shadow-[#1428C9]/20"
          >
            <Send size={16} className="ml-0.5" />
          </motion.button>
        </AnimatePresence>
      </form>
      <p className="text-[10px] text-gray-300 mt-1.5 ml-1">
        Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
      </p>
    </div>
  );
};

export default ChatComposer;
