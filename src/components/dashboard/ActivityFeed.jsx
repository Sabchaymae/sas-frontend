import { Zap, User, Folder, CheckSquare, XCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const getIconAndColor = (type) => {
  switch (type) {
    case 'login':
      return { icon: User, color: 'bg-blue-500' };
    case 'create_folder':
      return { icon: Folder, color: 'bg-indigo-500' };
    case 'validation':
      return { icon: CheckSquare, color: 'bg-green-500' };
    case 'rejection':
      return { icon: XCircle, color: 'bg-red-500' };
    case 'assignment':
      return { icon: Users, color: 'bg-purple-500' };
    default:
      return { icon: Zap, color: 'bg-gray-500' };
  }
};

const ActivityItem = ({ activity, index }) => {
  const { icon: Icon, color } = getIconAndColor(activity.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg z-10`}>
          <Icon size={22} className="text-white" />
        </div>
        {index < 4 && (
          <div className="w-0.5 h-full bg-gray-200 -mt-1" />
        )}
      </div>

      <div className="pb-6">
        <div className="flex items-baseline gap-3">
          <p className="font-bold text-gray-900">{activity.user}</p>
          <span className="text-xs text-gray-400 font-medium">{activity.time}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
      </div>
    </motion.div>
  );
};

const ActivityFeed = ({ activities }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <Zap size={24} className="text-yellow-500" />
            Activité en Direct
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Derniers événements du système
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => (
          <ActivityItem key={activity.id} activity={activity} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
