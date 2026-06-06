import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

/**
 * GuestGuard — Prevents authenticated users from accessing auth pages
 * Redirects to /dashboard if user is already authenticated
 */
const GuestGuard = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestGuard;
