import React, { useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import clsx from 'clsx';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏', '🙏', '💪'];

const ReactionPicker = ({ onSelect, onClose, show, isOwn }) => {
  const pickerRef = useRef(null);

  // Fermer si on clique à l'extérieur
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      ref={pickerRef}
      className={clsx(
        "absolute bottom-full mb-1 z-50",
        "bg-white rounded-lg shadow-lg border border-gray-200",
        "p-2 flex gap-1",
        isOwn ? "right-0" : "left-0"
      )}
    >
      {COMMON_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-all hover:scale-125"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
