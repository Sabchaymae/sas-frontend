import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, ArrowLeft, ArrowUpCircle, ArrowDownCircle, Search, Calendar, Package } from 'lucide-react';
import { stockService } from '../../../services/stockService';

const StockHistory = ({ onBack }) => {
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setIsLoading(true);
        const data = await stockService.getMovements();
        setMovements(data);
      } catch (error) {
        console.error('Error fetching movements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter(m => 
    m.product?.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.motif.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#1428C9] hover:border-[#1428C9]/20 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight flex items-center gap-3">
              <History className="text-[#1428C9]" />
              Historique des Mouvements
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Traçabilité complète des entrées et sorties de stock
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[300px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit ou un motif..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:border-[#1428C9]/30 focus:ring-4 focus:ring-[#1428C9]/5 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Date & Heure</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Produit</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Quantité</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-4 h-16 bg-gray-50/20" />
                  </tr>
                ))
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                        <History size={32} />
                      </div>
                      <p className="text-gray-400 font-medium">Aucun mouvement trouvé</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-gray-300" />
                        <span className="text-sm font-bold text-gray-600">
                          {new Date(movement.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1428C9]/5 flex items-center justify-center text-[#1428C9]">
                          <Package size={14} />
                        </div>
                        <span className="text-sm font-bold text-[#111827]">
                          {movement.product?.designation}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        movement.type === 'entrée' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {movement.type === 'entrée' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${
                        movement.type === 'entrée' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'entrée' ? '+' : '-'}{movement.quantite}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 font-medium italic">
                        "{movement.motif}"
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockHistory;
