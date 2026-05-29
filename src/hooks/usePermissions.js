import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/authSlice';
import api from '../services/api';

/**
 * Hook usePermissions
 *
 * Fetches the permissions of the currently authenticated user from the API
 * and exposes a helper `hasPermission(module, action)` to check individual rights.
 *
 * ⚡ Admin bypass : un utilisateur avec le rôle "admin" obtient automatiquement
 * tous les droits sans appel API.
 *
 * The permission matrix structure returned by the API looks like:
 * {
 *   "Utilisateurs": { "Lecture": true, "Création": false, ... },
 *   "Souscriptions": { ... },
 *   ...
 * }
 */
const usePermissions = () => {
  const currentUser = useSelector(selectUser);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // ── Admin bypass ─────────────────────────────────────────────────────────────
  // Support both a single `role` string and a `roles` array
  const isAdmin =
    currentUser?.role?.toLowerCase() === 'admin' ||
    currentUser?.role?.toLowerCase() === 'administrateur' ||
    currentUser?.roles?.some((r) => r?.toLowerCase() === 'admin' || r?.toLowerCase() === 'administrateur');

  const fetchUserPermissions = useCallback(async () => {
    // Admin: skip API call entirely, mark as loaded immediately
    if (isAdmin) {
      setLoading(false);
      return;
    }

    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('api/v1/roles-permissions/my-permissions');
      if (response.success && response.permissions) {
        setPermissions(response.permissions);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      // On error, leave permissions empty (no access)
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, isAdmin]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  /**
   * Check if the current user has a specific permission.
   * @param {string} module  - e.g. "Utilisateurs"
   * @param {string} action  - e.g. "Lecture" | "Création" | "Modification" | "Suppression"
   * @returns {boolean}
   */
  const hasPermission = useCallback(
    (module, action) => {
      // ✅ Admin a toujours tous les droits
      if (isAdmin) return true;

      // Permissions en cours de chargement → accès refusé par sécurité
      if (loading) return false;

      // Aucune permission chargée (erreur API ou rôle non configuré) → refus
      if (!permissions || Object.keys(permissions).length === 0) return false;

      // If no specific action is requested, return true if any permission for the module is true
      if (!action) {
        const modulePerms = permissions[module] || {};
        return Object.values(modulePerms).some((val) => !!val);
      }

      // Specific action check
      return !!permissions[module]?.[action];
    },
    [permissions, loading, isAdmin]
  );

  return {
    permissions,
    hasPermission,
    loading,
    isAdmin,
    refetch: fetchUserPermissions,
  };
};

export default usePermissions;
