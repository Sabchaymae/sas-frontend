import React, { useState, useMemo } from 'react';
import RoleList from './components/RoleList';
import PermissionMatrix from './components/PermissionMatrix';
import UserList from './components/UserList';
import { Save, ShieldCheck, X } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../services/api';
import { USER_ROLES } from '../../constants/users';

const RolesPermissionsPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleUsersData, setRoleUsersData] = useState([]); // Users for the selected role

  // Single selection: string instead of array
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const [permissions, setPermissions] = useState({});
  const [editingRole, setEditingRole] = useState(null);


  // Fetch Roles on mount
  React.useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {

      const response = await api.get('api/v1/roles-permissions/roles');
      if (response.success) {
        const apiRoles = response.roles.map(r => ({
          ...r,
          users: r.users_count || 0
        }));

        // Merge with static roles from constants
        const staticRoles = Object.values(USER_ROLES).map((roleName, index) => ({
          id: `static-${roleName}`,
          name: roleName,
          color: index % 2 === 0 ? 'bg-primary' : 'bg-orange-500',
          users: 0,
          isStatic: true
        }));

        // Filter out static roles that already exist in API roles (by name)
        const filteredStatic = staticRoles.filter(
          sr => !apiRoles.some(ar => (ar.name || '').toLowerCase() === (sr.name || '').toLowerCase())
        );

        const combinedRoles = [...apiRoles, ...filteredStatic];
        setRoles(combinedRoles);

        // Default to first role if none selected
        if (!selectedRole && combinedRoles.length > 0) {
          setSelectedRole(combinedRoles[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Fetch users when selectedRole changes or step 2 reached
  React.useEffect(() => {
    if (selectedRole && step === 2) {
      fetchRoleUsers();
    }
  }, [selectedRole, step, searchQuery]);


  const fetchRoleUsers = async () => {
    try {
      const response = await api.get(`api/v1/roles-permissions/roles/${selectedRole}/users`, {
        params: { search: searchQuery }
      });
      if (response.success) {
        setRoleUsersData(response.users);
      }
    } catch (error) {
      console.error("Error fetching role users:", error);
    }
  };

  // Fetch permissions when step 3 reached
  React.useEffect(() => {
    if (step === 3 && selectedRole) {
      fetchPermissions();
    }
  }, [step, selectedRole, selectedUsers]);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('api/v1/roles-permissions/permissions', {
        params: {
          role_id: selectedRole,
          user_ids: selectedUsers.map(u => u.id)
        }
      });
      if (response.success) {
        setPermissions(response.permissions);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  // Roles for display
  const displayRoles = roles;

  // Handle single role selection
  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    // Clear user selection when role changes
    setSelectedUsers([]);
  };

  // Toggle a user in/out of selected set
  const handleToggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  // Filtered users: show users belonging to the selected role
  const roleUsers = roleUsersData;

  // Summary labels
  const selectedRoleName = displayRoles.find(r => r.id == selectedRole)?.name;

  const handleTogglePermission = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module]?.[action]
      }
    }));
  };

  const handleToggleModule = (module, ACTIONS) => {
    setPermissions(prev => {
      const modulePerms = prev[module] || {};
      const allChecked = ACTIONS.every(action => modulePerms[action]);
      const newModulePerms = {};
      ACTIONS.forEach(action => {
        newModulePerms[action] = !allChecked;
      });
      return {
        ...prev,
        [module]: newModulePerms
      };
    });
  };

  const handleToggleAction = (action, MODULES) => {
    setPermissions(prev => {
      const newPerms = { ...prev };
      const allChecked = MODULES.every(module => prev[module]?.[action]);
      MODULES.forEach(module => {
        newPerms[module] = {
          ...(newPerms[module] || {}),
          [action]: !allChecked
        };
      });
      return newPerms;
    });
  };


  const handleAddRole = async () => {
    if (newRoleName.trim() === '') return;
    try {
      // Generate a beautiful, unique dot background color for Access Management
      const backendColors = [
        'bg-purple-500',
        'bg-orange-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-pink-500',
        'bg-fuchsia-500',
        'bg-violet-500',
      ];
      let hash = 0;
      const normalized = newRoleName.trim().toLowerCase();
      for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
      }
      const backendColor = backendColors[Math.abs(hash) % backendColors.length];

      const response = await api.post('api/v1/roles-permissions/roles', {
        name: newRoleName,
        color: backendColor
      });
      if (response.success) {
        setIsModalOpen(false);
        setNewRoleName('');
        await fetchRoles(); // Refresh roles list
        setSelectedRole(response.role.id);
      }
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Erreur lors de la création du rôle.");
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || newRoleName.trim() === '') return;
    try {
      const response = await api.put(`api/v1/roles-permissions/roles/${editingRole.id}`, {
        name: newRoleName,
      });
      if (response.success) {
        setEditingRole(null);
        setNewRoleName('');
        await fetchRoles();
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Erreur lors de la mise à jour du rôle.");
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) return;
    try {
      const response = await api.delete(`api/v1/roles-permissions/roles/${roleId}`);
      if (response.success) {
        if (selectedRole === roleId) setSelectedRole(null);
        await fetchRoles();
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Erreur lors de la suppression du rôle.");
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      // We find the role name to send it to the users update endpoint
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      const response = await api.put(`api/v1/users/${userId}`, {
        role: role.name.toLowerCase()
      });

      if (response) {
        // Refresh the list
        await fetchRoleUsers();
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Erreur lors de l'attribution du rôle.");
    }
  };


  const handleSavePermissions = async () => {
    setLoading(true);
    try {
      const response = await api.post('api/v1/roles-permissions/permissions/sync', {
        role_id: selectedRole,
        user_ids: selectedUsers.map(u => u.id),
        permissions: permissions
      });
      if (response.success) {
        setStep(1); // Return to step 1 as requested
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      alert("Erreur lors de la sauvegarde des permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-8 pb-32">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827] tracking-tight">Gestion des accès</h1>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
              <span className="bg-[#1428C9]/5 text-[#1428C9] px-3 py-1 rounded-sm font-bold text-[11px] border border-[#1428C9]/10 transition-all duration-300">
                {displayRoles.length} rôles au total
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Configuration centralisée</span>
            </p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 border-b border-gray-100 pb-4">
          <StepIndicator number={1} label="Rôles" active={step >= 1} current={step === 1} onClick={() => setStep(1)} badge={selectedRole ? 1 : 0} />
          <div className="h-px w-10 bg-gray-200" />
          <StepIndicator number={2} label="Collaborateurs" active={step >= 2} current={step === 2} onClick={() => setStep(2)} badge={selectedUsers.length} />
          <div className="h-px w-10 bg-gray-200" />
          <StepIndicator number={3} label="Permissions" active={step >= 3} current={step === 3} onClick={() => step >= 2 && setStep(3)} disabled={step < 2} />
        </div>

        {/* Step content */}
        <div className="bg-white rounded-sm border border-gray-100 p-6 min-h-[50vh] transition-all">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-500 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                <div>
                  <h2 className="text-lg font-bold text-text-dark tracking-tight">Étape 1 : Choisir un rôle</h2>
                  <p className="text-xs text-gray-500 mt-1">Sélectionnez le rôle à configurer</p>
                </div>
                <div className="flex items-center gap-4">
                  {selectedRole && (
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
                    >
                      Désélectionner
                    </button>
                  )}
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedRole}
                    className="px-8 py-3 bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Suivant →
                  </button>
                </div>
              </div>

              <RoleList
                roles={displayRoles}
                selectedRoles={selectedRole ? [selectedRole] : []}
                onToggleRole={handleSelectRole}
                onDoubleClickRole={(roleId) => {
                  handleSelectRole(roleId);
                  setStep(2);
                }}
                onAddRole={() => {
                  setEditingRole(null);
                  setNewRoleName('');
                  setIsModalOpen(true);
                }}
                onEditRole={(role) => {
                  setEditingRole(role);
                  setNewRoleName(role.name);
                  setIsModalOpen(true);
                }}
                onDeleteRole={handleDeleteRole}
              />


              <div className="mt-8 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400">
                  {!selectedRole
                    ? 'Veuillez sélectionner un rôle.'
                    : `Rôle sélectionné : ${selectedRoleName}`}
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <div>
                  <h2 className="text-lg font-bold text-text-dark tracking-tight">Étape 2 : Définir la cible</h2>
                  <p className="text-xs text-gray-500 mt-1">Sélection multiple — {selectedUsers.length} collaborateur(s) sélectionné(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-100 text-gray-600 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                    ← Retour
                  </button>
                  <button onClick={() => setStep(3)} className="px-8 py-3 bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors">
                    {selectedUsers.length > 0
                      ? `Configurer ${selectedUsers.length} →`
                      : 'Configurer le groupe →'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Rôle filtré : <strong className="text-primary font-black">{selectedRoleName}</strong>
                </p>
                {selectedUsers.length > 0 && (
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
                  >
                    Tout déselectionner
                  </button>
                )}
              </div>

              <UserList
                users={roleUsers}
                selectedUserIds={selectedUsers.map(u => u.id)}
                onToggleUser={handleToggleUser}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                roles={roles}
                onAssignRole={handleAssignRole}
              />

            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <div>
                  <h2 className="text-lg font-bold text-text-dark tracking-tight">
                    Étape 3 : Permissions {selectedUsers.length > 0 ? 'individuelles' : 'de groupe'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedUsers.length > 0
                      ? `Appliqué à : ${selectedUsers.length} collaborateur(s)`
                      : `Appliqué au rôle : ${selectedRoleName}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-100 text-gray-600 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                    ← Retour
                  </button>
                  <button
                    onClick={handleSavePermissions}
                    disabled={loading}
                    className="px-10 py-3 bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors flex items-center gap-3 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? '...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedUsers.length > 0
                  ? selectedUsers.map(u => (
                    <span key={u.id} className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold uppercase">
                      {u.avatar ? (
                        <img src={u.avatar} className="w-4 h-4 object-cover" alt="" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-200" />
                      )}
                      {(u.name || 'Utilisateur').split(' ')[0]}
                    </span>
                  ))
                  : (
                    <span className="px-3 py-1 bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase">
                      {selectedRoleName}
                    </span>
                  )
                }
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Matrice des modules</h3>
                <PermissionMatrix
                  permissions={permissions}
                  onToggle={handleTogglePermission}
                  onToggleModule={handleToggleModule}
                  onToggleAction={handleToggleAction}
                />

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border border-gray-200 flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-text-dark">
                {editingRole ? 'Modifier le rôle' : 'Ajouter un nouveau rôle'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRole(null);
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nom du rôle</label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (editingRole ? handleUpdateRole() : handleAddRole())}
                placeholder="Ex: Responsable RH"
                autoFocus
                className="w-full border-2 border-gray-200 p-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRole(null);
                }}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-600 font-bold text-sm uppercase hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleAddRole}
                disabled={!newRoleName.trim()}
                className="px-5 py-2.5 bg-primary text-white font-bold text-sm uppercase hover:bg-primary/90 disabled:opacity-50"
              >
                {editingRole ? 'Enregistrer' : 'Créer'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

/* Step indicator with optional badge */
const StepIndicator = ({ number, label, active, current, onClick, disabled, badge }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "flex items-center gap-3 px-2 py-1 transition-colors",
      disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer group"
    )}
  >
    <div className="relative">
      <div className={clsx(
        "w-8 h-8 flex items-center justify-center text-xs font-bold transition-all",
        current ? "bg-primary text-white border-2 border-primary" :
          active ? "bg-primary/10 text-primary border-2 border-primary/20 group-hover:border-primary/40" :
            "bg-gray-100 text-gray-400 border-2 border-gray-200"
      )}>
        {number}
      </div>
      {badge > 0 && (
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-white text-[9px] font-black flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
    <span className={clsx(
      "text-sm font-bold uppercase tracking-tight",
      current ? "text-primary" : active ? "text-text-dark" : "text-gray-400"
    )}>
      {label}
    </span>
  </button>
);

export default RolesPermissionsPage;
