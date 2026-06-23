import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Bell, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { dashboardService } from '@/services/DashboardService';

import KPICards from '@/components/dashboard/KPICards';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import AISuggestions from '@/components/dashboard/AISuggestions';
import AgencyDistribution from '@/components/dashboard/AgencyDistribution';
import SystemHealth from '@/components/dashboard/SystemHealth';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: null,
    alerts: [],
    activity: [],
    performance: [],
    suggestions: [],
    charts: null,
    health: null,
    activeFilter: 'day'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpis, alerts, activity, performance, suggestions, charts, health] = await Promise.all([
          dashboardService.getKPIs(),
          dashboardService.getAlerts(),
          dashboardService.getActivity(),
          dashboardService.getPerformance('day'),
          dashboardService.getAISuggestions(),
          dashboardService.getCharts(),
          dashboardService.getSystemHealth()
        ]);

        setData({
          kpis,
          alerts,
          activity,
          performance,
          suggestions,
          charts,
          health,
          activeFilter: 'day'
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = async (filter) => {
    const performance = await dashboardService.getPerformance(filter);
    setData(prev => ({ ...prev, performance, activeFilter: filter }));
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="animate-in fade-in slide-in-up duration-500"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Tableau de bord</h1>
            <p className="text-slate-500 mt-2 font-medium">
              Vue d’ensemble de l’activité et des performances
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl">
              <Users size={18} className="text-slate-500" />
              <span className="text-sm font-bold text-slate-700">124 connectés</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl">
              <Clock size={18} className="text-slate-500" />
              <span className="text-sm font-bold text-slate-700">
                {new Date().toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      {data.kpis && <KPICards data={data.kpis} />}

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Chart & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <PerformanceChart
            data={data.performance}
            onFilterChange={handleFilterChange}
          />
          <ActivityFeed activities={data.activity} />
        </div>

        {/* Right Column - Alerts & AI */}
        <div className="space-y-8">
          <AlertsPanel alerts={data.alerts} />
          <AISuggestions suggestions={data.suggestions} />
        </div>
      </div>

      {/* Distribution Charts */}
      {data.charts && <AgencyDistribution data={data.charts} />}

      {/* System Health */}
      {data.health && <SystemHealth health={data.health} />}

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Utilisateurs connectés
            </p>
            <p className="text-2xl font-black text-indigo-600 mt-1">124</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Dernière sauvegarde
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">02:30</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Version ERP
            </p>
            <p className="text-2xl font-black text-slate-700 mt-1">v2.4.1</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              État système
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">OK</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
