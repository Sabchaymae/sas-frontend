import React from 'react';
import { clsx } from 'clsx';

const PAGES = [
  { id: 'global_config', label: 'Configuration Globale', description: 'Accès aux paramètres système' },
  { id: 'log_management', label: 'Gestion des Logs', description: 'Visualisation des traces techniques' },
  { id: 'advanced_billing', label: 'Facturation Avancée', description: 'Gestion des paiements et factures' },
  { id: 'bi_analytics', label: 'Analytique BI', description: 'Rapports et business intelligence' },
  { id: 'customer_support', label: 'Support Client', description: 'Accès aux tickets et live chat' },
  { id: 'ia_engine', label: 'Moteur d’IA', description: 'Configuration des modèles prédictifs' },
];

const ToggleSwitch = ({ active, onToggle }) => (
  <button
    onClick={onToggle}
    className={clsx(
      "relative inline-flex h-6 w-11 items-center transition-colors duration-300 ease-in-out outline-none border-2",
      active ? "bg-primary border-primary" : "bg-gray-100 border-gray-300"
    )}
  >
    <span
      className={clsx(
        "inline-block h-4 w-4 bg-white transition-transform duration-300 ease-in-out",
        active ? "translate-x-5" : "translate-x-1"
      )}
    />
  </button>
);

const AdditionalPermissions = ({ activePages, onTogglePage }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PAGES.map((page) => (
        <div 
          key={page.id} 
          className="bg-white p-5 border border-gray-200 flex items-center justify-between group hover:border-primary/50 transition-all hover:bg-gray-50"
        >
          <div className="flex flex-col gap-1 pr-4">
            <h4 className="text-sm font-bold text-text-dark group-hover:text-primary transition-colors">
              {page.label}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium leading-tight">{page.description}</p>
          </div>
          <ToggleSwitch 
            active={activePages[page.id]} 
            onToggle={() => onTogglePage(page.id)} 
          />
        </div>
      ))}
    </div>
  );
};

export default AdditionalPermissions;
