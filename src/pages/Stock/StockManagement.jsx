import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  Coins,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import StatsCard from './components/StatsCard';
import ProductTable from './components/ProductTable';
import AddProductModal from './components/AddProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import usePermissions from '../../hooks/usePermissions';
import { stockService } from '../../services/stockService';

const CATEGORIES = [
  'Toutes catégories',
  'Linge de lit',
  'Produits ménagers',
  'Salle de bain',
  'Cuisine',
  'Consommables',
  'Équipements chambre',
  'Mobilier',
  'Électronique',
];

const FOURNISSEURS = [
  'Tous fournisseurs',
  'Textiles & Co',
  'CleanPro',
  'HôtelSupply',
  'FreshLinen',
  'ProEquip',
  'AlgérieFournitures',
];

// ─── Main Component ────────────────────────────────────────────
const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes catégories');
  const [supplierFilter, setSupplierFilter] = useState('Tous fournisseurs');
  const [alertFilter, setAlertFilter] = useState('all');
  
  const { hasPermission } = usePermissions();

  // ─── Load Products ──────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await stockService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── Computed Stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    const total = products.length;
    const alerts = products.filter(p => p.quantite <= p.seuil).length;
    const totalValue = products.reduce((sum, p) => sum + (p.quantite * p.prixUnitaire), 0);
    return { total, alerts, totalValue };
  }, [products]);

  // ─── Filtered Products ──────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery ||
        p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fournisseur.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'Toutes catégories' || p.categorie === categoryFilter;
      const matchesSupplier = supplierFilter === 'Tous fournisseurs' || p.fournisseur === supplierFilter;
      const matchesAlert =
        alertFilter === 'all' ? true :
        alertFilter === 'yes' ? p.quantite <= p.seuil :
        p.quantite > p.seuil;

      return matchesSearch && matchesCategory && matchesSupplier && matchesAlert;
    });
  }, [products, searchQuery, categoryFilter, supplierFilter, alertFilter]);

  // ─── Handlers ───────────────────────────────────────────────
  const handleAddOrEditProduct = async (form, id) => {
    try {
      const productData = {
        designation: form.designation,
        categorie: form.categorie,
        fournisseur: form.fournisseur,
        quantite: parseInt(form.quantite) || 0,
        seuil: parseInt(form.seuil) || 20,
        prixUnitaire: parseFloat(form.prixNormal) || 0,
      };

      if (id) {
        const updated = await stockService.updateProduct(id, productData);
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
      } else {
        const created = await stockService.createProduct(productData);
        setProducts(prev => [created, ...prev]);
      }
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde du produit.');
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Supprimer "${product.designation}" ?`)) {
      try {
        await stockService.deleteProduct(product.id);
        setProducts(prev => prev.filter(p => p.id !== product.id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleViewClick = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  return (
    <div className="w-full mx-auto pb-12 space-y-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight">
            Gestion du stock
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed max-w-lg">
            Supervisez et gérez l'inventaire de l'hôtel <span className="font-bold text-[#1428C9]">ORIOTEL</span> en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {stats.alerts > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl"
            >
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-xs font-bold text-red-600">
                ⚠ {stats.alerts} produit{stats.alerts > 1 ? 's' : ''} en stock bas
              </span>
            </motion.div>
          )}
          {hasPermission('Stock', 'Création') && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#1428C9] text-white text-sm font-bold rounded-xl hover:bg-[#1428C9]/90 hover:shadow-lg hover:shadow-[#1428C9]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Plus size={18} />
              Ajouter un produit
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard
          title="TOTAL PRODUITS"
          value={stats.total.toLocaleString('fr-FR')}
          subtitle="↗ +4% vs mois dernier"
          subtitleColor="text-emerald-500"
          icon={Package}
          iconBg="bg-[#1428C9]/10"
          iconColor="text-[#1428C9]"
          index={0}
        />
        <StatsCard
          title="PRODUITS EN ALERTE"
          value={stats.alerts}
          subtitle="Action requise immédiate"
          subtitleColor="text-red-400"
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          index={1}
        />
        <StatsCard
          title="VALEUR TOTALE"
          value={`${stats.totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH`}
          subtitle="Basé sur le prix unitaire actuel"
          subtitleColor="text-gray-400"
          icon={Coins}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          index={2}
        />
      </div>

      {/* ── Filters Bar ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit, SKU, fournisseur..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-300 focus:border-[#1428C9]/30 focus:bg-white focus:ring-4 focus:ring-[#1428C9]/5 outline-none"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium text-gray-600 focus:border-[#1428C9]/30 focus:bg-white outline-none appearance-none cursor-pointer min-w-[170px]"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Supplier */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-medium text-gray-600 focus:border-[#1428C9]/30 focus:bg-white outline-none appearance-none cursor-pointer min-w-[170px]"
          >
            {FOURNISSEURS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Alert filter */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
            <button
              onClick={() => setAlertFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                alertFilter === 'all'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setAlertFilter('yes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                alertFilter === 'yes'
                  ? 'bg-red-50 text-red-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ⚠ Alerte
            </button>
            <button
              onClick={() => setAlertFilter('no')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                alertFilter === 'no'
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ✓ OK
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Products Table ─────────────────────────────────────── */}
      <ProductTable
        products={filteredProducts}
        onView={handleViewClick}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        canView={hasPermission('Stock', 'Lecture')}
        canEdit={hasPermission('Stock', 'Modification')}
        canDelete={hasPermission('Stock', 'Suppression')}
      />

      {/* ── Add/Edit Product Modal ──────────────────────────────── */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleAddOrEditProduct}
        productToEdit={editingProduct}
      />

      {/* ── Product Detail Modal ───────────────────────────────── */}
      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
};

export default StockManagement;
