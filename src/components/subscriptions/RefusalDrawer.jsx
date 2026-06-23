import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const REFUSAL_REASONS = [
  'Justificatif de domicile expiré (plus de 3 mois)',
  'CIN non valide ou illisible',
  'Dossier incomplet — pièces manquantes',
  'Informations incohérentes avec les documents',
  'Client déjà inscrit avec un autre dossier',
  'Zone non couverte par l\'opérateur sélectionné',
  'Autre motif (voir commentaire)',
];

const RefusalDrawer = ({ isOpen, onClose, data, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen || !data) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    onConfirm(selectedReason + (comment ? ` — ${comment}` : ''));
    setSelectedReason('');
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Drawer */}
      <div
        className="relative w-[480px] h-full bg-white shadow-2xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Refus du dossier</h2>
              <p className="text-sm font-black text-red-400 mt-1">{data.id}</p>
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
          {/* Client summary */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt={data.client.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{data.client.name}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">CIN: {data.contact.cin}</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 mb-8">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-bold text-red-600">
              Cette action est irréversible. Le dossier sera marqué comme <strong>refusé</strong> et l'animateur sera notifié.
            </p>
          </div>

          {/* Reason selection */}
          <div className="mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">
              MOTIF DE REFUS <span className="text-red-400">*</span>
            </span>
            <div className="flex flex-col gap-2">
              {REFUSAL_REASONS.map((reason, i) => (
                <button
                  key={i}
                  className={`text-left px-4 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                    selectedReason === reason
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedReason(reason)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedReason === reason ? 'border-red-400' : 'border-slate-300'
                    }`}>
                      {selectedReason === reason && (
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                      )}
                    </div>
                    {reason}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional comment */}
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
              COMMENTAIRE ADDITIONNEL (optionnel)
            </span>
            <textarea
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-red-300 focus:bg-white transition-all resize-none"
              placeholder="Précisez ici si nécessaire..."
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 flex flex-col gap-3">
          <button
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
              selectedReason
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-100'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={!selectedReason}
          >
            Confirmer le refus
          </button>
          <button
            className="text-sm font-black text-slate-400 hover:text-slate-600 py-2 transition-all uppercase tracking-widest"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefusalDrawer;
