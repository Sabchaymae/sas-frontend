import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Package, 
  ShoppingCart, 
  AlertCircle, 
  ArrowUpDown,
  Tag,
  Box,
  Router,
  Phone,
  Usb,
  Cpu
} from 'lucide-react';
import { stockService } from '@/services/stockService';
import { cn } from '@/utils/cn';

const CategoryIcon = ({ category }) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('routeur')) return <Router className="w-6 h-6" />;
  if (cat.includes('téléphone') || cat.includes('phone')) return <Phone className="w-6 h-6" />;
  if (cat.includes('câble') || cat.includes('cable')) return <Usb className="w-6 h-6" />;
  if (cat.includes('matériel') || cat.includes('hardware')) return <Cpu className="w-6 h-6" />;
  return <Package className="w-6 h-6" />;
};

const ProductCatalogue = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortOrder, setSortOrder] = useState('desc'); // desc | asc

  useEffect(() => {
    fetchProducts();
    // Synchronisation "temps réel" via polling
    const interval = setInterval(fetchProducts, 10000); // Rafraîchir toutes les 10s
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await stockService.getProducts();
      // On ne garde que les produits en stock (> 0)
      setProducts(data.filter(p => p.quantite > 0));
    } catch (error) {
      console.error('Error fetching products for catalogue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = ['Tous', ...new Set(products.map(p => p.categorie).filter(Boolean))];
    return cats;
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || p.categorie === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        return sortOrder === 'desc' ? b.quantite - a.quantite : a.quantite - b.quantite;
      });
  }, [products, searchQuery, selectedCategory, sortOrder]);

  const globalStats = useMemo(() => {
    const criticalItems = products.filter(p => p.quantite <= 5).length;
    return { criticalItems };
  }, [products]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-widest">Chargement du catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50/50 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight flex items-center gap-3">
            <ShoppingCart className="text-indigo-600" />
            Catalogue Produits
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Consultez les équipements disponibles en stock en temps réel</p>
        </div>

        {globalStats.criticalItems > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-6 py-3 bg-amber-50 border border-amber-100 rounded-2xl"
          >
            <AlertCircle className="text-amber-600" size={20} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Alerte Stock</span>
              <span className="text-sm font-bold text-amber-700">{globalStats.criticalItems} produits en stock faible</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher un équipement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer shadow-sm min-w-[160px]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <ArrowUpDown size={16} />
            {sortOrder === 'desc' ? 'Plus de stock' : 'Moins de stock'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8"
            >
              {filteredAndSortedProducts.map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group overflow-hidden"
                >
                  <div className="p-6">
                    {/* Category & Badge */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <CategoryIcon category={product.categorie} />
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        product.quantite > 5 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      )}>
                        {product.quantite > 5 ? '🟢 Disponible' : '🟠 Stock faible'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                        <Tag size={12} />
                        {product.categorie || 'Équipement'}
                      </div>
                      <h3 className="text-xl font-black text-gray-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors h-12">
                        {product.designation}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-2 font-mono uppercase tracking-tighter">SKU: {product.sku}</p>
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group-hover:bg-indigo-50/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">En stock</span>
                        <span className={cn(
                          "text-2xl font-black",
                          product.quantite <= 5 ? "text-amber-600" : "text-gray-800"
                        )}>
                          {product.quantite}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Box className={cn(
                          product.quantite <= 5 ? "text-amber-400" : "text-indigo-400"
                        )} />
                      </div>
                    </div>
                  </div>

                  {/* Footer Decorative Line */}
                  <div className={cn(
                    "h-1.5 w-full",
                    product.quantite > 5 ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-12"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-6">
                <Package size={48} />
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Aucun produit disponible</h2>
              <p className="text-gray-500 font-medium max-w-md mx-auto">
                Tous nos produits sont actuellement en rupture de stock ou ne correspondent pas à votre recherche.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductCatalogue;
