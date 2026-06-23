import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/slices/authSlice';

/**
 * ForcePasswordGuard — Ensures user has changed their password
 * Redirects to /auth/change-password if passwordChangeRequired is true
 */
const ForcePasswordGuard = ({ children }) => {
  const { passwordChangeRequired, isAuthenticated } = useSelector(selectAuth);

  if (passwordChangeRequired && !isAuthenticated) {
    return <Navigate to="/auth/change-password" replace />;
  }

  return children;
};

export default ForcePasswordGuard;
