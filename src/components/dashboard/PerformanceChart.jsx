import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const PerformanceChart = ({ data, onFilterChange }) => {
  const [filter, setFilter] = useState('day');

  const filters = [
    { key: 'day', label: 'Jour' },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
    { key: 'year', label: 'Année' }
  ];

  const COLORS = {
    folders: '#2563eb',
    subscriptions: '#6366f1',
    validation: '#10b981',
    productivity: '#f59e0b'
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (onFilterChange) onFilterChange(newFilter);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <TrendingUp size={24} className="text-blue-500" />
            Aperçu des Performances
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">Évolution des indicateurs clés</p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                filter === f.key
                  ? 'bg-white text-[#1428C9] shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Folders & Subscriptions */}
        <div className="bg-gray-50/50 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-gray-600 mb-4">Dossiers & Souscriptions</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="folders" name="Dossiers traités" fill={COLORS.folders} radius={[8, 8, 0, 0]} />
              <Bar dataKey="subscriptions" name="Souscriptions" fill={COLORS.subscriptions} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Validation & Productivity */}
        <div className="bg-gray-50/50 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-gray-600 mb-4">Taux de validation & Productivité</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="validation"
                name="Taux validation (%)"
                stroke={COLORS.validation}
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="productivity"
                name="Productivité (%)"
                stroke={COLORS.productivity}
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
