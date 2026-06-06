import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import UserTable from '../components/users/UserTable';
import UserFilters from '../components/users/UserFilters';
import { useUsers } from '../hooks/useUsers';
import usePermissions from '../hooks/usePermissions';

// Lazy load heavy components
const UserDrawer = lazy(() => import('../components/users/UserDrawer'));
const UserDetailsModal = lazy(() => import('../components/users/UserDetailsModal'));
const ConfirmationModal = lazy(() => import('../components/users/ConfirmationModal'));

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
    loading: isLoading,
    error,
  } = useUsers();

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission('Utilisateurs', 'Création');
  const canEdit = hasPermission('Utilisateurs', 'Modification');
  const canDelete = hasPermission('Utilisateurs', 'Suppression');
  const canView = hasPermission('Utilisateurs', 'Lecture');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

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
    setFilters({ role: '', statut: '', dateCreation: '' });
  }, [setSearchQuery, setFilters]);

  const handleDrawerSubmit = useCallback(async (data) => {
    if (selectedUser) {
      return await updateUser(selectedUser.id, data);
    } else {
      return await addUser(data);
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
          canAdd={canAdd}
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
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>

      <Suspense fallback={null}>
        {isDrawerOpen && (
          <UserDrawer 
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onSubmit={handleDrawerSubmit}
            initialData={selectedUser}
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
      </Suspense>
    </div>
  );
};

export default UsersPage;
