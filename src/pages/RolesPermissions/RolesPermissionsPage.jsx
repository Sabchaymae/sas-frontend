import React, { useState, useMemo } from 'react';
import RoleList from './components/RoleList';
import PermissionMatrix from './components/PermissionMatrix';
import UserList from './components/UserList';
<<<<<<< HEAD
import RoleDrawer from './components/RoleDrawer';
import ConfirmationModal from '../../components/users/ConfirmationModal';
import { Save, ShieldCheck, X } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../services/api';
import { USER_ROLES, ROLE_STYLES } from '../../constants/users';
import usePermissions from '../../hooks/usePermissions';
=======
import { Save, ShieldCheck, X } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../services/api';
import { USER_ROLES } from '../../constants/users';
>>>>>>> import/master

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
<<<<<<< HEAD
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
=======
  const [isModalOpen, setIsModalOpen] = useState(false);
>>>>>>> import/master
  const [newRoleName, setNewRoleName] = useState('');

  const [permissions, setPermissions] = useState({});
  const [editingRole, setEditingRole] = useState(null);

<<<<<<< HEAD
  const { hasPermission } = usePermissions();
=======
>>>>>>> import/master

  // Fetch Roles on mount
  React.useEffect(() => {
    fetchRoles();
  }, []);

<<<<<<< HEAD
  // Role color mapping
  const getRoleColor = (roleName) => {
    if (!roleName) return 'bg-gradient-to-br from-gray-500 to-gray-600';
    
    const roleLower = roleName.toLowerCase().trim();
    const colorMap = {
      // Using both constant values and lowercase strings
      [USER_ROLES.ADMIN]: 'bg-gradient-to-br from-purple-500 to-purple-600',
      [USER_ROLES.ASSISTANT]: 'bg-gradient-to-br from-blue-500 to-blue-600',
      [USER_ROLES.ANIMATEUR]: 'bg-gradient-to-br from-green-500 to-green-600',
      [USER_ROLES.SUPERVISEUR]: 'bg-gradient-to-br from-orange-500 to-orange-600',
      'admin': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'assistant': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'animateur': 'bg-gradient-to-br from-green-500 to-green-600',
      'superviseur': 'bg-gradient-to-br from-orange-500 to-orange-600',
      'it': 'bg-gradient-to-br from-cyan-500 to-cyan-600', // Added IT color
    };
    // For custom roles, cycle through additional colors
    const customColors = [
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600',
      'bg-gradient-to-br from-lime-500 to-lime-600',
      'bg-gradient-to-br from-amber-500 to-amber-600',
      'bg-gradient-to-br from-rose-500 to-rose-600',
      'bg-gradient-to-br from-violet-500 to-violet-600',
    ];
    
    // Check for exact match first
    if (colorMap[roleLower]) return colorMap[roleLower];
    
    // Check if role name contains any of the keywords
    if (roleLower.includes('admin')) return colorMap['admin'];
    if (roleLower.includes('assistant')) return colorMap['assistant'];
    if (roleLower.includes('animateur')) return colorMap['animateur'];
    if (roleLower.includes('superviseur')) return colorMap['superviseur'];
    if (roleLower.includes('it')) return colorMap['it'];
    
    // For other custom roles, use hash to get consistent color
    const hash = roleLower.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return customColors[hash % customColors.length];
  };

