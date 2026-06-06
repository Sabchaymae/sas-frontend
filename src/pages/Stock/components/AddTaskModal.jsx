import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertTriangle, Calendar, AlignLeft, Flag } from 'lucide-react';

const AddTaskModal = ({ isOpen, onClose, onSave }) => {
  const initialForm = {
    title: '',
    description: '',
    status: 'TO_DO',
    priority: 'MEDIUM',
    due_date: new Date().toISOString().split('T')[0],
  };

  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(initialForm);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1428C9]/10 flex items-center justify-center">
                  <Save size={22} className="text-[#1428C9]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111827] tracking-tight">Nouvelle Tâche</h3>
                  <p className="text-xs text-gray-400 font-medium">Planifiez une nouvelle action opérationnelle</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all duration-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Titre de la tâche *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Maintenance préventive Routeur Rabat"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-[#1428C9] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2 text-left">Description</label>
                <div className="relative">
                  <AlignLeft size={16} className="absolute left-4 top-4 text-gray-300" />
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Détails de l'intervention..."
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-[#1428C9] outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Priorité</label>
                  <div className="relative">
                    <Flag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold text-[#111827] focus:border-[#1428C9] outline-none appearance-none cursor-pointer"
                    >
                      <option value="LOW">Faible</option>
                      <option value="MEDIUM">Moyenne</option>
                      <option value="HIGH">Haute</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Échéance</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="date"
                      required
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold text-[#111827] focus:border-[#1428C9] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 text-sm font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-3.5 bg-[#1428C9] text-white text-sm font-black rounded-xl shadow-lg shadow-[#1428C9]/20 hover:bg-[#1428C9]/90 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <Save size={18} />
                  {isSubmitting ? 'Création...' : 'Créer la tâche'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
