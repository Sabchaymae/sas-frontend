import { memo } from 'react';
import { Eye, Pencil, Phone, Mail, Hash, MapPin, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { cn } from '../../utils/cn';
import { getRoleStyle, STATUS_STYLES } from '../../constants/users';

const UserCard = memo(({ user, onEdit, onView, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white p-5 rounded-sm border border-gray-100 transition-all group relative overflow-hidden">
      {/* top section */}
      <div className="flex items-start gap-4 mb-5">
        <div className="relative">
          {user.photo ? (
            <img src={user.photo} alt="" className="w-14 h-14 rounded-sm border border-gray-100 object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-sm border border-gray-100 bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-400 uppercase">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
          )}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
            user.statut === 'Actif' ? "bg-green-500" : "bg-gray-300"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-[#111827] truncate">{user.prenom} {user.nom}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-bold text-[#1428C9] bg-[#F0F3FF] px-2 py-0.5 rounded-sm border border-[#1428C9]/5">
              {user.identifiant}
            </span>
            <button 
              onClick={() => onToggleStatus && onToggleStatus(user.id)}
              title={user.statut === 'Actif' ? 'Désactiver le compte' : 'Activer le compte'}
              className="focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-95 text-left"
            >
              <Badge className={cn("scale-90 origin-left cursor-pointer shadow-sm hover:shadow hover:bg-opacity-80", STATUS_STYLES[user.statut])}>
                {user.statut}
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-3 mb-6">
        {user.email && (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-8 h-8 rounded-sm bg-[#F9FAFB] flex items-center justify-center shrink-0">
              <Mail size={14} />
            </div>
            <p className="text-xs font-medium truncate">{user.email}</p>
          </div>
        )}
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-8 h-8 rounded-sm bg-[#F9FAFB] flex items-center justify-center shrink-0">
            <Phone size={14} />
          </div>
          <p className="text-xs font-medium">{user.telephone}</p>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-8 h-8 rounded-sm bg-[#F9FAFB] flex items-center justify-center shrink-0">
            <MapPin size={14} />
          </div>
          <p className="text-xs font-medium truncate">{user.adresse || '-'}</p>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-8 h-8 rounded-sm bg-[#F9FAFB] flex items-center justify-center shrink-0">
            <Hash size={14} />
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getRoleStyle(user.role)}>{user.role}</Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(user)}
          className="flex-1 py-2.5"
          icon={Eye}
        >
          Voir
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(user)}
          className="flex-1 py-2.5"
          icon={Pencil}
        >
          Éditer
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(user)}
          className="w-10 h-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
          icon={Trash2}
          title="Supprimer"
        />
      </div>
    </div>
  );
});

export default UserCard;
