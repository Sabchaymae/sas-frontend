import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Save } from 'lucide-react';

const CATEGORIES = [
  'Équipement Réseau',
  'Terminaux & Mobiles',
  'Cartes SIM & Recharges',
  'Accessoires',
  'Consommables Bureau',
  'Infrastructure',
  'Outillage',
];

const FOURNISSEURS = [
  'IAM (Maroc Telecom)',
  'Inwi',
  'Orange Maroc',
  'Huawei',
  'Nokia',
  'Ericsson',
  'Cisco',
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

const AddProductModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      const qte = productToEdit.quantite || 0;
      const prix = productToEdit.prixUnitaire || 0;
      setForm({
        designation: productToEdit.designation || '',
        categorie: productToEdit.categorie || '',
        fournisseur: productToEdit.fournisseur || '',
        quantite: qte,
        seuil: productToEdit.seuil || '',
        prixNormal: prix,
        prixQuantite: (qte * prix).toFixed(2),
      });
    } else {
      setForm(initialForm);
    }
  }, [productToEdit, isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Auto-calculate total price if quantity or unit price changes
      if (field === 'quantite' || field === 'prixNormal') {
        const qte = parseFloat(newForm.quantite) || 0;
        const prix = parseFloat(newForm.prixNormal) || 0;
        newForm.prixQuantite = (qte * prix).toFixed(2);
      }
      
      return newForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSave(form, productToEdit?.id);
      setForm(initialForm);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
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
                  <h3 className="text-lg font-black text-[#111827] tracking-tight">
                    {productToEdit ? 'Modifier le produit' : 'Ajouter un produit'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {productToEdit ? 'Modifiez les informations du produit sélectionné' : 'Remplissez les informations du nouveau produit'}
                  </p>
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
                    placeholder="100"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-300 focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                    Prix normal (DH) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={form.prixNormal}
                    onChange={(e) => handleChange('prixNormal', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-300 focus:border-[#1428C9] focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">
                    Prix par quantité (Total)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={form.prixQuantite}
                    className="w-full px-4 py-3.5 bg-gray-100 border-2 border-gray-100 rounded-xl text-sm font-bold text-[#1428C9] outline-none cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#1428C9] text-white text-sm font-bold rounded-xl hover:bg-[#1428C9]/90 hover:shadow-lg hover:shadow-[#1428C9]/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Chargement...' : 'Sauvegarder'}
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
