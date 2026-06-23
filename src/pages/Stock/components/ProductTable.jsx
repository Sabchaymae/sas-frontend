import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Pencil, Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react';

const ProductTable = ({ products, onView, onEdit, onDelete }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    const dir = sortDirection === 'asc' ? 1 : -1;
    if (typeof aVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc'
      ? <ChevronUp size={12} className="text-[#1428C9]" />
      : <ChevronDown size={12} className="text-[#1428C9]" />;
  };

  const getStatusBadge = (product) => {
    if (product.quantite <= product.seuil) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
          ● ALERTE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
        ● OK
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl border border-gray-100 p-16 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <Package size={32} className="text-gray-300" />
        </div>
        <p className="text-gray-400 font-semibold text-sm">Aucun produit trouvé</p>
        <p className="text-gray-300 text-xs mt-1">Essayez de modifier vos filtres ou ajoutez un nouveau produit</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                { key: 'designation', label: 'Désignation' },
                { key: 'categorie', label: 'Catégorie' },
                { key: 'fournisseur', label: 'Fournisseur' },
                { key: 'quantite', label: 'Quantité' },
                { key: 'prixUnitaire', label: 'Prix unitaire' },
                { key: 'valeur', label: 'Valeur' },
                { key: 'statut', label: 'Statut' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 cursor-pointer hover:text-[#111827] group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    <SortIcon field={col.key} />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-50 hover:bg-[#1428C9]/[0.02] group/row transition-colors duration-150"
              >
                {/* Designation */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#111827] group-hover/row:text-[#1428C9] transition-colors">
                      {product.designation}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      SKU: {product.sku}
                    </p>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    {product.categorie}
                  </span>
                </td>

                {/* Supplier */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 font-medium">{product.fournisseur}</span>
                </td>

                {/* Quantity */}
                <td className="px-6 py-4">
                  <div>
                    <span className={`text-sm font-bold ${product.quantite <= product.seuil ? 'text-red-600' : 'text-[#111827]'}`}>
                      {product.quantite}
                    </span>
                    {product.quantite <= product.seuil && (
                      <p className="text-[10px] text-red-400 font-semibold mt-0.5">
                        (Seuil: {product.seuil})
                      </p>
                    )}
                  </div>
                </td>

                {/* Unit Price */}
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-600">{formatPrice(product.prixUnitaire)}</span>
                </td>

                {/* Value */}
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-[#111827]">
                    {formatPrice(product.quantite * product.prixUnitaire)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {getStatusBadge(product)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onView?.(product)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-[#1428C9]/10 hover:text-[#1428C9] transition-all duration-200"
                      title="Voir"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit?.(product)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete?.(product)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <p className="text-xs text-gray-400 font-semibold">
          {products.length} produit{products.length > 1 ? 's' : ''} au total
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-medium">
            {products.filter(p => p.quantite <= p.seuil).length} en alerte
          </span>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductTable;
