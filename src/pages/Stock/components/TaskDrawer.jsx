import { X, Info, Save, AlignLeft, Flag, Calendar, Users, AlertCircle, Phone, MapPin, Mail, Clock, RefreshCw, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { useUsers } from '@/hooks/useUsers';

const TaskDrawer = ({ isOpen, onClose, onSave, initialData, defaultIncident = false, hideToggle = false }) => {
  const { users } = useUsers();
  
  const initialForm = {
    title: '',
    description: '',
    status: 'TO_DO',
    priority: 'MEDIUM',
    due_date: new Date().toISOString().split('T')[0],
    assigned_users: [],
    // Incident fields
    is_incident: defaultIncident,
    client_name: '',
    client_phone: '',
    client_address: '',
    city: 'Oujda',
    client_email: '',
    incident_date: new Date().toISOString().slice(0, 16),
    is_recurring: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title ?? '',
          description: initialData.description ?? '',
          status: initialData.status ?? 'TO_DO',
          priority: initialData.priority ?? 'MEDIUM',
          due_date: initialData.due_date ?? new Date().toISOString().split('T')[0],
          assigned_users: initialData.users?.map(u => u.id) ?? [],
          is_incident: initialData.is_incident ?? defaultIncident,
          client_name: initialData.client_name ?? '',
          client_phone: initialData.client_phone ?? '',
          client_address: initialData.client_address ?? '',
          city: initialData.city ?? 'Oujda',
          client_email: initialData.client_email ?? '',
          incident_date: initialData.incident_date ? initialData.incident_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
          is_recurring: initialData.is_recurring ?? false,
        });
      } else {
        setFormData(initialForm);
      }
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleUserToggle = (userId) => {
    setFormData(prev => {
      const isAssigned = prev.assigned_users.includes(userId);
      if (isAssigned) {
        return { ...prev, assigned_users: prev.assigned_users.filter(id => id !== userId) };
      } else {
        return { ...prev, assigned_users: [...prev.assigned_users, userId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date,
        assigned_users: formData.assigned_users,
        // Incident fields
        is_incident: formData.is_incident,
        client_name: formData.client_name,
        client_phone: formData.client_phone,
        client_address: formData.client_address,
        city: formData.city,
        client_email: formData.client_email,
        incident_date: formData.incident_date,
        is_recurring: formData.is_recurring,
      };

      console.log('Sending task payload:', payload);
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('[Error saving task]', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:max-w-[550px] bg-white z-[110] border-l border-gray-100 transition-transform duration-500 ease-in-out flex flex-col shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1428C9]/10 flex items-center justify-center">
              {formData.is_incident ? (
                <AlertCircle size={22} className="text-red-600" />
              ) : (
                <Save size={22} className="text-[#1428C9]" />
              )}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#111827]">
                {formData.is_incident ? (initialData ? 'Modifier l\'incident' : 'Déclarer un incident') : (initialData ? 'Modifier la tâche' : 'Nouvelle tâche')}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {formData.is_incident ? 'Signalement d\'anomalie client' : 'Planification opérationnelle'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={X} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 space-y-8 pt-6 custom-scrollbar">
          
          {/* Toggle Incident (Seulement si pas caché et nouvelle tâche) */}
          {!initialData && !hideToggle && !defaultIncident && (
            <div 
              onClick={() => setFormData(prev => ({ ...prev, is_incident: !prev.is_incident }))}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                formData.is_incident 
                  ? "border-red-100 bg-red-50/50" 
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  formData.is_incident ? "bg-red-100 text-red-600" : "bg-white text-gray-400 group-hover:text-gray-600"
                )}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">Déclarer comme incident ?</p>
                  <p className="text-[10px] text-gray-400 font-medium">Active les champs spécifiques au client</p>
                </div>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-300",
                formData.is_incident ? "bg-red-500" : "bg-gray-200"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                  formData.is_incident ? "translate-x-7" : "translate-x-1"
                )} />
              </div>
            </div>
          )}

          {/* Incident Fields */}
          {formData.is_incident && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 p-6 bg-red-50/30 rounded-3xl border border-red-100/50"
            >
              {initialData && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Statut</label>
                  <div className="relative">
                    <Flag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-red-50 rounded-xl text-sm font-medium focus:border-red-500 outline-none transition-all appearance-none"
                    >
                      <option value="OPEN">Ouvert</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="RESOLVED">Résolu</option>
                      <option value="CLOSED">Fermé</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-red-500" />
                <h3 className="text-xs font-black text-red-600 uppercase tracking-widest">Informations Client</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Nom & Prénom *</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      name="client_name"
                      required={formData.is_incident}
                      value={formData.client_name}
                      onChange={handleChange}
                      placeholder="Ex: Jean Dupont"
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-red-50 rounded-xl text-sm font-medium focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Téléphone *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="tel"
                      name="client_phone"
                      required={formData.is_incident}
                      value={formData.client_phone}
                      onChange={handleChange}
                      placeholder="Ex: 06 12 34 56 78"
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-red-50 rounded-xl text-sm font-medium focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Adresse Complète *</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-4 text-gray-300" />
                  <textarea
                    name="client_address"
                    required={formData.is_incident}
                    rows="2"
                    value={formData.client_address}
                    onChange={handleChange}
                    placeholder="Adresse complète du client..."
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-red-50 rounded-xl text-sm font-medium focus:border-red-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Ville *</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <select
                      name="city"
                      required={formData.is_incident}
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-red-50 rounded-xl text-sm font-medium focus:border-red-500 outline-none transition-all appearance-none"
                    >
                      <option value="Oujda">Oujda</option>
                      <option value="Berkane">Berkane</option>
                      <option value="Nador">Nador</option>
                      <option value="Driouch">Driouch</option>
                      <option value="Taourirt">Taourirt</option>
                      <option value="Guercif">Guercif</option>
                      <option value="Jerada">Jerada</option>
                      <option value="Figuig">Figuig</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Date & Heure Détection *</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="datetime-local"
                      name="incident_date"
                      required={formData.is_incident}
                      value={formData.incident_date}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-red-50 rounded-xl text-sm font-medium focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Email (Optionnel)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="email"
                    name="client_email"
                    value={formData.client_email}
                    onChange={handleChange}
                    placeholder="client@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-red-50 rounded-xl text-sm font-medium focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-red-50">
                <div className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_recurring"
                    checked={formData.is_recurring}
                    onChange={handleChange}
                    className="w-5 h-5 border-2 border-red-200 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111827]">Problème récurrent ?</p>
                  <p className="text-[10px] text-gray-400 font-medium italic">Cochez si ce problème s'est déjà répété pour ce client</p>
                </div>
                {formData.is_recurring && (
                  <RefreshCw size={14} className="text-red-500 animate-spin-slow ml-auto" />
                )}
              </div>
            </motion.div>
          )}

          {/* Main Info */}
          <div className="space-y-6">
            <Input 
              label={formData.is_incident ? "Titre de l'incident *" : "Titre de la tâche *"}
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder={formData.is_incident ? "Ex: Coupure de fibre optique" : "Ex: Maintenance Routeur Casablanca"} 
              required 
            />

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Description</label>
              <div className="relative">
                <AlignLeft size={16} className="absolute left-4 top-4 text-gray-300" />
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Détails de l'intervention..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-[#1428C9] outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Config - Caché pour les incidents */}
          {!formData.is_incident && (
            <div className="grid grid-cols-2 gap-6">
              <Select 
                label="Priorité"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={[
                  { value: 'LOW', label: 'Faible' },
                  { value: 'MEDIUM', label: 'Moyenne' },
                  { value: 'HIGH', label: 'Haute' },
                  { value: 'URGENT', label: 'Urgente' },
                ]}
              />
              <Input 
                label="Échéance" 
                type="date" 
                name="due_date" 
                value={formData.due_date} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          {/* User Assignment - Caché pour les incidents */}
          {!formData.is_incident && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#111827] uppercase tracking-widest ml-1">Assigner à des membres</label>
                <span className="text-[10px] font-bold text-[#1428C9] bg-[#1428C9]/5 px-2 py-1 rounded-lg">
                  {formData.assigned_users.length} sélectionnés
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {users.map(u => (
                  <div 
                    key={u.id}
                    onClick={() => handleUserToggle(u.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group",
                      formData.assigned_users.includes(u.id) 
                        ? "border-[#1428C9] bg-[#1428C9]/5" 
                        : "border-gray-50 bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 overflow-hidden">
                      {u.photo ? (
                        <img src={u.photo} alt={u.prenom} className="w-full h-full object-cover" />
                      ) : (
                        u.prenom.charAt(0) + u.nom.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#111827]">{u.prenom} {u.nom}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{u.role}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      formData.assigned_users.includes(u.id)
                        ? "bg-[#1428C9] border-[#1428C9]"
                        : "border-gray-200 group-hover:border-gray-300"
                    )}>
                      {formData.assigned_users.includes(u.id) && <Save size={10} className="text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!formData.is_incident && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
              <Info className="text-[#1428C9] shrink-0 mt-0.5" size={20} />
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                Les membres assignés recevront une notification dès la validation de cette tâche.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center gap-4">
            <Button variant="outline" className="flex-1 h-12" onClick={onClose} type="button">Annuler</Button>
            <Button variant="primary" 
              className={cn("flex-[2] h-12", formData.is_incident && "bg-red-600 hover:bg-red-700 shadow-red-200")} 
              type="submit" 
              loading={isSubmitting}
            >
              {formData.is_incident ? 'Déclarer l\'incident' : (initialData ? 'Mettre à jour' : 'Créer la tâche')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TaskDrawer;
