import { useState, useCallback, useEffect, useRef } from 'react';
import { USER_STATUS } from '../constants/users';
import { userService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    statut: '',
    dateCreation: '',
  });

  // Debounce ref for search
  const debounceTimer = useRef(null);

  const fetchUsers = useCallback(async (currentFilters = {}, search = '') => {
    try {
      setLoading(true);
      const apiFilters = {
        ...currentFilters,
        search: search
      };
      const data = await userService.getUsers(apiFilters);
      setUsers(data.data || data); 
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for filters (immediate)
  useEffect(() => {
    fetchUsers(filters, searchQuery);
  }, [filters, fetchUsers]);

  // Handle search with debounce
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      fetchUsers(filters, query);
    }, 500);
  }, [filters, fetchUsers]);

  const addUser = useCallback(async (userData) => {
    try {
      let finalData = userData;
      
      // Handle FormData
      if (userData instanceof FormData) {
        if (!userData.has('password')) {
          userData.append('password', 'password123');
        }
      } else {
        finalData = {
          ...userData,
          password: 'password123',
        };
      }

      const newUser = await userService.createUser(finalData);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'utilisateur');
      throw err;
    }
  }, []);

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
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression');
      throw err;
    }
  }, []);

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
    totalCount: users.length,
    loading,
    error,
    searchQuery,
    setSearchQuery: handleSearchChange,
    filters,
    setFilters,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refreshUsers: () => fetchUsers(filters, searchQuery),
  };
};
