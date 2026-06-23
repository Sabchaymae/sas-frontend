import { memo, useMemo } from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { USER_ROLES, USER_STATUS } from '../../constants/users';

const UserFilters = memo(({ userCount, searchQuery, onSearchChange, filters, onFilterChange, onReset, onNewUser, availableRoles = [] }) => {
  const roleOptions = useMemo(() => [
    { value: '', label: 'Tous les rôles' },
    ...availableRoles
  ], [availableRoles]);

  const statusOptions = useMemo(() => [
    { value: '', label: 'Tous les statuts' },
    ...Object.values(USER_STATUS).map(status => ({ value: status, label: status }))
  ], []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">Gestion des utilisateurs</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="bg-[#1428C9]/5 text-[#1428C9] px-3 py-1 rounded-sm font-bold text-[11px] border border-[#1428C9]/10 transition-all duration-300">
              {userCount} utilisateurs au total
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-200 hidden xs:block" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Mise à jour en temps réel</span>
          </div>
        </div>
        <Button onClick={onNewUser} icon={Plus} className="w-full sm:w-auto h-12 active:scale-95 transition-all duration-300">
          Nouvel utilisateur
        </Button>
      </div>

      <div className="bg-white p-2 md:p-3 rounded-sm border border-slate-100 transition-all duration-300 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <Input
            icon={Search}
            placeholder="Rechercher par nom, identifiant..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            containerClassName="w-full lg:flex-1"
          />

          {/* Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 w-full lg:w-auto">
            <Select
              options={roleOptions}
              value={filters.role}
              onChange={(e) => onFilterChange('role', e.target.value)}
              containerClassName="w-full lg:min-w-[180px]"
            />
            <Select
              options={statusOptions}
              value={filters.statut}
              onChange={(e) => onFilterChange('statut', e.target.value)}
              containerClassName="w-full lg:min-w-[180px]"
            />

            {/* Reset button */}
            <button
              onClick={onReset}
              title="Réinitialiser les filtres"
              className="flex items-center justify-center w-12 h-12 bg-[#1428C9] text-white rounded-sm hover:bg-[#1428C9]/90 active:scale-90 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) shrink-0 shadow-lg shadow-[#1428C9]/10"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UserFilters;
