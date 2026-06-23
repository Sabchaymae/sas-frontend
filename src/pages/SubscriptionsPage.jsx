import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import SubscriptionDetailsDrawer from '../components/subscriptions/SubscriptionDetailsDrawer';
import SubscriptionDrawer from '../components/subscriptions/SubscriptionDrawer';
import ValidationDrawer from '../components/subscriptions/ValidationDrawer';
import RefusalDrawer from '../components/subscriptions/RefusalDrawer';
import { Eye, Plus, Clock, CheckCircle, XCircle, Send, Edit2, Trash2, Filter, Download } from 'lucide-react';
import '../styles/subscriptions.css';

const MOCK_DATA = [
  {
    id: 'SUB-2024-8453',
    client: { name: 'Ahmed Bennani', avatar: 'AB' },
    contact: { phone: '+212 661 234 567', cin: 'AB123456' },
    address: '123 Rue de la Liberté, Casablanca',
    operator: { name: 'IAM', type: 'Fibre Optique', color: '#004595' },
    status: 'PENDING',
    validator: 'Sarah Johnson',
    date: '2024-04-08'
  },
  {
    id: 'SUB-2024-8454',
    client: { name: 'Fatima Zahra', avatar: 'FZ' },
    contact: { phone: '+212 662 987 654', cin: 'FZ789012' },
    address: '123 Rue de la Liberté, Casablanca',
    operator: { name: 'Orange', type: 'Mobile Postpaid', color: '#FF6600' },
    status: 'REFUSED',
    validator: 'Sarah Johnson',
    date: '2024-04-09'
  },
  {
    id: 'SUB-2024-8455',
    client: { name: 'Youssef El Amrani', avatar: 'YA' },
    contact: { phone: '+212 660 112 233', cin: 'YE345678' },
    address: '123 Rue de la Liberté, Casablanca',
    operator: { name: 'Inwi', type: 'ADSL Home', color: '#722E85' },
    status: 'VALIDATED',
    validator: 'Sarah Johnson',
    date: '2024-04-09'
  }
];

