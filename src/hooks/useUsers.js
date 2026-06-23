import { useState, useCallback, useEffect, useRef } from 'react';
import { USER_STATUS } from '../constants/users';
import { userService } from '../services/userService';

const STATUS_MAP_TO_API = {
  'Actif': 'active',
  'Inactif': 'inactive',
  'En attente': 'pending',
};

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [usersWithCredentials, setUsersWithCredentials] = useState({}); // Store users with their credentials
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQueryState] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    statut: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Debounce ref for search
  const debounceTimer = useRef(null);

  const fetchUsers = useCallback(async (currentFilters = {}, search = '', page = 1) => {
    try {
      setLoading(true);
      const apiFilters = {
        ...currentFilters,
        statut: currentFilters.statut ? STATUS_MAP_TO_API[currentFilters.statut] || currentFilters.statut : undefined,
        search: search,
        page: page
      };
      const data = await userService.getUsers(apiFilters);
      
      // Merge new users with existing credentials
      const mergedUsers = (data.data || []).map(user => {
        if (usersWithCredentials[user.id]) {
          return { ...user, generatedCredentials: usersWithCredentials[user.id] };
        }
        return user;
      });
      
      setUsers(mergedUsers);
      setTotalCount(data.total || (data.data?.length || 0));
      setTotalPages(Math.ceil((data.total || (data.data?.length || 0)) / perPage));
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [perPage, usersWithCredentials]);

  // Effect for filters, search, or page change
  useEffect(() => {
    fetchUsers(filters, searchQuery, 1);
  }, [filters, searchQuery, fetchUsers]);

  // Handle search with debounce
  const handleSearchChange = useCallback((query) => {
    setSearchQueryState(query);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      fetchUsers(filters, query, 1);
    }, 500);
  }, [filters, fetchUsers]);

  const setSearchQueryDirectly = useCallback((query) => {
    setSearchQueryState(query);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    fetchUsers(filters, query, 1);
  }, [filters, fetchUsers]);

  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    fetchUsers(filters, searchQuery, page);
  }, [filters, searchQuery, totalPages, fetchUsers]);

  const addUser = useCallback(async (userData) => {
    try {
      const result = await userService.createUser(userData);
      // Store credentials persistently
      if (result?.user && result?.credentials) {
        setUsersWithCredentials(prev => ({
          ...prev,
          [result.user.id]: result.credentials
        }));
      }
      fetchUsers(filters, searchQuery, 1);
      return result;
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'utilisateur');
      throw err;
    }
  }, [filters, searchQuery, fetchUsers]);

  const updateUser = useCallback(async (id, updatedData) => {
    try {
      const updatedUser = await userService.updateUser(id, updatedData);
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      await userService.deleteUser(id);
      fetchUsers(filters, searchQuery, currentPage);
    } catch (err) {
      setError('Erreur lors de la suppression');
      throw err;
    }
  }, [filters, searchQuery, currentPage, fetchUsers]);

  const toggleUserStatus = useCallback(async (id) => {
    try {
      setUsers(prev => {
        const user = prev.find(u => u.id === id);
        if (!user) return prev;
        
        const newStatus = user.statut === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
        
        // Optimistic update
        const updatedUsers = prev.map(u => u.id === id ? { ...u, statut: newStatus } : u);
        
        // We still need to call the API
        userService.updateUser(id, { statut: newStatus }).catch(err => {
          console.error('Failed to sync status:', err);
          // Rollback logic could go here if needed
        });
        
        return updatedUsers;
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    users: users,
    totalCount,
    loading,
    error,
    searchQuery,
    setSearchQuery: handleSearchChange,
    setSearchQueryDirectly,
    filters,
    setFilters,
    currentPage,
    totalPages,
    perPage,
    setCurrentPage: handlePageChange,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refreshUsers: () => fetchUsers(filters, searchQuery, currentPage),
  };
};
