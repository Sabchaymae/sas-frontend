import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import clsx from 'clsx';

const ChatComposer = ({ onSend, onTyping, autoFocus = false }) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus textarea
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

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

  const onEmojiClick = (emojiData) => {
    setContent(prev => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const filtered = prev.filter(a => a.id !== id);
      // Clean up object URLs to avoid memory leaks
      const removed = prev.find(a => a.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!content.trim() && attachments.length === 0) return;

    if (attachments.length > 0) {
      const formData = new FormData();
      if (content.trim()) formData.append('content', content);
      attachments.forEach(attr => {
        formData.append('files[]', attr.file, attr.name); // Explicitly add filename
      });
      onSend(formData);
    } else {
      onSend(content);
    }

    setContent('');
    setAttachments([]);
    setIsTyping(false);
    onTyping(false);
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-[#f0f2f5] px-3 py-2.5 relative">
      {/* Attachment Previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 mb-2 p-2 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            {attachments.map((attr) => (
              <div key={attr.id} className="relative group w-20 h-20 bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                {attr.preview ? (
                  <img src={attr.preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1">
                    <FileText size={20} className="text-gray-400" />
                    <span className="text-[8px] text-gray-500 truncate w-full text-center mt-1">{attr.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(attr.id)}
                  className="absolute top-0.5 right-0.5 bg-black/40 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-[1400px] mx-auto">
        {/* Left actions */}
        <div className="flex items-center gap-1 pb-1">
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              title="Emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={clsx(
                "p-2 rounded-full transition-all",
                showEmojiPicker ? "text-[#00a884] bg-[#00a884]/10" : "text-[#54656f] hover:bg-black/5"
              )}
            >
              <Smile size={24} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  autoFocusSearch={false}
                  theme="light"
                  width={320}
                  height={400}
                />
              </div>
            )}
          </div>
          
          <button
            type="button"
            title="Joindre un fichier"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#54656f] hover:bg-black/5 rounded-full transition-all"
          >
            <Paperclip size={24} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
        </div>

        {/* Textarea Wrapper */}
        <div className="flex-1 bg-white rounded-lg px-3 py-1.5 flex items-end">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Écrivez un message..."
            className="flex-1 resize-none bg-transparent border-none text-[15px] text-[#111b21] placeholder-[#667781] focus:ring-0 p-1 min-h-[24px] max-h-[120px] overflow-y-auto leading-tight"
            value={content}
            onChange={handleContentChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
            }}
          />
        </div>

        {/* Send Button */}
        <div className="pb-0.5">
          <button
            type="submit"
            disabled={!content.trim() && attachments.length === 0}
            className={clsx(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 shadow-sm",
              (content.trim() || attachments.length > 0)
                ? "bg-[#00a884] text-white hover:bg-[#008f72] active:scale-90"
                : "text-[#54656f] cursor-not-allowed"
            )}
          >
            <Send size={22} className={(content.trim() || attachments.length > 0) ? "ml-0.5" : ""} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComposer;
