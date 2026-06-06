import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpDown, Save, AlertCircle } from 'lucide-react';

const StockMovementModal = ({ isOpen, onClose, onSave, product }) => {
  const [form, setForm] = useState({
    type: 'sortie',
    quantite: '',
    motif: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ type: 'sortie', quantite: '', motif: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.quantite || parseInt(form.quantite) <= 0) return;
    
    setIsSubmitting(true);
    try {
      await onSave(product.id, {
        ...form,
        quantite: parseInt(form.quantite)
      });
      onClose();
    } catch (error) {
      // L'erreur est gérée par le parent StockManagement
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  const isInvalidSortie = form.type === 'sortie' && form.quantite !== '' && Number(form.quantite) > product.quantite;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1428C9]/10 flex items-center justify-center">
                  <ArrowUpDown size={22} className="text-[#1428C9]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111827] tracking-tight">Mouvement de Stock</h3>
                  <p className="text-xs text-gray-400 font-medium">{product.designation}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all duration-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Actuel Stock Info */}
              <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">STOCK ACTUEL</span>
                <span className="text-lg font-black text-[#111827]">{product.quantite} unités</span>
              </div>

              {/* Type de mouvement */}
              <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'entrée' })}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${form.type === 'entrée' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                >
                  ENTRÉE (+)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'sortie' })}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${form.type === 'sortie' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
                >
                  SORTIE (-)
                </button>
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Quantité</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                  className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${isInvalidSortie ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-[#1428C9]'}`}
                />
                {isInvalidSortie && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-500">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold">Stock insuffisant (Max: {product.quantite}) !</span>
                  </div>
                )}
              </div>

              {/* Motif */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Motif / Justification</label>
                <input
                  type="text"
                  required
                  placeholder={form.type === 'entrée' ? 'Ex: Réception IAM' : 'Ex: Installation site Casablanca'}
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-[#1428C9] outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-3 bg-[#1428C9] text-white text-sm font-bold rounded-xl hover:bg-[#1428C9]/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StockMovementModal;
