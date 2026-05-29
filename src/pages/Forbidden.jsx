import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';

export const Forbidden = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden font-sans">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />

      {/* Main glassmorphism card */}
      <div className="relative max-w-lg w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl text-center flex flex-col items-center">
        {/* Animated premium icon badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-rose-500 shadow-inner">
            <ShieldAlert size={40} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Text content */}
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-amber-400 to-indigo-400 bg-clip-text text-transparent mb-2">
          403
        </h1>
        <h2 className="text-2xl font-bold text-slate-200 mb-4">
          Accès Refusé
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
          Désolé, vos autorisations actuelles ne vous permettent pas d'accéder à cette ressource. Veuillez contacter l'administrateur du système si vous pensez qu'il s'agit d'une erreur.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-700/80 border border-slate-700 rounded-xl transition duration-200 text-sm font-medium text-slate-200 w-full sm:w-auto"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition duration-200 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 w-full sm:w-auto"
          >
            <Home size={16} />
            Tableau de Bord
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-950/40 hover:bg-rose-900/40 active:bg-rose-900/60 border border-rose-950 rounded-xl transition duration-200 text-sm font-medium text-rose-400 w-full sm:w-auto"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
