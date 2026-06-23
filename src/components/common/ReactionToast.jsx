import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';

// ─── Store ────────────────────────────────────────────────────────────────────
export const useReactionToastStore = create((set) => ({
  toasts: [],

  showReactionToast: ({ reactorName, emoji }) => {
    const id = `${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, reactorName, emoji }],
    }));
    // Auto-remove after 4 s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// ─── Component ───────────────────────────────────────────────────────────────
const ReactionToastContainer = () => {
  const { toasts, removeToast } = useReactionToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[220px] max-w-xs cursor-pointer rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 8px 32px rgba(20,40,201,0.15)',
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span className="text-2xl leading-none">{toast.emoji}</span>
            <p className="text-sm text-gray-700 leading-snug">
              <span className="font-bold text-[#111827]">{toast.reactorName}</span>
              {' '}a réagi par{' '}
              <span className="font-bold">{toast.emoji}</span>
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReactionToastContainer;
