import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';

// Simple global action toast store
export const useActionToastStore = create((set) => ({
  toasts: [],
  showActionToast: ({ message, type = 'success', autoClose = 3500 }) => {
    const id = `${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    if (autoClose > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      }, autoClose);
    }
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

const ActionToastContainer = () => {
  const { toasts, removeToast } = useActionToastStore();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto max-w-sm w-full rounded-xl px-4 py-3 shadow-lg"
            style={{ background: t.type === 'error' ? '#feecec' : '#e7f8f2' }}
            onClick={() => removeToast(t.id)}
          >
            <div className="text-sm text-[#111827] font-medium">{t.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ActionToastContainer;
