import { memo } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { cn } from '../../utils/cn';
import { getRoleStyle, STATUS_STYLES } from '../../constants/users';


const UserTableRow = memo(({ user, onEdit, onView, onDelete, onToggleStatus, canRead = false, canEdit = false, canDelete = false }) => {

  return (
    <tr className="hover:bg-[#F0F3FF]/50 hover:scale-[1.01] hover:z-10 transition-all duration-300 ease-in-out group border-b border-gray-50 last:border-0 relative animate-in fade-in slide-in-up">
      {/* 1. Photo */}
      <td className="px-2 py-3">
        <div className="relative w-8 h-8">
          {user.photo ? (
            <img src={user.photo} alt="" className="w-8 h-8 rounded-sm border border-gray-100 bg-white object-cover transition-all duration-300" />
          ) : (
            <div className="w-8 h-8 rounded-sm border border-gray-100 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase transition-all duration-300 group-hover:bg-slate-100">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
          )}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white",
            user.statut === 'Actif' ? "bg-green-500" : "bg-gray-300"
          )} />
        </div>
      </td>

      {/* 2. Nom & Prénom */}
      <td className="px-2 py-3">
        <p className="text-[12px] font-bold text-[#111827] transition-colors group-hover:text-[#1428C9] leading-tight">{user.prenom} {user.nom}</p>
      </td>

      {/* 3. Identifiant */}
      <td className="px-2 py-3">
        <span className="text-[9px] font-bold text-[#1428C9] bg-[#F0F3FF] px-1.5 py-0.5 rounded-sm border border-[#1428C9]/10 whitespace-nowrap transition-all duration-300">
          {user.identifiant}
        </span>
      </td>

      {/* 4. Email */}
      <td className="px-2 py-3">
        <p className="text-[11px] text-gray-500 font-medium truncate max-w-[120px] group-hover:text-gray-700 transition-colors duration-200" title={user.email}>
          {user.email || '-'}
        </p>
      </td>

      {/* 5. Téléphone */}
      <td className="px-2 py-3">
        <p className="text-[11px] font-bold text-[#111827] whitespace-nowrap">{user.telephone}</p>
      </td>

      {/* 6. CIN / ID */}
      <td className="px-2 py-3">
        <p className="text-[11px] font-medium text-gray-500 whitespace-nowrap">{user.cin || '-'}</p>
      </td>

      {/* 6.1 Adresse */}
      <td className="px-2 py-3">
        <p className="text-[11px] font-medium text-gray-500 truncate max-w-[120px]" title={user.adresse}>
          {user.adresse || '-'}
        </p>
      </td>

      {/* 7. Rôle */}
      <td className="px-2 py-3">
        <Badge className={cn("text-[10px] px-1.5 py-0 whitespace-nowrap transition-all duration-300", getRoleStyle(user.role))}>{user.role}</Badge>
      </td>

      {/* 8. Date Naiss. */}
      <td className="px-2 py-3 text-center">
        <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{user.dateNaissance || '-'}</p>
      </td>

      {/* 9. Création */}
      <td className="px-2 py-3 text-center">
        <p className="text-[10px] text-gray-400 font-medium italic whitespace-nowrap">{user.dateCreation}</p>
      </td>

      {/* 10. Statut */}
      <td className="px-2 py-3">
        <button
          onClick={() => onToggleStatus && onToggleStatus(user.id)}
          title={user.statut === 'Actif' ? 'Désactiver le compte' : 'Activer le compte'}
          className="focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-95 text-left"
        >
          <Badge className={cn("text-[10px] px-1.5 py-0 whitespace-nowrap transition-all duration-300 cursor-pointer shadow-sm hover:shadow hover:bg-opacity-80", STATUS_STYLES[user.statut])}>
            {user.statut}
          </Badge>
        </button>
      </td>

      {/* 11. Actions */}
      <td className="px-2 py-3 text-right">
        <div className="flex items-center justify-end gap-0.5 transition-all duration-300">
          {canRead && (
            <Button variant="ghost" size="sm" onClick={() => onView(user)} title="Voir le profil" icon={Eye} className="w-8 h-8 p-0 text-gray-400 hover:text-[#1428C9] hover:bg-[#F0F3FF]" />
          )}
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(user)} title="Modifier" icon={Pencil} className="w-8 h-8 p-0 text-gray-400 hover:text-orange-600 hover:bg-orange-50" />
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(user)} title="Supprimer" icon={Trash2} className="w-8 h-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50" />
          )}
          {!canRead && !canEdit && !canDelete && (
            <span className="text-xs text-gray-300 italic pr-1">—</span>
          )}
        </div>
      </td>
    </tr>
  );
});

export default UserTableRow;
