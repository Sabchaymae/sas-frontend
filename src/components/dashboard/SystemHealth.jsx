import { Server, Database, Cpu, Zap, Globe, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const getIcon = (key) => {
  switch (key) {
    case 'api': return Server;
    case 'database': return Database;
    case 'redis': return Cpu;
    case 'ai': return Zap;
    case 'docker': return Globe;
    case 'zkteco': return ShieldCheck;
    default: return Activity;
  }
};

const getLabel = (key) => {
  switch (key) {
    case 'api': return 'API Laravel';
    case 'database': return 'Base MySQL';
    case 'redis': return 'Redis';
    case 'ai': return 'Service IA Ollama';
    case 'docker': return 'Serveur Docker';
    case 'zkteco': return 'ZKTeco Service';
    default: return key;
  }
};

const SystemHealthItem = ({ key, data, index }) => {
  const Icon = getIcon(key);
  const isOnline = data.status === 'online';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isOnline ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
          } shadow-lg`}>
            <Icon size={28} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{getLabel(key)}</h4>
            <span className={`inline-flex items-center gap-2 mt-1 text-sm font-bold px-3 py-1 rounded-full ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              {data.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">Temps de réponse</p>
          <p className="text-lg font-black text-gray-900">{data.responseTime}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">Uptime</p>
          <p className="text-lg font-black text-gray-900">{data.uptime}</p>
        </div>
      </div>
    </motion.div>
  );
};

const SystemHealth = ({ health }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <Activity size={24} className="text-emerald-500" />
            Monitoring ERP
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">État des services et infrastructure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(health).map(([key, data], index) => (
          <SystemHealthItem key={key} keyProp={key} data={data} index={index} />
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;
