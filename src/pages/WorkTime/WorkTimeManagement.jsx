import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Users, 
  UserMinus, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Pencil, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Calendar,
  X,
  FileText,
  FileSpreadsheet,
  FileCode,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';


// --- Sub-components ---

const StatsCard = ({ icon: Icon, title, value, badge, badgeColor, borderColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
    className={`bg-white p-6 rounded-2xl shadow-sm border-b-4 ${borderColor} flex flex-col justify-between h-full transition-shadow hover:shadow-md`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${borderColor.replace('border-', 'bg-').replace('-500', '-50')}`}>
        <Icon size={24} className={borderColor.replace('border-', 'text-')} />
      </div>
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
        {badge}
      </span>
    </div>
    <div>
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-2xl font-extrabold text-[#111827]">{value}</p>
    </div>
  </motion.div>
);

// Removed old FilterBar component as it's now integrated into the main page flow

const AttendanceRow = ({ data, index, onEdit }) => {
  const isLate = data.status === 'Retard';
  const isAbsent = data.status === 'Absent';
  
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Présent': return 'bg-green-100 text-green-700';
      case 'Retard': return 'bg-orange-100 text-orange-700';
      case 'Incomplet': return 'bg-gray-100 text-gray-700';
      case 'Absent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.tr 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isLate ? 'bg-orange-50/30' : ''} ${isAbsent ? 'bg-red-50/30' : ''}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1428C9]/10 flex items-center justify-center text-[#1428C9] font-bold text-xs">
            {data.name.charAt(0)}
          </div>
          <span className="font-semibold text-[#111827]">{data.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{data.role}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{data.date}</td>
      <td className="px-6 py-4 text-sm font-medium text-gray-700">{data.arrival}</td>
      <td className="px-6 py-4 text-sm font-medium text-gray-700">{data.departure}</td>
      <td className="px-6 py-4 text-sm font-bold text-[#111827]">{data.total}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyles(data.status)}`}>
          {data.status}
        </span>
      </td>
      <td className="px-6 py-4">
        {data.anomaly && (
          <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase bg-red-100 text-red-600 border border-red-200">
            {data.anomaly}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-[#1428C9] transition-all">
            <Eye size={18} />
          </button>
          <button 
            onClick={() => onEdit(data)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-[#1428C9] transition-all"
          >
            <Pencil size={18} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

const EditModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[400px] bg-white rounded-[24px] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-[#1428C9] p-6 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4">Correction manuelle</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg">
                  {data.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{data.name}</h3>
                  <p className="text-white/70 text-sm">{data.role}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Date concernée</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    defaultValue={data.date}
                    className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border-none rounded-xl text-[#111827] font-semibold focus:ring-2 focus:ring-[#1428C9]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Heure arrivée</label>
                  <input 
                    type="text" 
                    defaultValue={data.arrival !== '--:--' ? data.arrival : '09:00 AM'}
                    className="w-full px-4 py-3 bg-blue-50/50 border-none rounded-xl text-[#111827] font-semibold focus:ring-2 focus:ring-[#1428C9]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Heure départ</label>
                  <input 
                    type="text" 
                    defaultValue={data.departure !== '--:--' ? data.departure : '06:00 PM'}
                    className="w-full px-4 py-3 bg-blue-50/50 border-none rounded-xl text-[#111827] font-semibold focus:ring-2 focus:ring-[#1428C9]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Raison de la correction</label>
                <textarea 
                  placeholder="Ex: Oubli de badgeage, Problème technique borne..."
                  className="w-full px-4 py-3 bg-blue-50/50 border-none rounded-xl text-[#111827] font-semibold focus:ring-2 focus:ring-[#1428C9]/20 transition-all min-h-[100px] resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-blue-50 text-[#1428C9] font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95"
                >
                  Annuler
                </button>
                <button 
                  className="flex-1 py-4 bg-[#1428C9] text-white font-bold rounded-xl hover:bg-[#0f1f9c] shadow-lg shadow-[#1428C9]/20 transition-all active:scale-95"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main Page Component ---

const WorkTimeManagement = () => {
  const [activePeriod, setActivePeriod] = useState('Aujourd’hui');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const periods = ['Aujourd’hui', 'Cette semaine', 'Ce mois', 'Personnalisé'];

  const handleEdit = (data) => {
    setSelectedAttendance(data);
    setIsEditModalOpen(true);
  };

  const mockData = [
    {
      name: "Amélie Martin",
      role: "Réception",
      date: "24/05/2024",
      arrival: "08:02",
      departure: "17:15",
      total: "8h 13m",
      status: "Présent",
      anomaly: null
    },
    {
      name: "Jean Dupont",
      role: "Maintenance",
      date: "24/05/2024",
      arrival: "09:45",
      departure: "18:00",
      total: "7h 15m",
      status: "Retard",
      anomaly: "RETARD +45M"
    },
    {
      name: "Marc Lemoine",
      role: "Cuisine",
      date: "24/05/2024",
      arrival: "08:00",
      departure: "--:--",
      total: "--",
      status: "Incomplet",
      anomaly: null
    },
    {
      name: "Sophie Bernard",
      role: "Réception",
      date: "24/05/2024",
      arrival: "--:--",
      departure: "--:--",
      total: "0h",
      status: "Absent",
      anomaly: "NON JUSTIFIÉ"
    },
    {
      name: "Thomas Dubois",
      role: "Maintenance",
      date: "23/05/2024",
      arrival: "08:30",
      departure: "17:30",
      total: "9h",
      status: "Présent",
      anomaly: null
    },
    {
      name: "Julie Lefebvre",
      role: "Cuisine",
      date: "23/05/2024",
      arrival: "07:55",
      departure: "16:00",
      total: "8h 05m",
      status: "Présent",
      anomaly: null
    }
  ];

  // --- Export Logic ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Rapport de Temps de Travail - ORIOTEL', 14, 20);
    doc.setFontSize(10);
    doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Employé', 'Rôle', 'Date', 'Arrivée', 'Départ', 'Total', 'Statut']],
      body: mockData.map(row => [
        row.name, row.role, row.date, row.arrival, row.departure, row.total, row.status
      ]),
      headStyles: { fillColor: [20, 40, 201] },
    });

    doc.save(`temps_travail_${activePeriod.toLowerCase().replace(' ', '_')}.pdf`);
  };

  const exportCSV = (format = 'csv') => {
    const headers = ['Employé', 'Rôle', 'Date', 'Arrivée', 'Départ', 'Total', 'Statut', 'Anomalie'];
    const rows = mockData.map(r => [
      r.name, r.role, r.date, r.arrival, r.departure, r.total, r.status, r.anomaly || ''
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `temps_travail_${new Date().getTime()}.${format === 'excel' ? 'csv' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCardex = () => {
    const doc = new jsPDF();
    
    mockData.forEach((emp, index) => {
      if (index > 0) doc.addPage();
      
      doc.setFillColor(20, 40, 201);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('CARDEX EMPLOYÉ', 14, 25);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text(emp.name, 14, 55);
      doc.setFontSize(12);
      doc.text(`Rôle: ${emp.role}`, 14, 65);
      
      autoTable(doc, {
        startY: 75,
        head: [['Champ', 'Valeur']],
        body: [
          ['Date', emp.date],
          ['Heure Arrivée', emp.arrival],
          ['Heure Départ', emp.departure],
          ['Total Heures', emp.total],
          ['Statut', emp.status],
          ['Anomalies', emp.anomaly || 'Aucune']
        ],
        theme: 'striped',
        headStyles: { fillColor: [20, 40, 201] },
      });
    });

    doc.save(`cardex_complet_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-12">
      <EditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        data={selectedAttendance} 
      />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight mb-1">Temps de travail</h1>
          <p className="text-gray-500 font-medium">Suivi et gestion des pointages du personnel ORIOTEL.</p>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 bg-[#1428C9] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0f1f9c] transition-all shadow-lg shadow-[#1428C9]/20 active:scale-95 group">
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                Exporter
                <ChevronDown size={14} className="opacity-60" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[200px] bg-white rounded-xl p-1.5 shadow-2xl border border-gray-100 z-[101] animate-in fade-in zoom-in duration-200" 
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item onClick={exportCardex} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none hover:bg-blue-50 hover:text-blue-700 rounded-lg cursor-pointer transition-colors">
                  <CreditCard size={16} className="text-blue-500" />
                  Exporter en Cardex
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={exportPDF} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors">
                  <FileText size={16} className="text-red-500" />
                  Exporter en PDF
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => exportCSV('csv')} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none hover:bg-green-50 hover:text-green-700 rounded-lg cursor-pointer transition-colors">
                  <FileCode size={16} className="text-green-500" />
                  Exporter en CSV
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => exportCSV('excel')} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none hover:bg-emerald-50 hover:text-emerald-700 rounded-lg cursor-pointer transition-colors">
                  <FileSpreadsheet size={16} className="text-emerald-500" />
                  Exporter pour Excel
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={Users}
          title="PRÉSENTS AUJOURD'HUI"
          value="42 / 45"
          badge="STABLE"
          badgeColor="bg-green-100 text-green-600"
          borderColor="border-green-500"
          delay={0.1}
        />
        <StatsCard 
          icon={UserMinus}
          title="ABSENTS"
          value="3"
          badge="+2 VS HIER"
          badgeColor="bg-red-100 text-red-600"
          borderColor="border-red-500"
          delay={0.2}
        />
        <StatsCard 
          icon={AlertTriangle}
          title="RETARDS DÉTECTÉS"
          value="12"
          badge="ALERTE"
          badgeColor="bg-orange-100 text-orange-600"
          borderColor="border-orange-500"
          delay={0.3}
        />
        <StatsCard 
          icon={Clock}
          title="HEURES SUPPLÉMENTAIRES"
          value="84h estim."
          badge="PÉRIODE"
          badgeColor="bg-blue-100 text-blue-600"
          borderColor="border-blue-500"
          delay={0.4}
        />
      </div>

      {/* Search & Period Filter Area */}
      <div className="mt-8 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text" 
              placeholder="Rechercher par employé..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all shadow-sm"
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Period Toggles */}
            <div className="flex p-1.5 bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto scrollbar-hide">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activePeriod === period 
                      ? 'bg-blue-50 text-[#1428C9] shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 shadow-sm'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Statut</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>Tous les statuts</option>
                    <option>Présent</option>
                    <option>Retard</option>
                    <option>Absent</option>
                    <option>Incomplet</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Rôle</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>Tous les rôles</option>
                    <option>Réception</option>
                    <option>Maintenance</option>
                    <option>Cuisine</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Date spécifique</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input 
                      type="date" 
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rôle</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrivée</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Départ</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Anomalie</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockData.map((row, idx) => (
                <AttendanceRow key={idx} data={row} index={idx} onEdit={handleEdit} />
              ))}
            </tbody>
          </table>
        </div>

        {/* List Info Summary (Replaces Pagination) */}
        <div className="px-6 py-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
          <p className="text-sm text-gray-500 font-medium">
            Affichage de <span className="text-[#111827] font-black">{mockData.length}</span> résultats au total
          </p>
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Liste complète
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkTimeManagement;
