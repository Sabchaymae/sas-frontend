import { CheckCircle, Copy } from 'lucide-react';
import Button from '../common/Button';
import { useState } from 'react';

const UserCredentialsModal = ({ isOpen, onClose, credentials }) => {
  const [copied, setCopied] = useState({ identifiant: false, mot_de_passe: false, both: false });

  if (!isOpen) return null;

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [field]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [field]: false })), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyBoth = async () => {
    try {
      const combined = `Identifiant: ${credentials?.identifiant}\nMot de passe: ${credentials?.mot_de_passe}`;
      await navigator.clipboard.writeText(combined);
      setCopied(prev => ({ ...prev, both: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, both: false })), 2000);
    } catch (err) {
      console.error('Failed to copy both:', err);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80] transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[500px] bg-white z-[90] rounded-sm transition-all duration-300 animate-in zoom-in-95 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 rounded-full bg-green-50 text-green-600">
            <CheckCircle size={32} />
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#111827]">Utilisateur créé avec succès</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
              Voici les identifiants de connexion :
            </p>
          </div>

          <div className="w-full space-y-4 mt-4">
            <div className="bg-slate-50 p-4 rounded-sm border border-slate-200">
              <div className="flex justify-between items-center gap-3">
                <div className="flex-1 text-left">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identifiant</label>
                  <p className="text-sm font-mono text-[#111827] mt-1">{credentials?.identifiant}</p>
                </div>
                <button
                  onClick={() => handleCopy(credentials?.identifiant, 'identifiant')}
                  className="p-2 rounded-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  {copied.identifiant ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-sm border border-slate-200">
              <div className="flex justify-between items-center gap-3">
                <div className="flex-1 text-left">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mot de passe</label>
                  <p className="text-sm font-mono text-[#111827] mt-1">{credentials?.mot_de_passe}</p>
                </div>
                <button
                  onClick={() => handleCopy(credentials?.mot_de_passe, 'mot_de_passe')}
                  className="p-2 rounded-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  {copied.mot_de_passe ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleCopyBoth}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1428C9] text-white rounded-sm hover:bg-[#1428C9]/90 transition-all"
            >
              {copied.both ? (
                <CheckCircle size={16} className="text-green-300" />
              ) : (
                <Copy size={16} />
              )}
              <span className="font-bold text-sm">
                {copied.both ? 'Copié !' : 'Copier les deux identifiants'}
              </span>
            </button>
          </div>

          <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
};

export default UserCredentialsModal;
