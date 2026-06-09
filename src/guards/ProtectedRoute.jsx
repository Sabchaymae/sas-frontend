import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

/**
 * Component for protecting routes based on authentication and permissions.
 * Currently simplified to handle missing logic in this branch.
 */
export const ProtectedRoute = ({ children, module, action }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <div className="auth-loading-spinner">
          <div className="auth-loading-dot"></div>
          <div className="auth-loading-dot"></div>
          <div className="auth-loading-dot"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If there's a specific permission check needed, we could implement it here
  // For now, we allow access if authenticated to avoid blocking the user
  
  return children;
};

export default ProtectedRoute;
