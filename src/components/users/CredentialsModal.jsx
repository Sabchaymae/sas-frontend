import { CheckCircle2, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import Button from '../common/Button';

const CredentialsModal = ({ isOpen, onClose, credentials }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);

  if (!isOpen || !credentials) return null;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else if (type === 'pass') {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else {
      setCopiedBoth(true);
      setTimeout(() => setCopiedBoth(false), 2000);
    }
  };

  const copyBoth = () => {
    const text = `Identifiant: ${credentials.identifiant}\nMot de passe: ${credentials.generated_password}`;
    handleCopy(text, 'both');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[420px] bg-white z-[110] rounded-sm transition-all duration-300 animate-in zoom-in-95 p-8 shadow-2xl flex flex-col items-center">
        <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>

        <h3 className="text-xl font-bold text-[#111827] text-center mb-2">Utilisateur créé avec succès</h3>
        <p className="text-sm text-gray-400 font-medium text-center mb-8">Voici les identifiants de connexion :</p>

        <div className="w-full space-y-6 mb-10">
          <div className="relative">
            <label className="text-[10px] font-bold text-[#1428C9] uppercase tracking-widest mb-2 block">Identifiant</label>
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-sm">
              <span className="text-sm font-bold text-slate-700 font-mono tracking-wider">{credentials.identifiant}</span>
              <button 
                onClick={() => handleCopy(credentials.identifiant, 'id')}
                className="text-slate-400 hover:text-[#1428C9] transition-colors"
              >
                {copiedId ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-[#1428C9] uppercase tracking-widest mb-2 block">Mot de passe</label>
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-sm">
              <span className="text-sm font-bold text-slate-700 font-mono tracking-wider">{credentials.generated_password}</span>
              <button 
                onClick={() => handleCopy(credentials.generated_password, 'pass')}
                className="text-slate-400 hover:text-[#1428C9] transition-colors"
              >
                {copiedPass ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>

        <Button 
          variant="primary" 
          fullWidth 
          className="h-12 text-sm font-bold rounded-sm mb-6 flex items-center justify-center gap-2"
          onClick={copyBoth}
        >
          {copiedBoth ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          {copiedBoth ? 'Copié !' : 'Copier les deux identifiants'}
        </Button>

        <button 
          onClick={onClose}
          className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
        >
          Fermer
        </button>
      </div>
    </>
  );
};

export default CredentialsModal;
