import React, { useState, useMemo } from 'react';
import SubscriptionStats from '../components/subscriptions/SubscriptionStats';
import SubscriptionTable from '../components/subscriptions/SubscriptionTable';
import SubscriptionFilters from '../components/subscriptions/SubscriptionFilters';
import SubscriptionDetailsDrawer from '../components/subscriptions/SubscriptionDetailsDrawer';
import ValidationDrawer from '../components/subscriptions/ValidationDrawer';
import { jsPDF } from 'jspdf';
import { RotateCcw } from 'lucide-react';
import 'jspdf-autotable';
import '../styles/subscriptions.css';

const AssistantSubscriptionsPage = () => {
  const [data, setData] = useState([
    {
      id: 1,
      client: { name: 'Ahmed Bennani', address: '123 Rue de la Liberté, Cas...', avatar: 'AB' },
      contact: { phone: '+212 661 234 567', cin: 'AB123456' },
      operator: { name: 'IAM', type: 'Fibre Optique', color: '#004595' },
      status: 'PENDING',
      validator: 'Sarah Johnson',
      date: '2026-04-08'
    },
    {
      id: 2,
      client: { name: 'Fatima Zahra', address: '456 Avenue Mohammed V, ...', avatar: 'FZ' },
      contact: { phone: '+212 662 987 654', cin: 'FZ789012' },
      operator: { name: 'Orange', type: 'Mobile Postpaid', color: '#FF6600' },
      status: 'REFUSED',
      validator: 'Sarah Johnson',
      date: '2026-04-09'
    },
    {
      id: 3,
      client: { name: 'Karim Mansouri', address: 'Rue Agadir, Tangier', avatar: 'KM' },
      contact: { phone: '+212 660 112 233', cin: 'KM556677' },
      operator: { name: 'Inwi', type: 'ADSL Home', color: '#722E85' },
      status: 'VALIDATED',
      validator: 'Sarah Johnson',
      date: '2026-04-09'
    }
  ]);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({ operator: 'All', status: 'All', startDate: '', endDate: '' });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.contact.cin.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOperator = filters.operator === 'All' || item.operator.name === filters.operator;
      const matchesStatus = filters.status === 'All' || item.status === filters.status;
      const itemDate = new Date(item.date);
      const matchesStartDate = !filters.startDate || itemDate >= new Date(filters.startDate);
      const matchesEndDate = !filters.endDate || itemDate <= new Date(filters.endDate);
      return matchesSearch && matchesOperator && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [data, searchQuery, filters]);

  const handleValidateClick = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(false);
    setIsValidationOpen(true);
  };

  const handleRefuseClick = (item) => {
    if (window.confirm(`Refuser le dossier de ${item.client.name} ?`)) {
      setData(prev => prev.map(i => i.id === item.id ? { ...i, status: 'REFUSED' } : i));
      setIsDetailsOpen(false);
    }
  };

  const handleConfirmValidation = (item) => {
    setData(prev => prev.map(i => i.id === item.id ? { ...i, status: 'VALIDATED' } : i));
    setIsValidationOpen(false);
    alert('Dossier validé avec succès !');
  };

  const handleExport = (format) => {
    // Logic remains same as original but maybe with assistant specific headers
    const timestamp = new Date().toLocaleString();
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text("ORIOTEL ERP - Management Report", 14, 20);
      doc.autoTable({
        startY: 30,
        head: [['CLIENT', 'CIN', 'OPERATOR', 'STATUS', 'DATE']],
        body: filteredData.map(i => [i.client.name, i.contact.cin, i.operator.name, i.status, i.date]),
      });
      doc.save(`export_${new Date().getTime()}.pdf`);
    }
  };

  return (
    <div className="subscriptions-container animate-in fade-in duration-500">
      <div className="page-header">
        <h1 className="page-title text-3xl">Subscriptions Management</h1>
        <p className="page-subtitle text-slate-500 font-medium">Manage and validate subscription requests</p>
      </div>

      {/* Custom Stats Grid to match Screenshot 1 */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="stat-card group">
          <div className="stat-header">
            <span className="stat-label">TOTAL SENT</span>
            <div className="stat-icon-wrapper bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </div>
          </div>
          <span className="stat-value">5</span>
          <span className="stat-footer">All registered system entries</span>
        </div>
        
        <div className="stat-card group">
          <div className="stat-header">
            <span className="stat-label">PENDING</span>
            <div className="stat-icon-wrapper bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <span className="stat-value">2</span>
          <span className="stat-footer">Awaiting validation review</span>
        </div>

        <div className="stat-card group">
          <div className="stat-header">
            <span className="stat-label">VALIDATED</span>
            <div className="stat-icon-wrapper bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <span className="stat-value">1</span>
          <span className="stat-footer">Confirmed and active</span>
        </div>

        <div className="stat-card group">
          <div className="stat-header">
            <span className="stat-label">REFUSED</span>
            <div className="stat-icon-wrapper bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
          </div>
          <span className="stat-value">1</span>
          <span className="stat-footer">Declined applications</span>
        </div>
      </div>

      <div className="content-card border-none shadow-xl shadow-slate-100">
        <div className="content-tabs px-8">
          <div className="tab-item active">Total Subscription</div>
        </div>
        
        <SubscriptionFilters 
          onAddClick={null} 
          onSearch={setSearchQuery}
          onExport={handleExport}
          onFilterToggle={() => setIsFilterVisible(!isFilterVisible)}
        />

        {isFilterVisible && (
          <div className="filter-panel px-8 py-6 bg-slate-50/50">
            <div className="filter-group">
              <span className="filter-label">Operator</span>
              <select className="filter-select font-bold" value={filters.operator} onChange={e => setFilters(f => ({...f, operator: e.target.value}))}>
                <option value="All">All Operators</option>
                <option value="IAM">IAM</option>
                <option value="Orange">Orange</option>
                <option value="Inwi">Inwi</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Status</span>
              <select className="filter-select font-bold" value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))}>
                <option value="All">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="VALIDATED">Validated</option>
                <option value="REFUSED">Refused</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">De</span>
              <input type="date" className="filter-input-date font-bold" value={filters.startDate} onChange={e => setFilters(f => ({...f, startDate: e.target.value}))} />
            </div>
            <div className="filter-group">
              <span className="filter-label">À</span>
              <input type="date" className="filter-input-date font-bold" value={filters.endDate} onChange={e => setFilters(f => ({...f, endDate: e.target.value}))} />
            </div>
            <button className="btn-reset-filters bg-white border border-slate-200 shadow-sm" onClick={() => { setFilters({operator:'All', status:'All', startDate:'', endDate:''}); setSearchQuery(''); }}>
              <RotateCcw size={14} /> <span className="font-black">Réinitialiser</span>
            </button>
          </div>
        )}
        
        <div className="px-4">
          <SubscriptionTable 
            data={filteredData} 
            onView={(item) => { setSelectedItem(item); setIsDetailsOpen(true); }}
            onEdit={handleValidateClick} 
            onDelete={handleRefuseClick}
            isAssistant={true}
          />
        </div>

        <div className="p-6 border-t border-slate-50 flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Showing 1 to {filteredData.length} of {data.length} entries</span>
            <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg></button>
                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-400">2</button>
                <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-400">3</button>
                <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg></button>
            </div>
        </div>
      </div>

      <SubscriptionDetailsDrawer 
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedItem(null); }}
        data={selectedItem}
        showActions={selectedItem?.status === 'PENDING'} 
        onValidate={handleValidateClick}
        onRefuse={handleRefuseClick}
      />

      <ValidationDrawer 
        isOpen={isValidationOpen}
        onClose={() => { setIsValidationOpen(false); setSelectedItem(null); }}
        data={selectedItem}
        onConfirm={handleConfirmValidation}
      />
    </div>
  );
};

export default AssistantSubscriptionsPage;