=======
>>>>>>> import/master
  const fetchRoles = async () => {
    try {

      const response = await api.get('v1/roles-permissions/roles');
<<<<<<< HEAD
      console.log("API Response:", response); // Debug log
      
      if (response.success) {
        const apiRoles = response.roles.map(r => {
          console.log("Processing role:", r.name, "Existing color:", r.color); // Debug log
          // Always use our color mapping for better consistency
          const calculatedColor = getRoleColor(r.name);
          console.log("Calculated color for", r.name, ":", calculatedColor); // Debug log
          return {
            ...r,
            users: r.users_count || 0,
            color: calculatedColor
          };
        });
        console.log("Processed API roles:", apiRoles); // Debug log
=======
      if (response.success) {
        const apiRoles = response.roles.map(r => ({
          ...r,
          users: r.users_count || 0
        }));
>>>>>>> import/master

        // Merge with static roles from constants
        const staticRoles = Object.values(USER_ROLES).map((roleName, index) => ({
          id: `static-${roleName}`,
          name: roleName,
<<<<<<< HEAD
          color: getRoleColor(roleName),
=======
          color: index % 2 === 0 ? 'bg-primary' : 'bg-orange-500',
>>>>>>> import/master
          users: 0,
          isStatic: true
        }));

        // Filter out static roles that already exist in API roles (by name)
        const filteredStatic = staticRoles.filter(
          sr => !apiRoles.some(ar => (ar.name || '').toLowerCase() === (sr.name || '').toLowerCase())
        );

        const combinedRoles = [...apiRoles, ...filteredStatic];
<<<<<<< HEAD
        console.log("Final combined roles:", combinedRoles); // Debug log
=======
>>>>>>> import/master
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
      const response = await api.get(`v1/roles-permissions/roles/${selectedRole}/users`, {
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
<<<<<<< HEAD
      const response = await api.get('v1/roles-permissions/permissions', {
=======
      const response = await api.get('api/v1/roles-permissions/permissions', {
>>>>>>> import/master
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
<<<<<<< HEAD
    setPermissions(prev => {
      const isEnabling = !prev[module]?.[action];
      const newModulePerms = {
        ...(prev[module] || {}),
        [action]: isEnabling
      };

      // Si on coche n'importe quelle permission, on coche aussi 'Lecture'
      if (isEnabling && action !== 'Lecture') {
        newModulePerms['Lecture'] = true;
      }

      // Optionnel: Si on décoche 'Lecture', on décoche tout le reste du module
      if (!isEnabling && action === 'Lecture') {
        Object.keys(newModulePerms).forEach(key => {
          newModulePerms[key] = false;
        });
      }

      return {
        ...prev,
        [module]: newModulePerms
      };
    });
=======
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module]?.[action]
      }
    }));
>>>>>>> import/master
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
<<<<<<< HEAD
      const willEnable = !allChecked;

      MODULES.forEach(module => {
        newPerms[module] = {
          ...(newPerms[module] || {}),
          [action]: willEnable
        };

        // Si on active une action (ex: Création) pour tous les modules, on active aussi Lecture
        if (willEnable && action !== 'Lecture') {
          newPerms[module]['Lecture'] = true;
        }

        // Si on désactive Lecture pour tous les modules, on vide tout
        if (!willEnable && action === 'Lecture') {
          Object.keys(newPerms[module]).forEach(k => {
            newPerms[module][k] = false;
          });
        }
=======
      MODULES.forEach(module => {
        newPerms[module] = {
          ...(newPerms[module] || {}),
          [action]: !allChecked
        };
>>>>>>> import/master
      });
      return newPerms;
    });
  };


<<<<<<< HEAD
  const handleAddRole = async (roleName) => {
    try {
      const response = await api.post('v1/roles-permissions/roles', {
        name: roleName,
        color: getRoleColor(roleName)
      });
      if (response.success) {
        setIsDrawerOpen(false);
=======
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
>>>>>>> import/master
        setNewRoleName('');
        await fetchRoles(); // Refresh roles list
        setSelectedRole(response.role.id);
      }
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Erreur lors de la création du rôle.");
    }
  };

<<<<<<< HEAD
  const handleUpdateRole = async (roleName) => {
    if (!editingRole) return;
    try {
      const response = await api.put(`v1/roles-permissions/roles/${editingRole.id}`, {
        name: roleName,
      });
      if (response.success) {
        setEditingRole(null);
        setIsDrawerOpen(false);
=======
  const handleUpdateRole = async () => {
    if (!editingRole || newRoleName.trim() === '') return;
    try {
      const response = await api.put(`api/v1/roles-permissions/roles/${editingRole.id}`, {
        name: newRoleName,
      });
      if (response.success) {
        setEditingRole(null);
>>>>>>> import/master
        setNewRoleName('');
        await fetchRoles();
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Erreur lors de la mise à jour du rôle.");
    }
  };

<<<<<<< HEAD
  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      const response = await api.delete(`v1/roles-permissions/roles/${roleToDelete.id}`);
      if (response.success) {
        if (selectedRole === roleToDelete.id) setSelectedRole(null);
        await fetchRoles();
        setIsDeleteModalOpen(false);
        setRoleToDelete(null);
=======
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) return;
    try {
      const response = await api.delete(`api/v1/roles-permissions/roles/${roleId}`);
      if (response.success) {
        if (selectedRole === roleId) setSelectedRole(null);
        await fetchRoles();
>>>>>>> import/master
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

<<<<<<< HEAD
      const response = await api.put(`v1/users/${userId}`, {
=======
      const response = await api.put(`api/v1/users/${userId}`, {
>>>>>>> import/master
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
<<<<<<< HEAD
      const response = await api.post('v1/roles-permissions/permissions/sync', {
=======
      const response = await api.post('api/v1/roles-permissions/permissions/sync', {
>>>>>>> import/master
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
<<<<<<< HEAD
                  setIsDrawerOpen(true);
                }}
                onEditRole={(role) => {
                  setEditingRole(role);
                  setIsDrawerOpen(true);
                }}
                onDeleteRole={handleDeleteRole}
                canAdd={hasPermission('Autorisation', 'Création')}
                canEdit={hasPermission('Autorisation', 'Modification')}
                canDelete={hasPermission('Autorisation', 'Suppression')}
=======
                  setNewRoleName('');
                  setIsModalOpen(true);
                }}
                onEditRole={(role) => {
                  setEditingRole(role);
                  setNewRoleName(role.name);
                  setIsModalOpen(true);
                }}
                onDeleteRole={handleDeleteRole}
>>>>>>> import/master
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

<<<<<<< HEAD
      {/* Role Drawer */}
      <RoleDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingRole(null);
        }}
        onSubmit={editingRole ? handleUpdateRole : handleAddRole}
        initialData={editingRole}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le rôle"
        message={`Êtes-vous sûr de vouloir supprimer le rôle "${roleToDelete?.name}" ? Cette action supprimera également toutes les permissions associées.`}
        confirmText="Supprimer"
        type="danger"
      />
=======
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
>>>>>>> import/master
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
