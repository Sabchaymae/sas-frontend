import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useAuth from './useAuth';

// In-memory cache for loaded permissions
let permissionsCache = null;
let activePromise = null;
let cacheUserToken = null;

/**
 * Custom hook to manage and check user permissions
 */
const usePermissions = () => {
  const { isAuthenticated, user } = useAuth();
  const [permissions, setPermissions] = useState(permissionsCache || {});
  const [loading, setLoading] = useState(!permissionsCache && isAuthenticated);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    // If not authenticated or no token, clear permissions and don't fetch
    if (!isAuthenticated || !token) {
      permissionsCache = null;
      activePromise = null;
      cacheUserToken = null;
      setPermissions({});
      setLoading(false);
      return;
    }

    // If cache belongs to a different token, invalidate it
    if (cacheUserToken !== token) {
      permissionsCache = null;
      activePromise = null;
      cacheUserToken = token;
    }

    // If already in cache, use it
    if (permissionsCache) {
      setPermissions(permissionsCache);
      setLoading(false);
      return;
    }

    // If a fetch is already in progress, wait for it
    if (activePromise) {
      activePromise
        .then((perms) => {
          setPermissions(perms);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Erreur lors du chargement des permissions');
          setLoading(false);
        });
      return;
    }

    // Otherwise, initiate a new fetch
    setLoading(true);
    activePromise = api.get('api/v1/roles-permissions/my-permissions')
      .then((response) => {
        const perms = response.permissions || {};
        permissionsCache = perms;
        activePromise = null;
        setPermissions(perms);
        setLoading(false);
        return perms;
      })
      .catch((err) => {
        activePromise = null;
        console.error('Error fetching permissions:', err);
        setError(err.message || 'Erreur lors du chargement des permissions');
        setLoading(false);
        throw err;
      });
  }, [isAuthenticated, token]);

  const hasPermission = useCallback((module, action) => {
    // Admin user has all permissions by default
    if (user?.role?.toLowerCase() === 'admin') {
      return true;
    }

    if (!permissions) return false;

    // Check module and action
    const modulePerms = permissions[module];
    if (!modulePerms) return false;

    return !!modulePerms[action];
  }, [permissions, user]);

  return {
    permissions,
    hasPermission,
    loading,
    error,
  };
};

export default usePermissions;
