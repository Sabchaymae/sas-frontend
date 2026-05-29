import React from 'react';
import usePermissions from '../hooks/usePermissions';

/**
 * <HasPermission>
 *   Conditionally renders its children only if the current user has the specified permission.
 *
 *   Usage:
 *   ```jsx
 *   <HasPermission module="Utilisateurs" action="Création" fallback={<p>Accès refusé</p>}>
 *     <button>Créer un utilisateur</button>
 *   </HasPermission>
 *   ```
 */
export const HasPermission = ({
  module,
  resource,
  action,
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission } = usePermissions();

  const targetModule = module || resource;
  const targetAction = action || permission;

  const allowed = hasPermission(targetModule, targetAction);

  if (!allowed) {
    return fallback;
  }

  return <>{children}</>;
};

export default HasPermission;
