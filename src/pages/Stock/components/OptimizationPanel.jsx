import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Split, 
  Clock,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';

const OptimizationPanel = ({ isOpen, onClose, suggestions, onApply }) => {
  if (!isOpen) return null;

  const { reassignments, summary, deadlines } = suggestions;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl h-full bg-slate-50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Assistant d'Optimisation</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">IA Intelligence Opérationnelle</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <Zap size={16} className="text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tâches à risque</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{summary.atRiskCount}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgences</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{summary.criticalCount}</p>
            </div>
            {summary.stuckTasksCount !== undefined && (
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm col-span-2">
                <div className="flex items-center gap-3 mb-1">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tâches bloquées ≥15 min</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{summary.stuckTasksCount}</p>
              </div>
            )}
          </div>

          {/* Reassignments Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <CheckCircle2 size={18} className="text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">🔁 Réaffectations Intéligentes</h3>
            </div>
            
            <div className="space-y-3">
              {reassignments.length > 0 ? reassignments.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.taskId}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter",
                          item.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        )}>
                          {item.severity}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.taskTitle}</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mb-2">{item.reason}</p>
                      
                      {item.currentAssignee && item.suggestedAssignee && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-medium">{item.currentAssignee}</span>
                          <ArrowRight size={12} className="text-slate-400" />
                          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">{item.suggestedAssignee}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-slate-600">
                        {item.action === 'prioritize' && <Zap size={12} className="text-amber-500" />}
                        {item.action === 'split' && <Split size={12} className="text-indigo-500" />}
                        {item.action === 'delay' && <Clock size={12} className="text-slate-400" />}
                        {item.action === 'reassign' && <Split size={12} className="text-green-500" />}
                        {item.action === 'block_and_reassign' && <AlertCircle size={12} className="text-red-500" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.action}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">Aucune réaffectation nécessaire.</p>
              )}
            </div>
          </section>

          {/* Deadlines Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Calendar size={18} className="text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">📅 Ajustements de Deadlines</h3>
            </div>

            <div className="space-y-3">
              {deadlines.length > 0 ? deadlines.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  key={item.taskId}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-500"
                >
                  <h4 className="text-sm font-bold text-slate-900 mb-2">{item.taskTitle}</h4>
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      {item.oldDate}
                    </div>
                    <ArrowRight size={14} className="text-indigo-600" />
                    <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      {item.newDate}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Suggestion basée sur la charge de travail</p>
                </motion.div>
              )) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">Aucun ajustement requis.</p>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-white border-t border-slate-100">
          <button 
            onClick={() => onApply(suggestions)}
            className="w-full py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Zap size={16} />
            Appliquer les optimisations
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-4 font-medium">
            Les modifications respecteront les priorités critiques et les capacités humaines.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OptimizationPanel;
