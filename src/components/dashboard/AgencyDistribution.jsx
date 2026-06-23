import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Building2 } from 'lucide-react';

const COLORS = ['#2563eb', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AgencyDistribution = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
          <Building2 size={24} className="text-indigo-500" />
          Répartition Opérationnelle
        </h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Analyse des données par dimension</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par Agence - Donut */}
        <div className="bg-gray-50/50 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-gray-600 mb-4">Par Agence</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.agency}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.agency.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Par Région - Pie */}
        <div className="bg-gray-50/50 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-gray-600 mb-4">Par Région</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.region}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.region.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Par Statut - Bar */}
        <div className="bg-gray-50/50 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-gray-600 mb-4">Par Statut</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.status}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.status.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Par Opérateur - Bar */}
        <div className="bg-gray-50/50 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-gray-600 mb-4">Par Opérateur</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.operator}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.operator.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AgencyDistribution;
