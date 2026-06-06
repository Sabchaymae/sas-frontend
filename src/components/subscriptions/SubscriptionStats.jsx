import React from 'react';
import { Send, Clock, CheckCircle2, XCircle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, footer }) => (
  <div className="stat-card">
    <div className="stat-header">
      <span className="stat-label">{label}</span>
      <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={18} />
      </div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-footer">{footer}</div>
  </div>
);

const SubscriptionStats = ({ stats }) => {
  const defaultStats = [
    { label: 'Total Sent', value: '5', icon: Send, color: '#2563eb', footer: 'All registered system entries' },
    { label: 'Pending', value: '2', icon: Clock, color: '#3b82f6', footer: 'Awaiting validation review' },
    { label: 'Validated', value: '1', icon: CheckCircle2, color: '#10b981', footer: 'Confirmed and active' },
    { label: 'Refused', value: '1', icon: XCircle, color: '#ef4444', footer: 'Declined applications' },
  ];

  const displayStats = stats || defaultStats;

  return (
    <div className="stats-grid">
      {displayStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default SubscriptionStats;
