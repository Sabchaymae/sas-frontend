import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, FileText, AlertTriangle, CheckSquare, MessageSquare,
  Plus, Bell, Settings, Filter, Sliders, TrendingUp, TrendingDown,
  UserPlus, Shield, Folder, BarChart2, RefreshCw,
  Clock, Activity, ArrowUpRight, UserCheck,
  Loader2, AlertCircle, ShieldAlert
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { userService } from '../services/userService';
import historyService from '../services/historyService';
import useAuth from '../hooks/useAuth';
import useChatStore from '../store/useChatStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'À l\'instant';
  if (diff < 60) return `Il y a ${diff} min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
};

// Map activity type → icon + color
const getActivityMeta = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('connexion') || t.includes('login'))
    return { icon: UserCheck, bg: 'bg-blue-500' };
  if (t.includes('création') || t.includes('creation') || t.includes('create') || t.includes('ajout'))
    return { icon: Plus, bg: 'bg-emerald-500' };
  if (t.includes('modification') || t.includes('update') || t.includes('modif'))
    return { icon: RefreshCw, bg: 'bg-amber-500' };
  if (t.includes('suppression') || t.includes('delete') || t.includes('refus'))
    return { icon: AlertCircle, bg: 'bg-red-500' };
  if (t.includes('anomalie') || t.includes('alerte') || t.includes('secu'))
    return { icon: ShieldAlert, bg: 'bg-purple-500' };
  if (t.includes('message'))
    return { icon: MessageSquare, bg: 'bg-indigo-500' };
  if (t.includes('dossier') || t.includes('file') || t.includes('document'))
    return { icon: Folder, bg: 'bg-orange-500' };
  if (t.includes('tâche') || t.includes('task'))
    return { icon: CheckSquare, bg: 'bg-teal-500' };
  return { icon: Activity, bg: 'bg-gray-500' };
};

// Build daily activity counts from raw history items
const buildChartData = (historyItems, days) => {
  const map = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    map[key] = { date: label, connexions: 0, creations: 0, anomalies: 0, total: 0 };
  }
  historyItems.forEach(item => {
    const key = item.created_at?.slice(0, 10);
    if (!key || !map[key]) return;
    map[key].total += 1;
    const t = (item.type || '').toLowerCase();
    if (t.includes('connexion') || t.includes('login')) map[key].connexions += 1;
    else if (t.includes('création') || t.includes('creation') || t.includes('create')) map[key].creations += 1;
    else if (t.includes('anomalie') || t.includes('refus') || t.includes('alerte')) map[key].anomalies += 1;
  });
  return Object.values(map);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Skeleton = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-gray-100 rounded animate-pulse ${className}`} />
);

