import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ChevronDown,
  User as UserIcon,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { stockService } from '@/services/stockService';
import { useUsers } from '@/hooks/useUsers';
import useAuth from '@/hooks/useAuth';
import useKanbanWebsocket from '@/hooks/useKanbanWebsocket';
import useTaskOptimization from '@/hooks/useTaskOptimization';
import TaskDrawer from './TaskDrawer';
import TaskDetailDrawer from './TaskDetailDrawer';
import OptimizationPanel from './OptimizationPanel';
import Alert from '@/components/common/Alert';
import ConfirmationModal from '@/components/users/ConfirmationModal';
import { cn } from '@/utils/cn';
import { Sparkles } from 'lucide-react';

const COLUMNS = [
  { id: 'TO_DO', title: 'A FAIRE', color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  { id: 'IN_PROGRESS', title: 'EN COURS', color: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-200' },
  { id: 'BLOCKED', title: 'BLOQUÉE', color: 'bg-red-100 text-red-600', border: 'border-red-200' },
  { id: 'COMPLETED', title: 'TERMINÉE', color: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
  { id: 'CANCELLED', title: 'ANNULÉE', color: 'bg-gray-100 text-gray-600', border: 'border-gray-200' },
];

const PRIORITY_STYLES = {
  LOW: { label: 'Faible', color: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Moyenne', color: 'bg-blue-100 text-blue-600' },
  HIGH: { label: 'Haute', color: 'bg-orange-100 text-orange-600' },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-600' },
};

const TaskManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { users } = useUsers();
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' | 'LIST'
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);
  
  const { reassignmentSuggestions, deadlineSuggestions, optimizeWorkload } = useTaskOptimization(tasks, users);
  
  const [filters, setFilters] = useState({
    priority: '',
    assigned_to: '',
    due_date: ''
  });

  // Websocket listener pour l'escalade en temps réel
  useKanbanWebsocket((updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
    
    // Afficher une notification visuelle
    setNotification({
      type: 'warning',
      title: 'Alerte Escalade',
      message: `La tâche "${updatedTask.title}" a été escaladée automatiquement après 15min.`
    });
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await stockService.getTasks();
      // Filtrer pour ne pas afficher les incidents ici
      setTasks(data.filter(t => !t.is_incident));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      const response = await stockService.createTask(taskData);
      const newTask = response.data || response;
      setTasks(prev => [newTask, ...prev]);
      
      setNotification({
        type: 'success',
        title: 'Succès',
        message: 'La tâche a été créée avec succès.'
      });
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMsg = error.message || (typeof error === 'string' ? error : 'Erreur de communication avec le serveur');
      
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: `Impossible de créer la tâche : ${errorMsg}`
      });
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await stockService.updateTask(taskId, taskData);
      const updatedTask = response.data || response;
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      if (selectedTask?.id === taskId) setSelectedTask(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await stockService.updateTask(taskId, { status: newStatus });
      const updatedTask = response.data || response;
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      if (selectedTask?.id === taskId) setSelectedTask(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const expiringTasksCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.due_date === today && t.status !== 'COMPLETED').length;
  }, [tasks]);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = !filters.priority || t.priority === filters.priority;
    const matchesAssigned = !filters.assigned_to || t.users?.some(u => u.id === parseInt(filters.assigned_to));
    const matchesDueDate = !filters.due_date || t.due_date === filters.due_date;

    return matchesSearch && matchesPriority && matchesAssigned && matchesDueDate;
  });

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleApplyOptimizations = async (suggestions) => {
    try {
      setIsLoading(true);
      // Appliquer les optimisations en batch via le backend (deadlines + réaffectations)
      await stockService.applyOptimizations(suggestions);
      
      await fetchTasks();
      setIsOptimizationOpen(false);
      setNotification({
        type: 'success',
        title: 'Optimisation réussie',
        message: 'Le planning a été réajusté pour maximiser la productivité.'
      });
    } catch (error) {
      console.error('Error applying optimizations:', error);
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue lors de l\'application des optimisations.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (e, taskId) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, taskId });
  };

  const confirmDeleteTask = async () => {
    const taskId = deleteModal.taskId;
    try {
      await stockService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setNotification({
        type: 'success',
        title: 'Supprimé',
        message: 'La tâche a été supprimée avec succès.'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      setNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer la tâche.'
      });
    } finally {
      setDeleteModal({ isOpen: false, taskId: null });
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
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
              <div className="relative">
                <Alert
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  autoClose={30000}
                  onClose={() => setNotification(null)}
                  className="!border-0 !shadow-none !m-0 !rounded-none py-6 px-8 bg-transparent"
                />
                
                {/* Barre de progression stylisée */}
                <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gray-100/50">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className={cn(
                      "h-full transition-colors duration-500",
                      notification.type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 
                      notification.type === 'error' ? 'bg-gradient-to-r from-red-400 to-rose-600' : 
                      'bg-gradient-to-r from-amber-400 to-orange-500'
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight">Gestion des tâches</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Supervisez l'avancement opérationnel de l'établissement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'KANBAN' ? 'bg-white text-[#1428C9] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={14} />
              KANBAN
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'LIST' ? 'bg-white text-[#1428C9] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={14} />
              LISTE
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-[#1428C9] text-white text-xs font-black rounded-xl shadow-lg shadow-[#1428C9]/20 hover:bg-[#1428C9]/90 transition-all flex items-center gap-2"
          >
            <Plus size={14} />
             Nouvelle tâche
          </button>
          
          <button 
            onClick={() => setIsOptimizationOpen(true)}
            className="px-6 py-2.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={14} />
            Assistant IA
            {reassignmentSuggestions?.length > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* ── Alert Banner ──────────────────────────────────────── */}
      {expiringTasksCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Clock size={20} />
            </div>
            <span className="text-sm font-bold text-orange-800">
              {expiringTasksCount} tâche{expiringTasksCount > 1 ? 's' : ''} arrive{expiringTasksCount > 1 ? 'nt' : ''} à échéance aujourd'hui
            </span>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors">
            VOIR LES DÉTAILS
          </button>
        </motion.div>
      )}

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm outline-none"
            value={filters.priority}
            onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
          >
            <option value="">Priorité</option>
            <option value="LOW">Faible</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HIGH">Haute</option>
            <option value="URGENT">Urgente</option>
          </select>

          {isAdmin && (
            <select 
              className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm outline-none"
              value={filters.assigned_to}
              onChange={(e) => setFilters(f => ({ ...f, assigned_to: e.target.value }))}
            >
              <option value="">Assigné à</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
              ))}
            </select>
          )}

          <input 
            type="date"
            className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm outline-none"
            value={filters.due_date}
            onChange={(e) => setFilters(f => ({ ...f, due_date: e.target.value }))}
          />

          {filters.priority || filters.due_date ? (
            <button 
              onClick={() => setFilters({ priority: '', assigned_to: '', due_date: '' })}
              className="text-[10px] font-black text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X size={12} />
              EFFACER
            </button>
          ) : null}
        </div>
        
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une tâche..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:bg-white focus:border-[#1428C9] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Kanban Board ──────────────────────────────────────── */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {COLUMNS.map(column => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${column.color} border ${column.border}`}>
                  <span className="text-[10px] font-black tracking-wider uppercase">{column.title}</span>
                  <span className="text-[10px] font-black opacity-60">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
              </div>

              <div className="space-y-4 min-h-[500px]">
                {filteredTasks.filter(t => t.status === column.id).map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => handleTaskClick(task)} 
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
                {filteredTasks.filter(t => t.status === column.id).length === 0 && (
                  <div className="h-24 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300">
                    <Plus size={20} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 text-center text-gray-400">
          Vue Liste en cours de développement...
        </div>
      )}

      {/* ── Modals/Drawers ────────────────────────────────────── */}
      <TaskDrawer
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={selectedTask ? (data) => handleUpdateTask(selectedTask.id, data) : handleSaveTask}
        initialData={selectedTask}
        hideToggle={true}
      />

      {selectedTask && (
        <TaskDetailDrawer
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          task={selectedTask}
          onEdit={(task) => {
            setIsDetailOpen(false);
            setSelectedTask(task);
            setIsModalOpen(true);
          }}
          onDelete={(taskId) => {
            setIsDetailOpen(false);
            setDeleteModal({ isOpen: true, taskId });
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      <OptimizationPanel
        isOpen={isOptimizationOpen}
        onClose={() => setIsOptimizationOpen(false)}
        suggestions={optimizeWorkload}
        onApply={handleApplyOptimizations}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, taskId: null })}
        onConfirm={confirmDeleteTask}
        title="Supprimer la tâche"
        message="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible."
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

const TaskCard = ({ task, onClick, onEdit, onDelete }) => {
  const isCompleted = task.status === 'COMPLETED';
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

  return (
    <motion.div 
      layoutId={task.id}
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1428C9]/20 transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Actions au survol */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
        <button 
          onClick={(e) => onEdit(e, task)}
          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          title="Modifier"
        >
          <Edit size={14} />
        </button>
        <button 
          onClick={(e) => onDelete(e, task.id)}
          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${priority.color}`}>
            {priority.label}
          </span>
          {isCompleted && (
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={12} />
            </div>
          )}
        </div>

        <h4 className={`text-sm font-bold text-[#111827] leading-snug group-hover:text-[#1428C9] transition-colors ${isCompleted ? 'line-through opacity-50' : ''}`}>
          {task.title}
        </h4>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex -space-x-2">
            {task.users?.map((user) => (
              <div key={user.id} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden" title={user.name}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-500">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            {task.comments_count > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={12} />
                <span className="text-[10px] font-bold">{task.comments_count}</span>
              </div>
            )}
            {task.due_date && (
              <div className={`flex items-center gap-1 ${task.due_date < new Date().toISOString().split('T')[0] ? 'text-red-500' : ''}`}>
                <Calendar size={12} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {task.due_date === new Date().toISOString().split('T')[0] ? 'Aujourd\'hui' : task.due_date}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DropdownFilter = ({ icon: Icon, label }) => (
  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
    <Icon size={14} className="text-gray-400" />
    {label}
    <ChevronDown size={14} className="text-gray-300 ml-1" />
  </button>
);

export default TaskManagement;
