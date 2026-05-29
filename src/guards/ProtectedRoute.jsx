import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/authSlice";
import usePermissions from "../hooks/usePermissions";
import { Loader2 } from "lucide-react";

/**
 * <ProtectedRoute>
 *   Wraps a route element and ensures the current user has the required permission
 *   on the given resource/module. If not, redirects to a 403 page (or login if unauthenticated).
 *
 *   Usage (React Router v6):
 *   ```jsx
 *   <Route
 *     path="/orders"
 *     element={
 *       <ProtectedRoute action="Lecture" module="Utilisateurs" element={<UsersPage />} />
 *     }
 *   />
 *   ```
 */
export const ProtectedRoute = ({ 
  element, 
  children, 
  module, 
  resource, 
  action, 
  permission 
}) => {
  const user = useSelector(selectUser);
  const location = useLocation();
  const { hasPermission, loading } = usePermissions();

  const targetModule = module || resource;
  const targetAction = action || permission;

  // If there is no logged-in user, redirect to login page immediately
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // While permissions are loading, render a stunning glassmorphic loader
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md">
        <div className="flex flex-col items-center p-8 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full text-center">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-100">Chargement des autorisations</h3>
          <p className="text-sm text-slate-400 mt-2">Veuillez patienter pendant la validation de vos accès...</p>
        </div>
      </div>
    );
  }

  // Verify permission
  const allowed = hasPermission(targetModule, targetAction);

  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  return element || children;
};

export default ProtectedRoute;