const TrendBadge = ({ value }) => {
  const num = parseFloat(value);
  const isPos = num >= 0;
  if (isNaN(num)) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPos ? 'text-emerald-500' : 'text-red-500'}`}>
      {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isPos ? '+' : ''}{num}%
    </span>
  );
};

const KpiCard = ({ icon: Icon, iconBg, label, value, delta, deltaLabel, loading, to }) => {
  const content = (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all duration-200 ${to ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium mb-1.5 truncate">{label}</p>
          {loading ? <Skeleton className="h-7 w-14" /> : (
            <p className="text-2xl font-black text-gray-900 leading-none">{value ?? '—'}</p>
          )}
          {delta !== undefined && !loading && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendBadge value={delta} />
              {deltaLabel && <span className="text-[10px] text-gray-400">{deltaLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};

const SectionHeader = ({ num, numColor, label, action, to }) => (
  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f9fafb' }}>
    <div className="flex items-center gap-2.5">
      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: numColor }}>
        {num}
      </span>
      <h3 className="text-sm font-bold text-gray-800">{label}</h3>
    </div>
    {action && to && (
      <Link to={to} className="text-xs font-semibold text-[#1428C9] hover:text-[#1020A8] transition-colors flex items-center gap-0.5">
        {action} <ArrowUpRight size={12} />
      </Link>
    )}
  </div>
);

const AlertRow = ({ icon: Icon, iconColor, iconBg, title, subtitle, time }) => (
  <div className="flex items-start gap-3 py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
      <Icon size={14} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 leading-snug">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
    <span className="text-[10px] text-gray-400 shrink-0 mt-1 whitespace-nowrap">{time}</span>
  </div>
);

const ActivityRow = ({ item }) => {
  const { icon: Icon, bg } = getActivityMeta(item.type);
  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-gray-50 transition-colors">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
        <Icon size={13} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-snug truncate">
          {item.action || item.description || item.type || 'Action système'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {item.user_name || 'Système'}{item.module ? ` · ${item.module}` : ''}
        </p>
      </div>
      <span className="text-[10px] text-gray-400 shrink-0 mt-1 whitespace-nowrap">{timeAgo(item.created_at)}</span>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, to, color = '#1428C9' }) => (
  <Link
    to={to || '#'}
    className="flex flex-col items-center gap-2 p-3.5 rounded-2xl border border-gray-100 hover:border-[#1428C9]/20 hover:bg-blue-50/40 transition-all duration-200 group active:scale-95"
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
      style={{ background: `${color}18` }}
    >
      <Icon size={20} style={{ color }} />
    </div>
    <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight group-hover:text-gray-900">{label}</span>
  </Link>
);

const SuggestionRow = ({ icon: Icon, iconBg, title, subtitle, action, actionColor, onAction }) => (
  <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={15} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 leading-snug">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
    {action && (
      <button
        onClick={onAction}
        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
        style={{ background: actionColor || '#1428C9' }}
      >
        {action}
      </button>
    )}
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations } = useChatStore();

  // Raw data from APIs
  const [apiStats, setApiStats]       = useState(null);  // historyService.getStats()
  const [users, setUsers]             = useState([]);     // userService.getUsers()
  const [historyItems, setHistory]    = useState([]);     // historyService.getHistory()
  const [allHistory, setAllHistory]   = useState([]);     // larger set for chart

  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [chartRange, setChartRange]         = useState(7);
  const [lastRefresh, setLastRefresh]       = useState(new Date());

  // Total unread from chat store
  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  // ── Fetch everything ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingStats(true);
    setLoadingHistory(true);

    // Stats + users in parallel
    const [statsRes, usersRes] = await Promise.allSettled([
      historyService.getStats(),
      userService.getUsers({ per_page: 200, all: true }),
    ]);

    if (statsRes.status === 'fulfilled') setApiStats(statsRes.value);
    if (usersRes.status === 'fulfilled') setUsers(usersRes.value?.data || []);
    setLastRefresh(new Date());
    setLoadingStats(false);

    // Recent activity (feed + chart)
    const [recentRes, allRes] = await Promise.allSettled([
      historyService.getHistory({ per_page: 8, sort_dir: 'desc' }),
      historyService.getHistory({ per_page: 200, sort_dir: 'desc' }),
    ]);

    if (recentRes.status === 'fulfilled') {
      const items = recentRes.value?.data || recentRes.value || [];
      setHistory(Array.isArray(items) ? items : []);
    }
    if (allRes.status === 'fulfilled') {
      const items = allRes.value?.data || allRes.value || [];
      setAllHistory(Array.isArray(items) ? items : []);
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived values ────────────────────────────────────────────────────────
  const activeUsers   = users.filter(u => u.statut === 'Actif').length;
  const inactiveUsers = users.filter(u => u.statut === 'Inactif').length;
  const pendingUsers  = users.filter(u => u.statut === 'En attente').length;
  const totalUsers    = users.length;

  // Total actions from real API
  const totalActions  = apiStats?.total_actions ?? 0;
  const totalConnexions = apiStats?.connexions ?? 0;
  const totalCreations  = apiStats?.creations ?? 0;
  const totalAnomalies  = apiStats?.security_alerts ?? 0;

  // Pie
  const pieData = useMemo(() => [
    { name: 'Actifs',     value: activeUsers,   color: '#22c55e' },
    { name: 'En attente', value: pendingUsers,  color: '#f59e0b' },
    { name: 'Inactifs',   value: inactiveUsers, color: '#ef4444' },
  ].filter(d => d.value > 0), [activeUsers, pendingUsers, inactiveUsers]);

  // Line chart built from real history
  const chartData = useMemo(() => buildChartData(allHistory, chartRange), [allHistory, chartRange]);

  // Dynamic alerts
  const alerts = useMemo(() => [
    pendingUsers > 0 && {
      icon: UserCheck, iconColor: 'text-amber-700', iconBg: 'bg-amber-50',
      title: `${pendingUsers} utilisateur${pendingUsers > 1 ? 's' : ''} en attente d'activation`,
      subtitle: 'Action requise', time: 'Maintenant',
    },
    inactiveUsers > 0 && {
      icon: Users, iconColor: 'text-red-500', iconBg: 'bg-red-50',
      title: `${inactiveUsers} compte${inactiveUsers > 1 ? 's' : ''} inactif${inactiveUsers > 1 ? 's' : ''}`,
      subtitle: 'Vérification recommandée', time: 'Aujourd\'hui',
    },
    totalUnread > 0 && {
      icon: MessageSquare, iconColor: 'text-blue-500', iconBg: 'bg-blue-50',
      title: `${totalUnread} message${totalUnread > 1 ? 's' : ''} non lu${totalUnread > 1 ? 's' : ''}`,
      subtitle: 'Répondre maintenant', time: 'Récent',
    },
    totalAnomalies > 0 && {
      icon: ShieldAlert, iconColor: 'text-purple-600', iconBg: 'bg-purple-50',
      title: `${totalAnomalies} anomalie${totalAnomalies > 1 ? 's' : ''} de sécurité détectée${totalAnomalies > 1 ? 's' : ''}`,
      subtitle: 'Revue de sécurité recommandée', time: 'Aujourd\'hui',
    },
    {
      icon: ShieldAlert, iconColor: 'text-purple-400', iconBg: 'bg-gray-50',
      title: 'Audit périodique des permissions recommandé',
      subtitle: 'Bonne pratique de sécurité', time: 'Périodique',
    },
  ].filter(Boolean), [pendingUsers, inactiveUsers, totalUnread, totalAnomalies]);

  // Suggestions dynamiques
  const suggestions = useMemo(() => [
    pendingUsers > 0 && {
      icon: UserCheck, iconBg: 'bg-amber-500',
      title: `${pendingUsers} utilisateur${pendingUsers > 1 ? 's' : ''} sans activation`,
      subtitle: 'Souhaitez-vous envoyer une invitation ?',
      action: 'Relancer', actionColor: '#1428C9',
      onAction: () => navigate('/dashboard/users'),
    },
    totalAnomalies > 0 && {
      icon: ShieldAlert, iconBg: 'bg-red-500',
      title: `${totalAnomalies} anomalie${totalAnomalies > 1 ? 's' : ''} à traiter`,
      subtitle: 'Des activités suspectes ont été détectées',
      action: 'Voir historique', actionColor: '#dc2626',
      onAction: () => navigate('/dashboard/historique'),
    },
    totalConnexions > 0 && {
      icon: Activity, iconBg: 'bg-blue-500',
      title: `${totalConnexions} connexion${totalConnexions > 1 ? 's' : ''} enregistrée${totalConnexions > 1 ? 's' : ''}`,
      subtitle: 'Activité de connexion normale',
      action: 'Voir analyse', actionColor: '#0ea5e9',
      onAction: () => navigate('/dashboard/historique'),
    },
    {
      icon: Folder, iconBg: 'bg-orange-500',
      title: 'Dossiers en attente de validation',
      subtitle: 'Ils attendent votre action',
      action: 'Voir dossiers', actionColor: '#f97316',
      onAction: () => navigate('/dashboard/dossiers'),
    },
    {
      icon: Shield, iconBg: 'bg-emerald-500',
      title: 'Vérification des rôles et permissions',
      subtitle: `${totalUsers} utilisateur${totalUsers > 1 ? 's' : ''} actif${totalUsers > 1 ? 's' : ''} au total`,
      action: 'Gérer rôles', actionColor: '#22c55e',
      onAction: () => navigate('/dashboard/roles-permissions'),
    },
  ].filter(Boolean), [pendingUsers, totalAnomalies, totalConnexions, totalUsers, navigate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Smart Control Center</h1>
          <p className="text-sm text-gray-400 mt-1">Vue d'ensemble intelligente et actions rapides</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={loadingStats}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingStats ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard icon={Users}        iconBg="bg-blue-500"    label="Utilisateurs actifs"
          value={activeUsers}   loading={loadingStats} delta={null} to="/dashboard/users" />
        <KpiCard icon={FileText}     iconBg="bg-emerald-500" label="Actions enregistrées"
          value={totalActions}  loading={loadingStats} delta={null} to="/dashboard/historique" />
        <KpiCard icon={AlertTriangle} iconBg="bg-amber-500"  label="Alertes actives"
          value={alerts.length} loading={loadingStats} delta={null} />
        <KpiCard icon={CheckSquare}  iconBg="bg-purple-500"  label="Comptes en attente"
          value={pendingUsers}  loading={loadingStats} delta={null} to="/dashboard/users" />
        <KpiCard icon={MessageSquare} iconBg="bg-indigo-500" label="Messages non lus"
          value={totalUnread}   loading={false}        delta={null} to="/dashboard/communication" />
      </div>

      {/* ── Main 3-col Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Col 1 */}
        <div className="space-y-5">

          {/* Alertes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader num="1" numColor="#ef4444" label="Alertes système en temps réel"
              action="Voir tout" to="/dashboard/historique" />
            <div className="divide-y divide-gray-50">
              {loadingStats ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="w-8 h-8 rounded-xl" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" /></div>
                </div>
              )) : alerts.length > 0 ? alerts.slice(0, 5).map((a, i) => (
                <AlertRow key={i} {...a} />
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-2">
                    <CheckSquare size={20} className="text-green-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Aucune alerte active</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tout fonctionne normalement</p>
                </div>
              )}
            </div>
          </div>

          {/* Activité en direct */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader num="3" numColor="#8b5cf6" label="Activité en direct"
              action="Voir tout" to="/dashboard/historique" />
            <div className="divide-y divide-gray-50">
              {loadingHistory ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-2.5 w-1/2" /></div>
                </div>
              )) : historyItems.length > 0 ? historyItems.map((h, i) => (
                <ActivityRow key={i} item={h} />
              )) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-400">Aucune activité récente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-5">

          {/* Actions rapides */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader num="2" numColor="#1428C9" label="Actions rapides" />
            <div className="p-4 grid grid-cols-3 gap-2">
              <QuickAction icon={UserPlus}     label="Créer un utilisateur"  to="/dashboard/users"              color="#1428C9" />
              <QuickAction icon={Users}        label="Gérer utilisateurs"    to="/dashboard/users"              color="#6366f1" />
              <QuickAction icon={Shield}       label="Assigner un rôle"      to="/dashboard/roles-permissions"  color="#8b5cf6" />
              <QuickAction icon={MessageSquare} label="Envoyer un message"   to="/dashboard/communication"      color="#0ea5e9" />
              <QuickAction icon={Bell}         label="Voir notifications"     to="/dashboard/historique"         color="#f59e0b" />
              <QuickAction icon={CheckSquare}  label="Créer une tâche"       to="/dashboard/tasks"              color="#22c55e" />
              <QuickAction icon={Folder}       label="Nouveau dossier"       to="/dashboard/dossiers"           color="#f97316" />
              <QuickAction icon={BarChart2}    label="Rapport rapide"        to="/dashboard/historique"         color="#ec4899" />
              <QuickAction icon={Settings}     label="Paramètres"            to="/dashboard/settings"           color="#64748b" />
            </div>
          </div>

          {/* Performances — chart 100% réel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-800">Aperçu des performances</h3>
              <select
                value={chartRange}
                onChange={e => setChartRange(Number(e.target.value))}
                className="text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none bg-white"
              >
                <option value={7}>7 derniers jours</option>
                <option value={14}>14 derniers jours</option>
                <option value={30}>30 derniers jours</option>
              </select>
            </div>

            {/* Mini KPIs from real data */}
            <div className="grid grid-cols-2 divide-x divide-gray-50 border-b border-gray-50">
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-1">Actions totales</p>
                {loadingStats ? <Skeleton className="h-6 w-12 mt-1" /> : (
                  <p className="text-xl font-black text-gray-900">{totalActions.toLocaleString('fr-FR')}</p>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-1">Connexions</p>
                {loadingStats ? <Skeleton className="h-6 w-12 mt-1" /> : (
                  <p className="text-xl font-black text-gray-900">{totalConnexions.toLocaleString('fr-FR')}</p>
                )}
              </div>
            </div>

            <div className="p-4">
              {loadingHistory ? (
                <div className="h-[160px] flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-gray-300" />
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="total"      stroke="#1428C9" strokeWidth={2} dot={false} name="Total" />
                      <Line type="monotone" dataKey="connexions" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Connexions" strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="anomalies"  stroke="#ef4444" strokeWidth={1.5} dot={false} name="Anomalies" strokeDasharray="2 2" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2 justify-center">
                    {[
                      { color: '#1428C9', label: 'Total' },
                      { color: '#22c55e', label: 'Connexions' },
                      { color: '#ef4444', label: 'Anomalies' },
                    ].map(({ color, label }) => (
                      <span key={label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <span className="w-3.5 h-0.5 inline-block rounded" style={{ background: color }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Col 3 */}
        <div className="space-y-5">

          {/* Suggestions dynamiques */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader num="4" numColor="#22c55e" label="Suggestions intelligentes"
              action="Voir tout" to="/dashboard/users" />
            <div className="divide-y divide-gray-50">
              {loadingStats ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" /></div>
                  <Skeleton className="w-16 h-6 rounded-lg" />
                </div>
              )) : suggestions.slice(0, 5).map((s, i) => (
                <SuggestionRow key={i} {...s} />
              ))}
            </div>
          </div>

          {/* Répartition utilisateurs — données réelles */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-800">Répartition des utilisateurs</h3>
              <Link to="/dashboard/users" className="text-xs font-semibold text-[#1428C9] hover:underline flex items-center gap-0.5">
                Voir tout <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="p-4">
              {loadingStats ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-gray-300" />
                </div>
              ) : pieData.length > 0 ? (
                <>
                  <div className="flex justify-center">
                    <div className="relative">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" isAnimationActive={true} animationDuration={800}>
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-2xl font-black text-gray-900">{totalUsers}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-gray-600 font-medium">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800">{d.value}</span>
                          <span className="text-gray-400 text-[10px]">
                            ({totalUsers > 0 ? Math.round((d.value / totalUsers) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mini progress bars */}
                  <div className="mt-3 space-y-1.5">
                    {[
                      { label: 'Connexions', value: totalConnexions, max: totalActions, color: '#22c55e' },
                      { label: 'Créations',  value: totalCreations,  max: totalActions, color: '#1428C9' },
                      { label: 'Anomalies',  value: totalAnomalies,  max: totalActions, color: '#ef4444' },
                    ].map(({ label, value, max, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                          <span>{label}</span>
                          <span className="font-semibold text-gray-600">{value}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: max > 0 ? `${Math.min((value / max) * 100, 100)}%` : '0%', background: color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-800">
              {loadingStats ? '— utilisateurs actifs' : `${activeUsers} utilisateur${activeUsers > 1 ? 's' : ''} actif${activeUsers > 1 ? 's' : ''}`}
            </p>
            <Link to="/dashboard/users" className="text-xs text-[#1428C9] hover:underline">Voir la liste</Link>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Clock size={15} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Dernière actualisation</p>
            <p className="text-xs text-gray-400">
              Aujourd'hui à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckSquare size={15} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">
              {loadingStats ? '— actions' : `${totalActions.toLocaleString('fr-FR')} action${totalActions > 1 ? 's' : ''} totales`}
            </p>
            <p className="text-xs text-gray-400">Tous les services sont actifs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
