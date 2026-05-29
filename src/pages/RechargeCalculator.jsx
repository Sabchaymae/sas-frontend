import { useState, useMemo } from 'react';
import { Calculator, Hash, Percent, TrendingUp, Wallet, CreditCard, ArrowRight, Sparkles } from 'lucide-react';

const RECHARGE_OPTIONS = [
  { value: '10', label: '10 DH' },
  { value: '20', label: '20 DH' },
  { value: '50', label: '50 DH' },
  { value: '100', label: '100 DH' },
  { value: '200', label: '200 DH' },
];

const RechargeCalculator = () => {
  const [rechargeAmount, setRechargeAmount] = useState('10');
  const [quantity, setQuantity] = useState('');
  const [percentage, setPercentage] = useState('');

  const results = useMemo(() => {
    const amount = parseFloat(rechargeAmount) || 0;
    const qty = parseFloat(quantity) || 0;
    const pct = parseFloat(percentage) || 0;

    const totalRecharge = amount * qty;
    const profit = (totalRecharge * pct) / 100;
    const toPay = totalRecharge - profit;

    return { totalRecharge, profit, toPay };
  }, [rechargeAmount, quantity, percentage]);

  const hasValues = quantity !== '' && percentage !== '';

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="bg-[#111827] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1428C9] flex items-center justify-center rounded-sm">
            <Calculator size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">Calculateur Recharge</h1>
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Oriotel • Outil Épicier</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-2 mb-8 animate-in fade-in slide-in-up">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">
            Calcul des gains épicier
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="bg-[#1428C9]/5 text-[#1428C9] px-3 py-1 rounded-sm font-bold text-[11px] border border-[#1428C9]/10 transition-all duration-300">
              Simulateur de marge
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-200 hidden sm:block" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Calcul instantané</span>
          </div>
        </div>

        {/* Calculator Card */}
        <div className="bg-white p-5 sm:p-8 rounded-sm border border-slate-100 transition-all duration-300 animate-in fade-in slide-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">

            {/* Select: Recharge Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 transition-colors duration-200">
                Montant Recharge
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1428C9] transition-all duration-300 pointer-events-none">
                  <CreditCard size={18} />
                </div>
                <select
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full appearance-none pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-[#1428C9] focus:ring-4 focus:ring-[#1428C9]/5 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) text-sm text-[#111827] font-semibold cursor-pointer hover:border-slate-300"
                >
                  {RECHARGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="py-2">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <div className="w-[1px] h-4 bg-slate-200 mr-3 group-focus-within:bg-[#1428C9]/20 transition-colors" />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-[#1428C9] transition-colors">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Input: Quantity */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 transition-colors duration-200">
                Nombre de Recharges
              </label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1428C9] transition-all duration-300" size={18} />
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-[#1428C9] focus:ring-4 focus:ring-[#1428C9]/5 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) text-sm text-[#111827] font-semibold placeholder:text-slate-300 hover:border-slate-300"
                />
              </div>
            </div>

            {/* Input: Percentage */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 transition-colors duration-200">
                Pourcentage (%)
              </label>
              <div className="relative group">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1428C9] transition-all duration-300" size={18} />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Ex: 7"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:bg-white focus:border-[#1428C9] focus:ring-4 focus:ring-[#1428C9]/5 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) text-sm text-[#111827] font-semibold placeholder:text-slate-300 hover:border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 sm:my-8 border-t border-dashed border-slate-200 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3">
              <ArrowRight size={16} className="text-slate-300" />
            </div>
          </div>

          {/* Results */}
          <div className={`transition-all duration-500 ${hasValues ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={14} className="text-[#1428C9]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Résultats</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Recharges */}
              <div className="bg-slate-50 border border-slate-100 rounded-sm p-5 transition-all duration-300 hover:border-slate-200 group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-[#111827]/5 flex items-center justify-center rounded-sm">
                    <CreditCard size={14} className="text-[#111827]/60" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Recharges</span>
                </div>
                <p className="text-2xl font-bold text-[#111827] tracking-tight">
                  {results.totalRecharge.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  <span className="text-sm font-semibold text-slate-400 ml-1">DH</span>
                </p>
              </div>

              {/* Profit */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-sm p-5 transition-all duration-300 hover:border-emerald-200 group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-emerald-500/10 flex items-center justify-center rounded-sm">
                    <TrendingUp size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Gain Épicier</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700 tracking-tight">
                  {results.profit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  <span className="text-sm font-semibold text-emerald-400 ml-1">DH</span>
                </p>
              </div>

              {/* To Pay */}
              <div className="bg-[#1428C9]/[0.03] border border-[#1428C9]/10 rounded-sm p-5 transition-all duration-300 hover:border-[#1428C9]/20 group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-[#1428C9]/10 flex items-center justify-center rounded-sm">
                    <Wallet size={14} className="text-[#1428C9]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1428C9]/60 uppercase tracking-widest">Montant à Payer</span>
                </div>
                <p className="text-2xl font-bold text-[#1428C9] tracking-tight">
                  {results.toPay.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  <span className="text-sm font-semibold text-[#1428C9]/40 ml-1">DH</span>
                </p>
              </div>
            </div>

            {/* Summary line */}
            {hasValues && results.totalRecharge > 0 && (
              <div className="mt-5 p-4 bg-[#111827] rounded-sm animate-in fade-in slide-in-up duration-500">
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  Pour <span className="text-white font-bold">{quantity}</span> recharges de{' '}
                  <span className="text-white font-bold">{rechargeAmount} DH</span>, l'épicier gagne{' '}
                  <span className="text-emerald-400 font-bold">
                    {results.profit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                  </span>{' '}
                  ({percentage}%) et doit payer{' '}
                  <span className="text-[#6B8AFF] font-bold">
                    {results.toPay.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                  </span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[11px] text-slate-400 font-semibold">&copy; {new Date().getFullYear()} Oriotel. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default RechargeCalculator;
