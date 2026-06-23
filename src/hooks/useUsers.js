import { useState, useCallback, useEffect, useRef } from 'react';
import { USER_STATUS } from '../constants/users';
import { userService } from '../services/userService';

<<<<<<< HEAD
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
=======
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
>>>>>>> import/master

  // Debounce ref for search
  const debounceTimer = useRef(null);

<<<<<<< HEAD
  const fetchUsers = useCallback(async (currentFilters = {}, search = '') => {
=======
  const fetchUsers = useCallback(async (currentFilters = {}, search = '', page = 1) => {
>>>>>>> import/master
    try {
      setLoading(true);
      const apiFilters = {
        ...currentFilters,
<<<<<<< HEAD
        search: search
      };
      const data = await userService.getUsers(apiFilters);
      // Add mock isOnline status for demonstration
      const usersWithOnlineStatus = (data.data || data).map(user => ({
        ...user,
        isOnline: Math.random() > 0.3 // ~70% of users are online for demo
      }));
      setUsers(usersWithOnlineStatus); 
=======
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
>>>>>>> import/master
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
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
      const newUser = await userService.createUser(userData);
      // Add isOnline to new user
      const userWithOnline = { ...newUser, isOnline: true };
      setUsers(prev => [userWithOnline, ...prev]);
      return userWithOnline;
=======
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
>>>>>>> import/master
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'utilisateur');
      throw err;
    }
<<<<<<< HEAD
  }, []);
=======
  }, [filters, searchQuery, fetchUsers]);
>>>>>>> import/master

  const updateUser = useCallback(async (id, updatedData) => {
    try {
      const updatedUser = await userService.updateUser(id, updatedData);
      setUsers(prev => prev.map(user => 
<<<<<<< HEAD
        user.id === id ? { ...updatedUser, isOnline: user.isOnline } : user
=======
        user.id === id ? updatedUser : user
>>>>>>> import/master
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
<<<<<<< HEAD
      setUsers(prev => prev.filter(user => user.id !== id));
=======
      fetchUsers(filters, searchQuery, currentPage);
>>>>>>> import/master
    } catch (err) {
      setError('Erreur lors de la suppression');
      throw err;
    }
<<<<<<< HEAD
  }, []);
=======
  }, [filters, searchQuery, currentPage, fetchUsers]);
>>>>>>> import/master

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
<<<<<<< HEAD
    totalCount: users.length,
=======
    totalCount,
>>>>>>> import/master
    loading,
    error,
    searchQuery,
    setSearchQuery: handleSearchChange,
<<<<<<< HEAD
    filters,
    setFilters,
=======
    setSearchQueryDirectly,
    filters,
    setFilters,
    currentPage,
    totalPages,
    perPage,
    setCurrentPage: handlePageChange,
>>>>>>> import/master
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
<<<<<<< HEAD
    refreshUsers: () => fetchUsers(filters, searchQuery),
=======
    refreshUsers: () => fetchUsers(filters, searchQuery, currentPage),
>>>>>>> import/master
  };
};
