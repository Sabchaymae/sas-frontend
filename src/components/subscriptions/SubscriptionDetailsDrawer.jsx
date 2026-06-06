import React from 'react';
import { X, Paperclip, Clock } from 'lucide-react';

const SubscriptionDetailsDrawer = ({ isOpen, onClose, data, showActions, onValidate, onRefuse }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative w-[520px] h-full bg-white shadow-2xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-5 border-b border-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Détails du dossier</h2>
              <p className="text-sm font-black text-blue-500 mt-1">{data.id}</p>
            </div>
            <button
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 px-8 py-6">
          {/* Client Header */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt={data.client.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{data.client.name}</h3>
              <p className="text-sm font-bold text-slate-400 mt-1">CIN: {data.contact.cin}</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Inscrit le 12/10/2023</p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-8">
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Téléphone</span>
              <span className="text-sm font-extrabold text-slate-900">{data.contact.phone}</span>
            </div>
            <div className="h-px bg-slate-200/60 w-full" />
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Adresse</span>
              <span className="text-sm font-extrabold text-slate-900">{data.address}</span>
            </div>
            <div className="h-px bg-slate-200/60 w-full" />
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Numéro fixe</span>
              <span className="text-sm font-extrabold text-slate-900">005487xxxxxxxxxxxx</span>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pièces Jointes</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden border-2 border-slate-100 hover:border-blue-200 transition-all cursor-pointer">
                <div className="h-28 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200"
                    className="rounded shadow-sm h-20 object-cover"
                    alt="CIN"
                  />
                </div>
                <div className="p-3 bg-white">
                  <span className="text-[10px] font-black text-slate-500">CIN_Recto.jpg</span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border-2 border-slate-100 hover:border-blue-200 transition-all cursor-pointer">
                <div className="h-28 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                  <div className="w-full h-full bg-white rounded border border-slate-200 p-2 flex flex-col gap-1.5">
                    <div className="h-1.5 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-1.5 w-1/2 bg-slate-150 rounded"></div>
                    <div className="h-1.5 w-2/3 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <span className="text-[10px] font-black text-slate-500">Contrat_Signed.pdf</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historique du Statut</span>
            </div>
            <div className="relative pl-6">
              <div className="absolute left-[5px] top-2 bottom-0 w-[2px] bg-slate-100" />
              <div className="relative mb-5">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-orange-400 border-2 border-white shadow-sm" />
                <p className="text-sm font-extrabold text-slate-900">En attente de validation</p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Aujourd'hui, 09:45 par Système</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-blue-200 border-2 border-white shadow-sm" />
                <p className="text-sm font-bold text-slate-500">Dossier créé</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">12/10/2023, 16:30 par Ahmed M.</p>
              </div>
            </div>
          </div>

          {/* Refusal alert */}
          <div className="bg-red-50 border-l-4 border-red-400 rounded-r-2xl p-4">
            <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-2">Motif de Refus Potentiel</p>
            <p className="text-sm font-bold text-red-600 leading-relaxed">
              Le justificatif de domicile fourni est daté de plus de 3 mois. Veuillez demander une version récente au client pour validation finale.
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-8 py-6 border-t border-slate-50">
          {showActions ? (
            <div className="flex gap-3">
              <button
                className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                onClick={() => onRefuse(data)}
              >
                Refuser
              </button>
              <button
                className="flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                onClick={() => onValidate(data)}
              >
                Valider
              </button>
            </div>
          ) : (
            <button
              className="w-full py-4 rounded-2xl font-black text-sm bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-wider"
              onClick={onClose}
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailsDrawer;
