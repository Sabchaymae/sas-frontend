import React, { useState } from 'react';
import { X, Phone, Upload, Clock, Info } from 'lucide-react';

const ValidationDrawer = ({ isOpen, onClose, data, onConfirm }) => {
  const [fixedNumber, setFixedNumber] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen || !data) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleConfirm = () => {
    onConfirm(data);
    setFixedNumber('');
    setUploadedFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative w-[500px] h-full bg-white shadow-2xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-5 border-b border-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Validation du dossier</h2>
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
          {/* Client Summary */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-white flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt={data.client.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{data.client.name}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">CIN: {data.contact.cin}</p>
              <p className="text-[10px] font-medium text-slate-400">Inscrit le 12/10/2023</p>
            </div>
          </div>

          {/* Fixed Line Number */}
          <div className="mb-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
              Numéro de Ligne Fixe
            </span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={16} className="text-slate-300" />
              </div>
              <input
                type="text"
                value={fixedNumber}
                onChange={e => setFixedNumber(e.target.value)}
                placeholder="01 23 45 67 89"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-11 pr-4 text-sm font-extrabold text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5">
              <Info size={11} />
              Le numéro doit correspondre à la ligne d'installation prévue.
            </p>
          </div>

          {/* Contract Upload */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Charger le Contrat Signé
              </span>
            </div>

            {uploadedFile ? (
              <div className="border-2 border-emerald-200 bg-emerald-50 rounded-3xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-emerald-800 truncate">{uploadedFile.name}</p>
                  <p className="text-xs font-bold text-emerald-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition-all"
                  onClick={() => setUploadedFile(null)}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                className={`block border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 mx-auto mb-4 transition-transform hover:scale-105">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-black text-slate-900">Cliquer ou glisser-déposer</p>
                <p className="text-xs font-bold text-slate-400 mt-1">PDF, JPG (max. 10MB)</p>
              </label>
            )}
          </div>

          {/* Status Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Clock size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historique du Statut</span>
            </div>
            <div className="relative pl-6">
              <div className="absolute left-[5px] top-2 bottom-0 w-[2px] bg-slate-100" />
              <div className="relative mb-5">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-orange-400 border-2 border-white shadow-sm" />
                <p className="text-sm font-extrabold text-slate-900">Dossier Validé</p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Aujourd'hui, 09:45 par Système</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-blue-200 border-2 border-white shadow-sm" />
                <p className="text-sm font-bold text-slate-500">Dossier créé</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">12/10/2023, 16:30 par Ahmed M.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 flex flex-col gap-3">
          <button
            className="w-full py-5 rounded-2xl font-black text-base bg-blue-600 text-white shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all uppercase tracking-wider"
            onClick={handleConfirm}
          >
            Confirmer la validation
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

export default ValidationDrawer;
