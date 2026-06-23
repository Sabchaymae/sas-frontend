import { Plus, Users, CreditCard, CheckSquare, Bell, FileText, Package, Building, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const QuickAction = ({ title, icon: Icon, color, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05, y: -4 }}
    whileTap={{ scale: 0.95 }}
  >
    <Link
      to={to || '#'}
      className={`flex flex-col items-center gap-3 p-6 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl hover:border-gray-200 hover:shadow-xl transition-all duration-300`}
    >
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg`}>
        <Icon size={28} className="text-white" />
      </div>
      <span className="text-sm font-bold text-gray-700 text-center">{title}</span>
    </Link>
  </motion.div>
);

const QuickActions = () => {
  const actions = [
    {
      title: 'Créer utilisateur',
      icon: Plus,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      to: '/dashboard/users'
    },
    {
      title: 'Créer souscription',
      icon: CreditCard,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      to: '#'
    },
    {
      title: 'Créer tâche',
      icon: CheckSquare,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      to: '/dashboard/tasks'
    },
    {
      title: 'Envoyer notification',
      icon: Bell,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      to: '#'
    },
    {
      title: 'Générer rapport',
      icon: FileText,
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      to: '#'
    },
    {
      title: 'Ajouter stock',
      icon: Package,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      to: '/dashboard/stock'
    },
    {
      title: 'Ajouter agence',
      icon: Building,
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      to: '#'
    },
    {
      title: 'Paramètres',
      icon: Settings,
      color: 'bg-gradient-to-br from-gray-500 to-gray-600',
      to: '/dashboard/settings'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-black text-gray-900">Actions Rapides</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Accès direct aux fonctionnalités principales</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {actions.map((action, index) => (
          <QuickAction key={index} {...action} delay={index * 0.05} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
