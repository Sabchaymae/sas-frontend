
import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import UserTable from '../components/users/UserTable';
import UserFilters from '../components/users/UserFilters';
import { useUsers } from '../hooks/useUsers';
import usePermissions from '../hooks/usePermissions';
import api from '../services/api';
import { USER_ROLES } from '../constants/users';


// Lazy load heavy components
const UserDrawer = lazy(() => import('../components/users/UserDrawer'));
const UserDetailsModal = lazy(() => import('../components/users/UserDetailsModal'));
const ConfirmationModal = lazy(() => import('../components/users/ConfirmationModal'));
const UserCredentialsModal = lazy(() => import('../components/users/UserCredentialsModal'));

const UsersPage = () => {
  const {
    users,
    totalCount,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    loading: isLoading,
    error,
    currentPage,
    totalPages,
    perPage,
    setCurrentPage: onPageChange,
  } = useUsers();

  // ─── Permissions ───────────────────────────────────────────
  const { hasPermission, loading: permLoading } = usePermissions();

  // Droits sur le module "Utilisateurs"
  const canCreate = hasPermission('Utilisateurs', 'Création');
  const canRead = hasPermission('Utilisateurs', 'Lecture');
  const canEdit = hasPermission('Utilisateurs', 'Modification');
  const canDelete = hasPermission('Utilisateurs', 'Suppression');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [newCredentials, setNewCredentials] = useState(null);

  const [availableRoles, setAvailableRoles] = useState([]);

  const fetchAvailableRoles = useCallback(async () => {
    try {
      const response = await api.get('api/v1/roles-permissions/roles');
      if (response && response.success) {
        const apiRoles = response.roles.map(r => ({
          value: r.slug || r.name.toLowerCase(),
          label: r.name
        }));

        // Merge with static default roles from constants for compatibility/safety
        const staticRoles = Object.values(USER_ROLES).map(role => ({
          value: role,
          label: role.charAt(0).toUpperCase() + role.slice(1)
        }));

        // Filter out static roles that already exist in API roles
        const filteredStatic = staticRoles.filter(
          sr => !apiRoles.some(ar => ar.value === sr.value)
        );

        setAvailableRoles([...apiRoles, ...filteredStatic]);
      } else {
        // Fallback if success flag is missing or not true
        const staticRoles = Object.values(USER_ROLES).map(role => ({
          value: role,
          label: role.charAt(0).toUpperCase() + role.slice(1)
        }));
        setAvailableRoles(staticRoles);
      }
    } catch (err) {
      console.error('Error fetching dynamic roles:', err);
      // Fallback on error
      const staticRoles = Object.values(USER_ROLES).map(role => ({
        value: role,
        label: role.charAt(0).toUpperCase() + role.slice(1)
      }));
      setAvailableRoles(staticRoles);
    }
  }, []);

  useEffect(() => {
    fetchAvailableRoles();
  }, [fetchAvailableRoles]);

  const handleNewUser = useCallback(() => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  }, []);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  }, []);

  const handleViewUser = useCallback((user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  }, []);

  const handleDeleteClick = useCallback((user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, deleteUser]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, [setFilters]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({ role: '', statut: '' });
  }, [setSearchQuery, setFilters]);

  const handleDrawerSubmit = useCallback(async (data) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      const result = await addUser(data);
      if (result?.credentials) {
        setNewCredentials(result.credentials);
        setIsCredentialsModalOpen(true);
      }
    }
  }, [selectedUser, updateUser, addUser]);

  return (
    <div className="w-full mx-auto pb-12 space-y-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      )}

      {/* Filters section */}
      <div className="animate-in fade-in slide-in-up duration-500">
        <UserFilters
          userCount={totalCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onNewUser={handleNewUser}
          availableRoles={availableRoles}
          canCreate={canCreate}
          permLoading={permLoading}
        />
      </div>

      {/* Table section */}
      <div className="animate-in fade-in slide-in-up duration-700 delay-150">
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onView={handleViewUser}
          onDelete={handleDeleteClick}
          isLoading={isLoading}
          onToggleStatus={toggleUserStatus}

          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          perPage={perPage}
          onPageChange={onPageChange}

        />
      </div>

      <Suspense fallback={null}>
        {isDrawerOpen && (
          <UserDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSubmit={handleDrawerSubmit}
            initialData={selectedUser}
            availableRoles={availableRoles}
            onRefreshRoles={fetchAvailableRoles}
          />
        )}

        {isDetailsOpen && (
          <UserDetailsModal
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            user={selectedUser}
          />
        )}

        {isDeleteModalOpen && (
          <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Supprimer l'utilisateur"
            message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete?.prenom} ${userToDelete?.nom} ? Cette action est irréversible.`}
            confirmText="Supprimer"
            type="danger"
          />
        )}

        {isCredentialsModalOpen && (
          <UserCredentialsModal 
            isOpen={isCredentialsModalOpen}
            onClose={() => {
              setIsCredentialsModalOpen(false);
              setNewCredentials(null);
              setIsDrawerOpen(false);
            }}
            credentials={newCredentials}
          />
        )}
      </Suspense>
    </div>
  );
};

export default UsersPage;
