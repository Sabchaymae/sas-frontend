
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Smile, X, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import clsx from 'clsx';

const ChatComposer = ({ onSend, onTyping, autoFocus = false }) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
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


  const handleSubmit = async (e) => {
    e?.preventDefault();
    if ((!content.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    try {
      if (attachments.length > 0) {
        const formData = new FormData();
        if (content.trim()) formData.append('content', content);
        attachments.forEach(attr => formData.append('files[]', attr.file, attr.name));
        await onSend(formData);
      } else {
        await onSend(content);
      }
      setContent('');
      setAttachments([]);
      setIsTyping(false);
      onTyping(false);
      setShowEmojiPicker(false);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div
      className="px-3 py-2.5 relative"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.7)',
      }}
    >

      {/* Attachment Previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}

            className="flex flex-wrap gap-2 mb-2 p-2 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 2px 12px rgba(20,40,201,0.08)',
            }}

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
        <div
          className="flex-1 rounded-2xl px-3 py-1.5 flex items-end"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 2px 8px rgba(20,40,201,0.06)',
          }}
        >

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Écrivez un message..."
            className="flex-1 resize-none bg-transparent border-none text-[15px] text-[#111b21] placeholder-[#667781] focus:ring-0 p-1 min-h-[24px] max-h-[120px] overflow-y-auto leading-tight"
            value={content}
            onChange={handleContentChange}
            onKeyDown={(e) => {

              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!sending) handleSubmit(e); }
            }}
          />
        </div>

        {/* Send Button */}
        <div className="pb-0.5">
          <button
            type="submit"

            disabled={(!content.trim() && attachments.length === 0) || sending}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0"
            style={content.trim() || attachments.length > 0 ? {
              background: sending
                ? 'linear-gradient(135deg, rgba(20,40,201,0.6) 0%, rgba(79,110,247,0.6) 100%)'
                : 'linear-gradient(135deg, #1428C9 0%, #4f6ef7 100%)',
              boxShadow: sending ? 'none' : '0 4px 16px rgba(20,40,201,0.35)',
            } : {
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.7)',
            }}
          >
            <AnimatePresence mode="wait">
              {sending ? (
                <motion.span key="sending"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <Loader2 size={20} className="text-white animate-spin" />
                </motion.span>
              ) : (
                <motion.span key="send"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <Send size={20}
                    className={(content.trim() || attachments.length > 0) ? 'text-white ml-0.5' : 'text-gray-300'}
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComposer;
