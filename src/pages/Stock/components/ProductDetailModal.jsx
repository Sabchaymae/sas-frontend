import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Shield, Calendar, DollarSign, Tag, User } from 'lucide-react';

const ProductDetailModal = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price) + ' DH';
  };

  const isAlert = product.quantite <= product.seuil;

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
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1428C9]/10 flex items-center justify-center">
                  <Package size={22} className="text-[#1428C9]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111827] tracking-tight">Détails du produit</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Fiche d'information complète de l'article</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Product Title */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 block mb-1">
                  Désignation
                </span>
                <h4 className="text-xl font-bold text-[#111827]">{product.designation}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                    SKU: {product.sku}
                  </span>
                  {isAlert ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                      ● ALERTE STOCK BAS
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      ● STOCK OK
                    </span>
                  )}
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Tag size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Catégorie</span>
                  </div>
                  <p className="text-sm font-bold text-gray-700">{product.categorie}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <User size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Fournisseur</span>
                  </div>
                  <p className="text-sm font-bold text-gray-700">{product.fournisseur}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Shield size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Quantité en stock</span>
                  </div>
                  <p className={`text-base font-black ${isAlert ? 'text-red-600' : 'text-gray-800'}`}>
                    {product.quantite} <span className="text-xs text-gray-400 font-medium">(Seuil: {product.seuil})</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <DollarSign size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Prix unitaire</span>
                  </div>
                  <p className="text-base font-black text-gray-800">{formatPrice(product.prixUnitaire)}</p>
                </div>
              </div>

              {/* Total Stock Value */}
              <div className="p-4 bg-gradient-to-br from-[#1428C9]/5 to-transparent rounded-2xl border border-[#1428C9]/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1428C9] block">
                    Valeur estimée du stock
                  </span>
                  <span className="text-xs text-gray-400 font-medium">Prix unitaire × Quantité</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#1428C9]">
                    {formatPrice(product.quantite * product.prixUnitaire)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;
