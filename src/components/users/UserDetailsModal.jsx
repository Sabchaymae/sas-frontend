<<<<<<< HEAD
import { X, Mail, Phone, Calendar, MapPin, CreditCard, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { ROLE_STYLES, STATUS_STYLES } from '../../constants/users';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

=======
import { X, Mail, Phone, Calendar, MapPin, CreditCard, Shield, Copy, CheckCircle, Key, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { getRoleStyle, STATUS_STYLES } from '../../constants/users';
import { useState } from 'react';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  const [copied, setCopied] = useState({ identifiant: false, mot_de_passe: false, both: false });

  if (!isOpen || !user) return null;

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
      const combined = `Identifiant: ${user.generatedCredentials?.identifiant}\nMot de passe: ${user.generatedCredentials?.mot_de_passe}`;
      await navigator.clipboard.writeText(combined);
      setCopied(prev => ({ ...prev, both: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, both: false })), 2000);
    } catch (err) {
      console.error('Failed to copy both:', err);
    }
  };

>>>>>>> import/master
  const infoGroups = [
    {
      title: 'Informations personnelles',
      items: [
        { icon: Mail, label: 'Email', value: user.email },
        { icon: Phone, label: 'Téléphone', value: user.telephone },
        { icon: Calendar, label: 'Date de naissance', value: user.dateNaissance || 'Non renseigné' },
        { icon: MapPin, label: 'Adresse', value: user.adresse || 'Non renseigné' },
      ]
    },
    {
      title: 'Informations professionnelles',
      items: [
        { icon: CreditCard, label: 'CIN / Identité', value: user.cin || 'Non renseigné' },
        { icon: Shield, label: 'Rôle', value: user.role },
        { icon: Calendar, label: 'Date de création', value: user.dateCreation },
      ]
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80] transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[600px] bg-white z-[90] rounded-sm transition-all duration-300 animate-in zoom-in-95 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header with Avatar */}
        <div className="p-6 sm:p-8 border-b border-gray-50 bg-[#F9FAFB] rounded-t-sm relative">
          <Button variant="ghost" size="sm" onClick={onClose} icon={X} className="absolute right-4 top-4 sm:right-6 sm:top-6" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              {user.photo ? (
                <img src={user.photo} alt="" className="w-20 h-20 rounded-sm border-4 border-white object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-sm border-4 border-white bg-slate-50 flex items-center justify-center text-xl font-bold text-slate-400 uppercase">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </div>
              )}
              <div className={cn(
                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white",
                user.statut === 'Actif' ? "bg-green-500" : "bg-gray-300"
              )} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[#111827] truncate sm:whitespace-normal">{user.prenom} {user.nom}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2">
<<<<<<< HEAD
                <Badge className={ROLE_STYLES[user.role]}>{user.role}</Badge>
=======
                <Badge className={getRoleStyle(user.role)}>{user.role}</Badge>
>>>>>>> import/master
                <Badge className={STATUS_STYLES[user.statut]}>{user.statut}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
<<<<<<< HEAD
=======
          {user.generatedCredentials && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-sm">
              <h3 className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Key size={14} />
              Identifiants de connexion (à conserver)
            </h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-sm border border-amber-200">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1 text-left">
                      <label className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Identifiant</label>
                      <p className="text-sm font-mono text-[#111827] mt-1">{user.generatedCredentials.identifiant}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(user.generatedCredentials.identifiant, 'identifiant')}
                      className="p-2 rounded-sm bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 transition-all"
                    >
                      {copied.identifiant ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-sm border border-amber-200">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1 text-left">
                      <label className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Mot de passe</label>
                      <p className="text-sm font-mono text-[#111827] mt-1">{user.generatedCredentials.mot_de_passe}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(user.generatedCredentials.mot_de_passe, 'mot_de_passe')}
                      className="p-2 rounded-sm bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 transition-all"
                    >
                      {copied.mot_de_passe ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleCopyBoth}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-all"
                >
                  {copied.both ? (
                    <CheckCircle size={16} className="text-green-200" />
                  ) : (
                    <Copy size={16} />
                  )}
                  <span className="font-bold text-xs">
                    {copied.both ? 'Copié !' : 'Copier les deux identifiants'}
                  </span>
                </button>
              </div>
            </div>
          )}
          
>>>>>>> import/master
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
            {infoGroups.map((group) => (
              <div key={group.title} className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50 pb-2">
                  {group.title}
                </h3>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.label} className="flex gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#F0F3FF] flex items-center justify-center text-[#1428C9] shrink-0">
                        <item.icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-[#111827] mt-0.5 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 border-t border-gray-50 flex justify-end">
          <Button variant="primary" onClick={onClose} className="w-full sm:w-auto px-8">
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
};

export default UserDetailsModal;
