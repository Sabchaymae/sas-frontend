import { motion } from 'framer-motion';

const StatsCard = ({ title, value, subtitle, subtitleColor = 'text-gray-400', icon: Icon, iconBg, iconColor, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-black text-[#111827] tracking-tight">
            {value}
          </p>
          <p className={`text-xs font-semibold ${subtitleColor}`}>
            {subtitle}
          </p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className={iconColor} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
