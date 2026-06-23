import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

const MODULES = [
  'Utilisateurs', 'Souscriptions', 'Stock', 'Comptabilité', 
  'Tâches', 'Temps', 'Agences', 'Communication', 'Autorisation'
];

const ACTIONS = [
  'Lecture', 'Création', 'Modification', 'Suppression', 'Validation', 'Export'
];

const PermissionMatrix = ({ permissions, onToggle, onToggleModule, onToggleAction }) => {
  return (
    <div className="bg-white rounded-sm border border-gray-100 overflow-hidden transition-all shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-6 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap sticky left-0 z-10 bg-[#F8FAFC] border-r border-gray-100">
                Actions \ Modules
              </th>
              {MODULES.map((module) => {
                const modulePerms = permissions[module] || {};
                const isAllChecked = ACTIONS.every(action => modulePerms[action]);
                return (
                  <th key={module} className="px-4 py-6 bg-[#F8FAFC]">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{module}</span>
                      <button
                        onClick={() => onToggleModule(module, ACTIONS)}
                        title={`Tout cocher pour ${module}`}
                        className={clsx(
                          "w-4 h-4 flex items-center justify-center border-2 transition-all",
                          isAllChecked ? "bg-primary border-primary" : "bg-white border-gray-300 hover:border-primary/50"
                        )}
                      >
                        {isAllChecked && <Check size={10} className="text-white stroke-[4]" />}
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ACTIONS.map((action) => {
              return (
                <tr key={action} className="transition-colors hover:bg-[#F8FAFC]/50 group">
                  <td className="px-6 py-4 text-sm font-bold text-[#111827] whitespace-nowrap sticky left-0 bg-white group-hover:bg-[#F8FAFC]/50 z-10 transition-colors border-r border-gray-100">
                    <span className="uppercase tracking-tight text-[11px]">{action}</span>
                  </td>
                  {MODULES.map((module) => {
                    const isChecked = permissions[module]?.[action] || false;
                    return (
                      <td key={`${module}-${action}`} className="px-4 py-4 text-center">
                        <button
                          onClick={() => onToggle(module, action)}
                          className={clsx(
                            "w-5 h-5 transition-all duration-200 flex items-center justify-center mx-auto border-2",
                            isChecked 
                              ? "bg-primary border-primary scale-110 shadow-sm shadow-primary/20" 
                              : "bg-white border-gray-200 hover:border-primary/30"
                          )}
                        >
                          {isChecked && <Check size={14} className="text-white stroke-[3]" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionMatrix;