const statusConfig = {
  PENDING:   { label: 'Pending',   color: 'bg-orange-50 text-orange-600 border border-orange-200' },
  VALIDATED: { label: 'Validated', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  REFUSED:   { label: 'Refused',   color: 'bg-red-50 text-red-500 border border-red-200' },
};

const SubscriptionsPage = () => {
  const user = useSelector(selectUser);
  const isAssistant = user?.role?.toLowerCase() === 'assistant' || user?.email === 'assistante@oriotel.com';

  const [data, setData] = useState(MOCK_DATA);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false); // New/Edit Form
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isRefusalOpen, setIsRefusalOpen] = useState(false);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchQuery.toLowerCase();
      return !q ||
        item.client.name.toLowerCase().includes(q) ||
        item.contact.cin.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
    });
  }, [data, searchQuery]);

  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter(d => d.status === 'PENDING').length,
    validated: data.filter(d => d.status === 'VALIDATED').length,
    refused: data.filter(d => d.status === 'REFUSED').length,
  }), [data]);

  const handleAddClick = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const openDetails = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleValidateClick = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(false);
    setTimeout(() => setIsValidationOpen(true), 100);
  };

  const handleRefuseClick = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(false);
    setTimeout(() => setIsRefusalOpen(true), 100);
  };

  const handleFormSubmit = (formData) => {
    if (selectedItem) {
      // Edit mode
      setData(prev => prev.map(i => i.id === selectedItem.id ? { ...i, ...formData } : i));
    } else {
      // Create mode
      const newItem = {
        id: `SUB-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        client: { name: 'Nouveau Client', avatar: 'NC' },
        contact: { phone: '...', cin: '...' },
        address: '...',
        operator: { name: formData.operator, type: formData.plan, color: '#004595' },
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0]
      };
      setData(prev => [newItem, ...prev]);
    }
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      setData(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleConfirmValidation = () => {
    setData(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: 'VALIDATED' } : i));
    setIsValidationOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmRefusal = (reason) => {
    setData(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: 'REFUSED', refusalReason: reason } : i));
    setIsRefusalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="subscriptions-container animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Subscriptions Management</h1>
        <p className="text-sm font-bold text-slate-400 mt-1">Manage and validate subscription requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {[
          { label: 'TOTAL', value: stats.total, icon: <Send size={18}/>, bg: 'bg-blue-50', color: 'text-blue-600', desc: 'All registered entries' },
          { label: 'PENDING', value: stats.pending, icon: <Clock size={18}/>, bg: 'bg-orange-50', color: 'text-orange-600', desc: 'Awaiting review' },
          { label: 'VALIDATED', value: stats.validated, icon: <CheckCircle size={18}/>, bg: 'bg-emerald-50', color: 'text-emerald-600', desc: 'Confirmed active' },
          { label: 'REFUSED', value: stats.refused, icon: <XCircle size={18}/>, bg: 'bg-red-50', color: 'text-red-500', desc: 'Declined applications' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              <div className={`p-2 ${s.bg} ${s.color} rounded-xl`}>{s.icon}</div>
            </div>
            <div className="text-4xl font-black text-slate-900">{s.value}</div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[28px] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-8">
          <button className="py-5 px-5 text-sm font-black text-blue-600 border-b-2 border-blue-600">Total Subscription</button>
          <button className="py-5 px-5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Validated Subscription</button>
          <button className="py-5 px-5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Pending Subscription</button>
          <button className="py-5 px-5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Refused</button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search by ID, name, or CIN..."
              className="pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:bg-white transition-all w-72"
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
               <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
               <Download size={16} /> Export
            </button>
            {!isAssistant && (
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                onClick={handleAddClick}
              >
                <Plus size={16} />
                Add Subscription
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">No.</th>
                <th className="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">CIN</th>
                <th className="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</th>
                <th className="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                <th className="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type d'Objectif</th>
                <th className="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(row => {
                const sc = statusConfig[row.status] || statusConfig.PENDING;
                return (
                  <tr key={row.id} className="border-t border-slate-50 hover:bg-slate-50/40 transition-colors group">
                    <td className="py-5 px-8 text-xs font-bold text-slate-400">{row.id}</td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">{row.client.avatar}</div>
                        <span className="text-sm font-extrabold text-slate-900">{row.client.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-sm font-bold text-slate-500">{row.contact.cin}</td>
                    <td className="py-5 px-8 text-xs font-bold text-slate-400 max-w-[180px] truncate">{row.address}</td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.operator.color }}></span>
                        <span className="text-xs font-black text-slate-700">{row.operator.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{row.operator.type}</span>
                    </td>
                    <td className="py-5 px-8">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          onClick={() => openDetails(row)}
                        >
                          <Eye size={17} />
                        </button>
                        {!isAssistant && (
                          <>
                            <button 
                              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                              onClick={() => handleEditClick(row)}
                            >
                              <Edit2 size={17} />
                            </button>
                            <button 
                              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              onClick={() => handleDeleteClick(row.id)}
                            >
                              <Trash2 size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide 1: Détails du dossier */}
      <SubscriptionDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedItem(null); }}
        data={selectedItem}
        showActions={isAssistant && selectedItem?.status === 'PENDING'}
        onValidate={handleValidateClick}
        onRefuse={handleRefuseClick}
      />

      {/* Slide New/Edit (Animateur/Admin) */}
      <SubscriptionDrawer
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedItem(null); }}
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
      />

      {/* Slide 2: Validation Assistante (Numéro fixe + Contrat) */}
      <ValidationDrawer
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        data={selectedItem}
        onConfirm={handleConfirmValidation}
      />

      {/* Refus Drawer */}
      <RefusalDrawer
        isOpen={isRefusalOpen}
        onClose={() => setIsRefusalOpen(false)}
        data={selectedItem}
        onConfirm={handleConfirmRefusal}
      />
    </div>
  );
};

export default SubscriptionsPage;
