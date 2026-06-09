import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">Accès Refusé</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page. 
        Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
      </p>
      <Link 
        to="/dashboard" 
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
};

export default Forbidden;
