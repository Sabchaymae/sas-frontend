import { Brain, Zap, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const getIcon = (type) => {
  switch (type) {
    case 'follow_up': return Users;
    case 'risk': return AlertTriangle;
    case 'overload': return TrendingUp;
    default: return Zap;
  }
};

const AISuggestion = ({ suggestion, index }) => {
  const Icon = getIcon(suggestion.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 border border-purple-100 rounded-2xl p-5 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-gray-900">{suggestion.title}</h4>
              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                {Math.round(suggestion.score * 100)}% confiance
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{suggestion.description}</p>
            <p className="text-xs text-gray-500 mt-3 font-medium italic">
              💡 {suggestion.explanation}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg">
          {suggestion.action}
        </button>
      </div>
    </motion.div>
  );
};

const AISuggestions = ({ suggestions }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Suggestions Intelligentes</h3>
            <p className="text-sm text-gray-500 font-medium">Alimenté par l'IA Ollama</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <AISuggestion key={suggestion.id} suggestion={suggestion} index={index} />
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;
