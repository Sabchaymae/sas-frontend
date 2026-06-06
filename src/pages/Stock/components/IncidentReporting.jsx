import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Eye,
  FileText,
  Activity,
  X,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { stockService } from '@/services/stockService';
import useAuth from '@/hooks/useAuth';
import Alert from '@/components/common/Alert';
import ConfirmationModal from '@/components/users/ConfirmationModal';
import { cn } from '@/utils/cn';
import TaskDrawer from './TaskDrawer';

const IncidentReporting = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAssistant = user?.role?.toLowerCase() === 'assistant' || user?.email === 'assistante@oriotel.com';
  
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, incidentId: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, incident: null, similar: [] });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleViewIncident = async (incident) => {
    try {
      const details = await stockService.getIncidentDetails(incident.id);
      setViewModal({ 
        isOpen: true, 
        incident: details.data, 
        similar: details.similar_incidents 
      });
    } catch (error) {
      console.error('Error fetching incident details:', error);
      setViewModal({ isOpen: true, incident, similar: [] });
    }
  };

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const data = await stockService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIncident = async (incidentData) => {
    try {
      console.log('Incident data to send:', incidentData);
      const response = await stockService.createIncident(incidentData);
      console.log('Server response:', response);
      setIncidents(prev => [response.data || response, ...prev]);
      setNotification({
        type: 'success',
        title: 'Succès',
        message: 'L\'incident a été déclaré avec succès.'
      });
    } catch (error) {
      console.error('Full error object:', error);
      const serverError = error.response?.data?.error || error.message || 'Erreur inconnue';
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: `Impossible de déclarer l'incident : ${serverError}`
      });
    }
  };

  const handleUpdateIncident = async (id, incidentData) => {
    try {
      const response = await stockService.updateIncident(id, incidentData);
      setIncidents(prev => prev.map(inc => inc.id === id ? response : inc));
      setNotification({
        type: 'success',
        title: 'Mis à jour',
        message: 'L\'incident a été mis à jour.'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la mise à jour.'
      });
    }
  };

  const handleDeleteIncident = (id) => {
    setDeleteModal({ isOpen: true, incidentId: id });
  };

  const confirmDelete = async () => {
    const taskId = deleteModal.incidentId;
    try {
      await stockService.deleteIncident(taskId);
      setIncidents(prev => prev.filter(inc => inc.id !== taskId));
      setNotification({
        type: 'success',
        title: 'Supprimé',
        message: 'L\'incident a été supprimé.'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la suppression.'
      });
    } finally {
      setDeleteModal({ isOpen: false, incidentId: null });
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    (inc.client_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inc.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50/50">
      {/* Notifications Flottantes (Style Popup Moderne) */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -150, x: '-50%', scale: 0.8 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -150, x: '-50%', scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-24 left-1/2 z-[500] w-[90%] max-w-[450px]"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.2)] border border-white/20 overflow-hidden ring-1 ring-black/5">
              <Alert
                type={notification.type}
                title={notification.title}
                message={notification.message}
                autoClose={30000}
                onClose={() => setNotification(null)}
                className="!border-0 !shadow-none !m-0 !rounded-none py-6 px-8 bg-transparent"
              />
              <div className="h-[3px] w-full bg-gray-100/50">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 30, ease: "linear" }}
                  className={cn(
                    "h-full",
                    notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">Déclaration d'Incidents</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Gérez et suivez les incidents signalés par les clients</p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => { setSelectedIncident(null); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            Déclarer un Incident
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher par client ou titre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-red-500/20 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      ) : isAdmin ? (
        /* Vue Administrateur : Tableau détaillé */
        <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Déclaré par</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Heure</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ville</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredIncidents.map(incident => (
                  <tr key={incident.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#111827] text-sm">{incident.title}</div>
                      <div className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{incident.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-700">{incident.client_name}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{incident.client_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          {incident.creator?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-xs font-bold text-gray-600">{incident.creator?.name || 'Assistant'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-600">
                        {new Date(incident.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        à {new Date(incident.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {incident.city || 'Oujda'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        incident.status === 'OPEN' ? "bg-red-100 text-red-600" :
                        incident.status === 'IN_PROGRESS' ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600"
                      )}>
                        {incident.status === 'OPEN' ? 'Ouvert' : 
                         incident.status === 'IN_PROGRESS' ? 'En cours' : 'Résolu'}
                      </div>
                      {incident.similar_incidents_count > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-red-500 animate-pulse">
                          <AlertCircle size={10} />
                          {incident.similar_incidents_count} SIMILAIRE(S)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewIncident(incident)}
                        className="p-2 hover:bg-indigo-50 rounded-xl text-indigo-600 transition-all"
                        title="Visualiser les détails"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vue Assistant : Cartes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {filteredIncidents.map(incident => (
            <motion.div 
              key={incident.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit",
                    incident.is_recurring ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {incident.is_recurring ? 'Récurrent' : 'Nouveau'}
                  </div>
                  {incident.similar_incidents_count > 0 && (
                    <div className="px-2 py-0.5 bg-red-500 text-white rounded-md text-[8px] font-black uppercase tracking-tighter animate-pulse flex items-center gap-1 w-fit">
                      <AlertCircle size={8} />
                      {incident.similar_incidents_count} Similaire(s)
                    </div>
                  )}
                </div>
                {!isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleViewIncident(incident); }}
                      className="p-2 hover:bg-indigo-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all"
                      title="Visualiser"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedIncident(incident); setIsModalOpen(true); }}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteIncident(incident.id); }}
                      className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-[#111827] mb-2">{incident.title}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Users size={16} />
                  </div>
                  <span className="font-bold">{incident.client_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Phone size={16} />
                  </div>
                  <span className="font-medium">{incident.client_phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <MapPin size={16} />
                  </div>
                  <span className="font-medium truncate">{incident.client_address}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Clock size={12} />
                  {new Date(incident.incident_date).toLocaleDateString()}
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  incident.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                )}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <TaskDrawer 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedIncident(null); }}
        onSave={selectedIncident ? (data) => handleUpdateIncident(selectedIncident.id, data) : handleSaveIncident}
        initialData={selectedIncident}
        defaultIncident={true}
      />

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, incidentId: null })}
        onConfirm={confirmDelete}
        title="Supprimer l'incident"
        message="Voulez-vous vraiment supprimer cet incident ? Cette action est irréversible."
        confirmText="Supprimer"
        type="danger"
      />

      {/* Modal de Visualisation Admin */}
      <AnimatePresence>
        {viewModal.isOpen && viewModal.incident && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewModal({ isOpen: false, incident: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative">
                <button 
                  onClick={() => setViewModal({ isOpen: false, incident: null })}
                  className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{viewModal.incident.title}</h2>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Détails de l'incident</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Informations Client</h3>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-indigo-500" />
                        <span className="text-sm font-bold text-gray-700">{viewModal.incident.client_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium text-gray-600">{viewModal.incident.client_phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium text-gray-600">{viewModal.incident.client_address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Activity size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium text-gray-600">{viewModal.incident.city}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {viewModal.incident.description || 'Aucune description fournie.'}
                      </p>
                    </div>
                  </div>

                  {/* Analyse IA */}
                  {viewModal.incident.ai_analysis && viewModal.incident.ai_analysis.priority && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-white/10 shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap size={80} />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Zap size={14} className="text-amber-400 fill-amber-400" />
                        <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Analyse Intelligente (Ollama)</h3>
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Priorité Estimée</span>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            viewModal.incident.ai_analysis.priority === 'Critique' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                            viewModal.incident.ai_analysis.priority === 'Important' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          )}>
                            {viewModal.incident.ai_analysis.priority}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Équipement</span>
                            <span className="text-xs font-bold">{viewModal.incident.ai_analysis.equipment || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Service</span>
                            <span className="text-xs font-bold">{viewModal.incident.ai_analysis.impacted_service || 'N/A'}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Résumé IA</span>
                          <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                            "{viewModal.incident.ai_analysis.summary}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Suivi Système</h3>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-blue-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-black uppercase">Déclaré le</span>
                          <span className="text-sm font-bold text-gray-700">
                            {new Date(viewModal.incident.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-blue-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-black uppercase">Par</span>
                          <span className="text-sm font-bold text-gray-700">{viewModal.incident.creator?.name || 'Assistant'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Liste des incidents similaires */}
                  {viewModal.similar && viewModal.similar.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Incidents Similaires Détectés par l'IA
                      </h3>
                      <div className="space-y-2">
                        {viewModal.similar.map(sim => (
                          <div key={sim.id} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-xs font-bold text-red-700 mb-1">{sim.title}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter">
                                {sim.city} • {new Date(sim.created_at).toLocaleDateString()}
                              </span>
                              <div className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-black">
                                Match IA
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button 
                      onClick={() => setViewModal({ isOpen: false, incident: null, similar: [] })}
                      className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all active:scale-95"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncidentReporting;
