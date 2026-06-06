import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectIsAuthenticated, selectAuth, selectUser } from '@/store/slices/authSlice';
import useAuth from '@/hooks/useAuth';

/**
 * AuthGuard — Protects routes that require authentication
 * Redirects to /login if user is not authenticated
 */
const AuthGuard = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const { passwordChangeRequired, twoFactorPending } = useSelector(selectAuth);
  const location = useLocation();
  const { fetchCurrentUser } = useAuth();
  
  const [isInitializing, setIsInitializing] = useState(isAuthenticated && !user);

  useEffect(() => {
    const initUser = async () => {
      if (isAuthenticated && !user) {
        await fetchCurrentUser();
      }
      setIsInitializing(false);
    };
    initUser();
  }, [isAuthenticated, user, fetchCurrentUser]);

  if (isInitializing) {
    // Basic loading state while we fetch the user profile
    return <div className="flex justify-center items-center h-screen"><div className="auth-loading-spinner"><div className="auth-loading-dot"></div></div></div>;
  }

  if (!isAuthenticated) {
    // Redirect pending auth steps to appropriate pages
    if (twoFactorPending) {
      return <Navigate to="/auth/2fa" replace />;
    }
    if (passwordChangeRequired) {
      return <Navigate to="/auth/change-password" replace />;
    }
    // Save intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard;
