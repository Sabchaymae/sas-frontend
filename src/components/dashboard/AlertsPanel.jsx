import { AlertTriangle, User, Folder, CreditCard, Server, FileWarning, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const getIcon = (type) => {
  switch (type) {
    case 'inactive_user': return User;
    case 'blocked_folder': return Folder;
    case 'rejected_subscription': return CreditCard;
    case 'system_error': return Server;
    case 'expired_document': return FileWarning;
    default: return AlertTriangle;
  }
};

const getColorClasses = (priority) => {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-50 border-red-100',
        iconBg: 'bg-red-500',
        text: 'text-red-600',
        badge: 'bg-red-100 text-red-700'
      };
    case 'medium':
      return {
        bg: 'bg-orange-50 border-orange-100',
        iconBg: 'bg-orange-500',
        text: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-700'
      };
    case 'low':
      return {
        bg: 'bg-blue-50 border-blue-100',
        iconBg: 'bg-blue-500',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      };
    default:
      return {
        bg: 'bg-gray-50 border-gray-100',
        iconBg: 'bg-gray-500',
        text: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-700'
      };
  }
};

const AlertItem = ({ alert, index }) => {
  const Icon = getIcon(alert.type);
  const colors = getColorClasses(alert.priority);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-5 rounded-2xl border ${colors.bg} hover:shadow-md transition-all duration-300`}
    >
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon size={24} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className={`font-bold text-sm ${colors.text}`}>{alert.title}</h4>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{alert.description}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
              {alert.priority}
            </span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Clock size={14} />
              <span>{new Date(alert.date).toLocaleString('fr-FR', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}</span>
            </div>
            <button className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 ${colors.iconBg} text-white`}>
              {alert.action}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AlertsPanel = ({ alerts }) => {
  if (!alerts?.length) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={40} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Aucune alerte</h3>
        <p className="text-sm text-gray-500">Tous les indicateurs sont verts !</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <AlertTriangle size={24} className="text-orange-500" />
            Alertes Temps Réel
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {alerts.length} alertes actives
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.slice(0, 5).map((alert, index) => (
          <AlertItem key={alert.id} alert={alert} index={index} />
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
