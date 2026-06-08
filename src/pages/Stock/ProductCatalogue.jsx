import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  ShoppingCart, 
  ChevronDown,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { stockService } from '@/services/stockService';
import { cn } from '@/utils/cn';

const ProductCatalogue = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedOperator, setSelectedOperator] = useState('Tous');

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await stockService.getProducts();
      setProducts(data.filter(p => p.quantite > 0));
    } catch (error) {
      console.error('Error fetching products for catalogue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    return ['Tous', ...new Set(products.map(p => p.categorie).filter(Boolean))];
  }, [products]);

  const operators = useMemo(() => {
    return ['Tous', ...new Set(products.map(p => p.fournisseur).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || p.categorie === selectedCategory;
      const matchesOperator = selectedOperator === 'Tous' || p.fournisseur === selectedOperator;
      return matchesSearch && matchesCategory && matchesOperator;
    });
  }, [products, searchQuery, selectedCategory, selectedOperator]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-widest">Loading Catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-12 font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Product Catalogue</h1>
        <p className="text-sm text-gray-500 mt-1">Browse available products and services</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer shadow-sm min-w-[160px]"
            >
              <option value="Tous">All Categories</option>
              {categories.filter(c => c !== 'Tous').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer shadow-sm min-w-[160px]"
            >
              <option value="Tous">All Operators</option>
              {operators.filter(o => o !== 'Tous').map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Upper Part (Blue block) */}
                <div className="h-40 bg-blue-600 flex items-center justify-center">
                  <ShoppingBag size={48} className="text-white opacity-40" />
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Line 1: Name & Badge */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {product.designation}
                    </h3>
                    {product.fournisseur && (
                      <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap ml-2">
                        {product.fournisseur}
                      </span>
                    )}
                  </div>

                  {/* Line 2: Description (using SKU or placeholder) */}
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {product.sku ? `Référence: ${product.sku}` : 'Aucune description disponible pour ce produit.'}
                  </p>

                  {/* Line 3: Category */}
                  <div className="flex items-center gap-1.5 text-gray-400 mb-4">
                    <Tag size={14} />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {product.categorie || 'Équipement'}
                    </span>
                  </div>

                  <div className="mt-auto">
                    {/* Separator */}
                    <div className="border-t border-gray-100 my-4" />

                    {/* Bottom Line: Price & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">
                          En Stock: {product.quantite}
                        </span>
                        <span className="text-xl font-black text-gray-900">
                          {product.prixUnitaire && parseFloat(product.prixUnitaire) > 0 
                            ? `${parseFloat(product.prixUnitaire).toLocaleString()} MAD` 
                            : '0.00 MAD'}
                        </span>
                      </div>
                      <button className="bg-blue-600 text-white font-medium rounded-lg px-4 py-2 text-sm hover:bg-blue-700 transition-colors active:scale-95 shadow-sm shadow-blue-200">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
              <Package size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Aucun produit trouvé</h2>
            <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductCatalogue;
