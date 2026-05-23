import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import SubscriptionDetailsDrawer from '../components/subscriptions/SubscriptionDetailsDrawer';
import SubscriptionDrawer from '../components/subscriptions/SubscriptionDrawer';
import ValidationDrawer from '../components/subscriptions/ValidationDrawer';
import RefusalDrawer from '../components/subscriptions/RefusalDrawer';
import { Eye, Plus, Clock, CheckCircle, XCircle, Send, Edit2, Trash2, Filter, Download, RotateCcw } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import '../styles/subscriptions.css';

const statusConfig = {
  PENDING:   { label: 'Pending',   color: 'bg-orange-50 text-orange-600 border border-orange-200' },
  'En attente': { label: 'Pending', color: 'bg-orange-50 text-orange-600 border border-orange-200' },
  'Brouillon': { label: 'Draft', color: 'bg-slate-100 text-slate-600 border border-slate-200' },
  VALIDATED: { label: 'Validated', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  'Validé': { label: 'Validated', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  REFUSED:   { label: 'Refused',   color: 'bg-red-50 text-red-500 border border-red-200' },
  'Refusé':   { label: 'Refused',   color: 'bg-red-50 text-red-500 border border-red-200' },
};

const SubscriptionsPage = () => {
  const user = useSelector(selectUser);
  const isAssistant = user?.role?.toLowerCase() === 'assistant' || user?.email === 'assistante@oriotel.com';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Tous');

  // Drawer states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isRefusalOpen, setIsRefusalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    operator: 'All',
    offre: 'All',
    segment: 'All',
    startDate: '',
    endDate: '',
  });

  const exportDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportOpen]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await subscriptionService.getAll();
      if (res.success) {
        // Map backend format to frontend format for UI compatibility
        const mappedData = res.data.map(item => ({
          id: item.id.toString(),
          realId: item.id,
          client: { name: `${item.client_prenom} ${item.client_nom}`, avatar: item.client_prenom?.[0] || '?' },
          rawNom: item.client_nom,
          rawPrenom: item.client_prenom,
          dateNaissance: item.date_naissance,
          contact: { phone: item.client_telephone || '—', cin: item.client_cin },
          address: item.adresse || '—',
          operator: { name: item.operateur, type: item.type_objectif, color: '#004595' },
          segment: item.sous_type || '—',
          status: item.statut,
          date: item.created_at ? item.created_at.split('T')[0] : 'N/A',
          refusalReason: item.motif_refus,
          cinRectoPath: item.cin_recto_path,
          cinVersoPath: item.cin_verso_path,
          contratPath: item.contrat_path,
        }));
        setData(mappedData);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.client.name.toLowerCase().includes(q) ||
        item.contact.cin.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      let matchesTab = true;
      if (selectedTab !== 'Tous') {
        const s = item.status;
        if (selectedTab === 'En attente') matchesTab = (s === 'En attente' || s === 'PENDING');
        else if (selectedTab === 'Validé') matchesTab = (s === 'Validé' || s === 'VALIDATED');
        else if (selectedTab === 'Refusé') matchesTab = (s === 'Refusé' || s === 'REFUSED');
        else if (selectedTab === 'Brouillon') matchesTab = (s === 'Brouillon');
      }

      const matchesOperator = advFilters.operator === 'All' || 
        item.operator?.name?.toLowerCase() === advFilters.operator.toLowerCase();

      const matchesOffre = advFilters.offre === 'All' || 
        item.operator?.type?.toLowerCase() === advFilters.offre.toLowerCase();

      const matchesSegment = advFilters.segment === 'All' || 
        item.segment?.toLowerCase().includes(advFilters.segment.toLowerCase());

      let matchesDate = true;
      if (item.date && item.date !== 'N/A') {
        const itemDate = new Date(item.date);
        if (advFilters.startDate) {
          const start = new Date(advFilters.startDate);
          start.setHours(0,0,0,0);
          if (itemDate < start) matchesDate = false;
        }
        if (advFilters.endDate) {
          const end = new Date(advFilters.endDate);
          end.setHours(23,59,59,999);
          if (itemDate > end) matchesDate = false;
        }
      } else if (advFilters.startDate || advFilters.endDate) {
        matchesDate = false;
      }

      return matchesSearch && matchesTab && matchesOperator && matchesOffre && matchesSegment && matchesDate;
    });
  }, [data, searchQuery, selectedTab, advFilters]);

  const stats = useMemo(() => {
    const baseFiltered = data.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.client.name.toLowerCase().includes(q) ||
        item.contact.cin.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      const matchesOperator = advFilters.operator === 'All' || 
        item.operator?.name?.toLowerCase() === advFilters.operator.toLowerCase();

      const matchesOffre = advFilters.offre === 'All' || 
        item.operator?.type?.toLowerCase() === advFilters.offre.toLowerCase();

      const matchesSegment = advFilters.segment === 'All' || 
        item.segment?.toLowerCase().includes(advFilters.segment.toLowerCase());

      let matchesDate = true;
      if (item.date && item.date !== 'N/A') {
        const itemDate = new Date(item.date);
        if (advFilters.startDate) {
          const start = new Date(advFilters.startDate);
          start.setHours(0,0,0,0);
          if (itemDate < start) matchesDate = false;
        }
        if (advFilters.endDate) {
          const end = new Date(advFilters.endDate);
          end.setHours(23,59,59,999);
          if (itemDate > end) matchesDate = false;
        }
      } else if (advFilters.startDate || advFilters.endDate) {
        matchesDate = false;
      }

      return matchesSearch && matchesOperator && matchesOffre && matchesSegment && matchesDate;
    });

    return {
      total: baseFiltered.length,
      pending: baseFiltered.filter(d => d.status === 'En attente' || d.status === 'PENDING').length,
      validated: baseFiltered.filter(d => d.status === 'Validé' || d.status === 'VALIDATED').length,
      refused: baseFiltered.filter(d => d.status === 'Refusé' || d.status === 'REFUSED').length,
    };
  }, [data, searchQuery, advFilters]);

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

  const handleFormSubmit = async (formData) => {
    try {
      // The service builds FormData internally from these fields
      const payload = {
        nom:           formData.nom,
        prenom:        formData.prenom,
        cin:           formData.cin,
        telephone:     formData.telephone,
        date_naissance: formData.date_naissance,
        adresse:       formData.adresse,
        operator:      formData.operator,
        plan:          formData.plan,
        segment:       formData.segment,
        is_draft:      formData.is_draft || false,
        cinRectoFile:  formData.cinRectoFile,
        cinVersoFile:  formData.cinVersoFile,
      };

      if (selectedItem) {
        await subscriptionService.update(selectedItem.realId, payload);
      } else {
        await subscriptionService.create(payload);
      }
      fetchSubscriptions();
      setIsFormOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error saving subscription', err);
      const msg = err.message || 'Error saving subscription';
      alert(msg);
    }
  };

  const handleDeleteClick = async (id, realId) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await subscriptionService.delete(realId);
        fetchSubscriptions();
      } catch (err) {
        console.error('Error deleting', err);
      }
    }
  };

  const handleConfirmValidation = async (validationData) => {
    try {
      await subscriptionService.updateStatus(selectedItem.realId, {
        statut: 'Validé',
        numeroLigneFixe: validationData.fixedNumber,
        contratFile: validationData.uploadedFile
      });
      fetchSubscriptions();
      setIsValidationOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error validating', err);
    }
  };

  const handleConfirmRefusal = async (reason) => {
    try {
      await subscriptionService.updateStatus(selectedItem.realId, {
        statut: 'Refusé',
        motifRefus: reason
      });
      fetchSubscriptions();
      setIsRefusalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error refusing', err);
    }
  };

  const OPERATOR_COLORS = { 'Orange':'orange','orange':'orange','Inwi':'purple','inwi':'purple','IAM':'blue','iam':'blue','Maroc Telecom':'blue' };

  const getStatusPill = (status) => {
    const map = {
      'En attente': { cls:'pending', label:'En attente' },
      'PENDING':    { cls:'pending', label:'En attente' },
      'Validé':     { cls:'validated', label:'Validé' },
      'VALIDATED':  { cls:'validated', label:'Validé' },
      'Refusé':     { cls:'refused', label:'Refusé' },
      'REFUSED':    { cls:'refused', label:'Refusé' },
      'Brouillon':  { cls:'draft',  label:'Brouillon' },
    };
    return map[status] || { cls:'draft', label: status };
  };

  const isPending = (s) => s === 'En attente' || s === 'PENDING';

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Nom', 'Prénom', 'CIN', 'Téléphone', 'Adresse', 'Opérateur', 'Offre', 'Segment', 'Statut'];
    const rows = filteredData.map(item => [
      item.id,
      item.date,
      item.rawNom || '',
      item.rawPrenom || '',
      item.contact.cin || '',
      item.contact.phone || '',
      item.address || '',
      item.operator?.name || '',
      item.operator?.type || '',
      item.segment || '',
      item.status || ''
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(';'),
      ...rows.map(e => e.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `souscriptions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Date de création', 'Nom', 'Prénom', 'CIN', 'Téléphone', 'Adresse', 'Opérateur', 'Offre', 'Segment', 'Statut'];
    const rows = filteredData.map(item => [
      item.id,
      item.date,
      item.rawNom || '',
      item.rawPrenom || '',
      item.contact.cin || '',
      item.contact.phone || '',
      item.address || '',
      item.operator?.name || '',
      item.operator?.type || '',
      item.segment || '',
      item.status || ''
    ]);

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Souscriptions</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: sans-serif; width: 100%; }
          th { background-color: #004595; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(val => `<td>${(val || '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `souscriptions_export_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const headers = ['ID', 'Client', 'CIN', 'Téléphone', 'Adresse', 'Opérateur', 'Offre', 'Segment', 'Statut'];
    const rows = filteredData.map(item => `
      <tr>
        <td style="font-weight: bold; color: #64748b;">#${item.id}</td>
        <td>
          <div style="font-weight: bold; color: #1e293b;">${item.client.name}</div>
          <div style="font-size: 10px; color: #64748b;">Le ${item.date}</div>
        </td>
        <td style="font-family: monospace; font-weight: bold;">${item.contact.cin}</td>
        <td>${item.contact.phone}</td>
        <td style="max-width: 150px; font-size: 11px; word-break: break-all;">${item.address}</td>
        <td>
          <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; 
            ${item.operator?.name === 'Orange' ? 'background-color: #fff7ed; color: #ea580c; border: 1px solid #ffedd5;' : 
              item.operator?.name === 'Inwi' ? 'background-color: #faf5ff; color: #7e22ce; border: 1px solid #f3e8ff;' : 
              'background-color: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe;'}">
            ${item.operator?.name}
          </span>
        </td>
        <td><span style="font-size: 11px; font-weight: bold; color: #475569;">${item.operator?.type}</span></td>
        <td>
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; 
            ${item.segment?.includes('B2B') ? 'background-color: #eff6ff; color: #2563eb;' : 'background-color: #f0fdfa; color: #0d9488;'}">
            ${item.segment}
          </span>
        </td>
        <td>
          <span style="font-size: 11px; font-weight: bold;
            ${item.status === 'Validé' || item.status === 'VALIDATED' ? 'color: #16a34a;' : 
              item.status === 'Refusé' || item.status === 'REFUSED' ? 'color: #dc2626;' : 'color: #d97706;'}">
            ${item.status}
          </span>
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
      <head>
        <title>Orioptel - Rapport d'Abonnements</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #334155; margin: 30px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #004595; letter-spacing: -0.5px; }
          .logo span { color: #ea580c; }
          .title { text-align: right; }
          .title h1 { margin: 0; font-size: 20px; color: #1e293b; }
          .title p { margin: 5px 0 0 0; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f8fafc; color: #475569; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding: 12px 10px; text-align: left; }
          td { border-bottom: 1px solid #f1f5f9; padding: 12px 10px; font-size: 12px; color: #334155; text-align: left; }
          tr:nth-child(even) { background-color: #f8fafc/50; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <img src="${window.location.origin}/logo-oriotel.svg" style="height: 45px; width: auto; display: block;" alt="Oriotel" />
          </div>
          <div class="title">
            <h1>Rapport des Abonnements</h1>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </div>
        
        <p style="font-size: 12px; color: #475569; font-weight: bold; margin-bottom: 20px;">
          Filtres appliqués : Tab - ${selectedTab} | Total dossiers : ${filteredData.length}
        </p>

        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          Orioptel ERP · Document confidentiel de travail
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="subscriptions-container">

      {/* ── Page Header ── */}
      <div className="page-header-bar">
        <div>
          <div className="breadcrumb">Oriotel ERP &rsaquo; <span>Abonnements</span></div>
          <h1 className="page-title">Gestion des Abonnements</h1>
          <p className="page-subtitle">{filteredData.length} dossier{filteredData.length !== 1 ? 's' : ''} · Mis à jour maintenant</p>
        </div>
        {!isAssistant && (
          <button className="btn-new-dossier" onClick={handleAddClick}>
            <Plus size={15} />
            Nouveau Dossier
          </button>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid">
        {[
          { color:'blue',  label:'Total',     value: stats.total,     desc:'Dossiers enregistrés',   icon:<Send size={15}/> },
          { color:'amber', label:'En attente',value: stats.pending,   desc:'En cours de traitement', icon:<Clock size={15}/> },
          { color:'green', label:'Validés',   value: stats.validated, desc:'Contrats confirmés',     icon:<CheckCircle size={15}/> },
          { color:'red',   label:'Refusés',   value: stats.refused,   desc:'Dossiers déclinés',      icon:<XCircle size={15}/> },
        ].map((k,i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className="kpi-header">
              <span className="kpi-label">{k.label}</span>
              <div className={`kpi-icon ${k.color}`}>{k.icon}</div>
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-desc">{k.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="content-card">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            {['Tous','En attente','Validé','Refusé','Brouillon'].map(tab => {
              const count = tab === 'Tous' ? data.length : data.filter(d => d.status === tab || (tab==='En attente' && d.status==='PENDING') || (tab==='Validé' && d.status==='VALIDATED') || (tab==='Refusé' && d.status==='REFUSED') || (tab==='Brouillon' && d.status==='Brouillon')).length;
              const isActive = selectedTab === tab;
              return (
                <button
                  key={tab}
                  className={`filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab} <span className="pill-count">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="toolbar-right">
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="search-input" placeholder="Rechercher ID, nom, CIN…" onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button 
              className={`btn-icon-tool ${isFilterOpen || Object.values(advFilters).some(v => v !== 'All' && v !== '') ? 'active-filter' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={13}/> Filtres
            </button>
            <div className="relative" ref={exportDropdownRef}>
              <button className="btn-icon-tool" onClick={() => setIsExportOpen(!isExportOpen)}>
                <Download size={13}/> Export
              </button>
              {isExportOpen && (
                /* Dropdown Menu */
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Exporter le rapport</span>
                  </div>
                  <button
                    onClick={() => { exportToCSV(); setIsExportOpen(false); }}
                    className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-[10px]">CSV</span>
                    Format CSV (.csv)
                  </button>
                  <button
                    onClick={() => { exportToExcel(); setIsExportOpen(false); }}
                    className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px]">XLS</span>
                    Format Excel (.xls)
                  </button>
                  <button
                    onClick={() => { exportToPDF(); setIsExportOpen(false); }}
                    className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-[10px]">PDF</span>
                    Format PDF (.pdf)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        {isFilterOpen && (
          <div className="advanced-filter-panel">
            <div className="filter-grid">
              
              <div className="filter-field">
                <span className="filter-label-text">Opérateur</span>
                <select 
                  className="filter-select-input" 
                  value={advFilters.operator} 
                  onChange={e => setAdvFilters(f => ({...f, operator: e.target.value}))}
                >
                  <option value="All">Tous les opérateurs</option>
                  <option value="IAM">IAM</option>
                  <option value="Orange">Orange</option>
                  <option value="Inwi">Inwi</option>
                </select>
              </div>

              <div className="filter-field">
                <span className="filter-label-text">Offre</span>
                <select 
                  className="filter-select-input" 
                  value={advFilters.offre} 
                  onChange={e => setAdvFilters(f => ({...f, offre: e.target.value}))}
                >
                  <option value="All">Toutes les offres</option>
                  <option value="ADSL">ADSL</option>
                  <option value="FTTH">FTTH</option>
                  <option value="Forfait">Forfait</option>
                </select>
              </div>

              <div className="filter-field">
                <span className="filter-label-text">Segment</span>
                <select 
                  className="filter-select-input" 
                  value={advFilters.segment} 
                  onChange={e => setAdvFilters(f => ({...f, segment: e.target.value}))}
                >
                  <option value="All">Tous les segments</option>
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>

              <div className="filter-field">
                <span className="filter-label-text">Date du</span>
                <input 
                  type="date" 
                  className="filter-date-input" 
                  value={advFilters.startDate} 
                  onChange={e => setAdvFilters(f => ({...f, startDate: e.target.value}))} 
                />
              </div>

              <div className="filter-field">
                <span className="filter-label-text">Date au</span>
                <input 
                  type="date" 
                  className="filter-date-input" 
                  value={advFilters.endDate} 
                  onChange={e => setAdvFilters(f => ({...f, endDate: e.target.value}))} 
                />
              </div>

              <div className="filter-actions">
                <button 
                  className="btn-reset-adv"
                  onClick={() => {
                    setAdvFilters({ operator: 'All', offre: 'All', segment: 'All', startDate: '', endDate: '' });
                  }}
                >
                  <RotateCcw size={12} /> Réinitialiser
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Table */}
        <div style={{overflowX:'auto'}}>
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <h3>Chargement des dossiers…</h3>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <h3>Aucun dossier trouvé</h3>
              <p>Modifiez votre recherche ou ajoutez un nouveau dossier.</p>
            </div>
          ) : (
            <table className="sub-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>CIN</th>
                  <th>Adresse</th>
                  <th>Opérateur</th>
                  <th>Offre</th>
                  <th>Segment</th>
                  <th>Statut</th>
                  <th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(row => {
                  const { cls, label } = getStatusPill(row.status);
                  const opColor = OPERATOR_COLORS[row.operator?.name] || 'blue';
                  return (
                    <tr key={row.id}>
                      <td style={{color:'#94a3b8',fontWeight:700,fontSize:'.72rem'}}>{row.id}</td>
                      <td>
                        <div className="client-cell">
                          <div className="client-avatar">{row.client.avatar}</div>
                          <div>
                            <div className="client-name">{row.client.name}</div>
                            <div className="client-sub">{row.date}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{fontWeight:700,fontFamily:'monospace',fontSize:'.78rem'}}>{row.contact.cin}</td>
                      <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:'.76rem',color:'#64748b'}}>{row.address}</td>
                      <td>
                        <span className={`op-chip ${opColor}`}>
                          <span style={{width:6,height:6,borderRadius:'50%',background:'currentColor',display:'inline-block'}}/>
                          {row.operator?.name}
                        </span>
                      </td>
                      <td><span className="plan-badge">{row.operator?.type}</span></td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          (row.segment || '').includes('B2B') 
                            ? 'bg-blue-50 text-blue-600 border border-blue-150' 
                            : 'bg-teal-50 text-teal-600 border border-teal-150'
                        }`}>
                          {row.segment}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${cls}`}>
                          <span className="dot"/>
                          {label}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button className="act-btn view" title="Voir le dossier" onClick={() => openDetails(row)}><Eye size={15}/></button>
                          {isAssistant && isPending(row.status) && (<>
                            <button className="act-btn ok" title="Valider" onClick={() => { setSelectedItem(row); setTimeout(() => setIsValidationOpen(true), 50); }}><CheckCircle size={15}/></button>
                            <button className="act-btn refuse" title="Refuser" onClick={() => { setSelectedItem(row); setTimeout(() => setIsRefusalOpen(true), 50); }}><XCircle size={15}/></button>
                          </>)}
                          {!isAssistant && (<>
                            <button className="act-btn edit" title="Modifier" onClick={() => handleEditClick(row)}><Edit2 size={15}/></button>
                            <button className="act-btn del" title="Supprimer" onClick={() => handleDeleteClick(row.id, row.realId)}><Trash2 size={15}/></button>
                          </>)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="table-footer">
          <span className="table-footer-info">{filteredData.length} résultat{filteredData.length!==1?'s':''} affichés</span>
        </div>
      </div>

      {/* ── Drawers ── */}
      <SubscriptionDetailsDrawer isOpen={isDetailsOpen} onClose={() => { setIsDetailsOpen(false); setSelectedItem(null); }} data={selectedItem}
        showActions={isAssistant && (selectedItem?.status === 'En attente' || selectedItem?.status === 'PENDING')}
        onValidate={handleValidateClick} onRefuse={handleRefuseClick} />

      <SubscriptionDrawer isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelectedItem(null); }} onSubmit={handleFormSubmit} initialData={selectedItem} />

      <ValidationDrawer isOpen={isValidationOpen} onClose={() => setIsValidationOpen(false)} data={selectedItem} onConfirm={handleConfirmValidation} />

      <RefusalDrawer isOpen={isRefusalOpen} onClose={() => setIsRefusalOpen(false)} data={selectedItem} onConfirm={handleConfirmRefusal} />
    </div>
  );
};

export default SubscriptionsPage;
