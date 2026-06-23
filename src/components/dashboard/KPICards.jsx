import { Users, Folder, AlertTriangle, CheckSquare, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const KPICard = ({ title, value, change, trend, icon: Icon, color, subtitle }) => {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10`}>
          <Icon size={28} className="text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-gray-500 mb-2">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 group-hover:text-[#1428C9] transition-colors">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-400 font-medium mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

const KPICards = ({ data }) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      <KPICard
        title="Utilisateurs actifs"
        value={data.activeUsers?.total || 0}
        change={data.activeUsers?.change}
        trend={data.activeUsers?.trend}
        icon={Users}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        subtitle="Vs hier"
      />
      <KPICard
        title="Dossiers en traitement"
        value={data.activeFolders?.count || 0}
        change={data.activeFolders?.change}
        trend={data.activeFolders?.trend}
        icon={Folder}
        color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        subtitle={`${data.activeFolders?.change || 0}% vs période`}
      />
      <KPICard
        title="Alertes actives"
        value={data.activeAlerts?.count || 0}
        icon={AlertTriangle}
        color="bg-gradient-to-br from-orange-500 to-orange-600"
        subtitle={`Criticité: ${data.activeAlerts?.severity || 'moyenne'}`}
      />
      <KPICard
        title="Tâches en retard"
        value={data.overdueTasks?.count || 0}
        icon={CheckSquare}
        color="bg-gradient-to-br from-red-500 to-red-600"
        subtitle={`${data.overdueTasks?.percentage || 0}% des tâches`}
      />
      <KPICard
        title="Nouveaux messages"
        value={data.newMessages?.count || 0}
        change={data.newMessages?.change}
        trend={data.newMessages?.trend}
        icon={MessageSquare}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
        subtitle="Dernières 24h"
      />
    </div>
  );
};

export default KPICards;
