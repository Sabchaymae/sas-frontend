import { X, Mail, Phone, Calendar, MapPin, CreditCard, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { ROLE_STYLES, STATUS_STYLES } from '../../constants/users';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

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
                <Badge className={ROLE_STYLES[user.role]}>{user.role}</Badge>
                <Badge className={STATUS_STYLES[user.statut]}>{user.statut}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
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
