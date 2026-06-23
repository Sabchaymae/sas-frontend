import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Save } from 'lucide-react';

const CATEGORIES = [
  'Linge de lit',
  'Produits ménagers',
  'Salle de bain',
  'Équipements chambre',
  'Cuisine',
  'Consommables',
  'Mobilier',
  'Électronique',
];

const FOURNISSEURS = [
  'Textiles & Co',
  'CleanPro',
  'HôtelSupply',
  'FreshLinen',
  'ProEquip',
  'AlgérieFournitures',
];

const initialForm = {
  designation: '',
  categorie: '',
  fournisseur: '',
  quantite: '',
  seuil: '',
  prixNormal: '',
  prixQuantite: '',
};

const AddProductModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState(initialForm);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm(initialForm);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1428C9]/10 flex items-center justify-center">
                  <Package size={22} className="text-[#1428C9]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111827] tracking-tight">Ajouter un produit</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Remplissez les informations du nouveau produit</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Designation */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                  Désignation *
                </label>
                <input
                  type="text"
                  required
                  value={form.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  placeholder="Ex: Draps Coton King Size"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-300 focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none"
                />
              </div>

              {/* Category & Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={form.categorie}
                    onChange={(e) => handleChange('categorie', e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                    Fournisseur *
                  </label>
                  <select
                    required
                    value={form.fournisseur}
                    onChange={(e) => handleChange('fournisseur', e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner</option>
                    {FOURNISSEURS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity & Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                    Quantité initiale *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.quantite}
                    onChange={(e) => handleChange('quantite', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-300 focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                    Seuil d'alerte *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.seuil}
                    onChange={(e) => handleChange('seuil', e.target.value)}
                    placeholder="20"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-300 focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                    Prix normal (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.prixNormal}
                    onChange={(e) => handleChange('prixNormal', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-300 focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                    Prix par quantité (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.prixQuantite}
                    onChange={(e) => handleChange('prixQuantite', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-300 focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#1428C9] text-white text-sm font-bold rounded-xl hover:bg-[#1428C9]/90 hover:shadow-lg hover:shadow-[#1428C9]/20 transition-all duration-200 flex items-center gap-2"
                >
                  <Save size={16} />
                  Sauvegarder
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;
