import { X, Camera, Info, Plus, Upload, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '../../utils/cn';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Alert from '../common/Alert';
import { USER_ROLES } from '../../constants/users';
import api from '../../services/api';

const DEFAULT_ROLES = Object.values(USER_ROLES);

const UserDrawer = ({ isOpen, onClose, onSubmit, initialData, availableRoles = [], onRefreshRoles }) => {
  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  };

  const maxDate = getMaxDate();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    role: '',
    cin: '',
    adresse: '',
    dateNaissance: '',
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState(null); // To store pending new role until user creation is confirmed
  
  const [formErrors, setFormErrors] = useState({}); // To track validation errors

  useEffect(() => {
    if (initialData) {
      // Normalize null values from API to empty strings for controlled inputs
      setFormData({
        nom: initialData.nom ?? '',
        prenom: initialData.prenom ?? '',
        telephone: initialData.telephone ?? '',
        role: initialData.role ?? '',
        cin: initialData.cin ?? '',
        adresse: initialData.adresse ?? '',
        dateNaissance: initialData.dateNaissance ?? '',
        photo: null,
      });
      setPhotoPreview(initialData.photo ?? null);
    } else {
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        role: '',
        cin: '',
        adresse: '',
        dateNaissance: '',
        photo: null,
      });
      setPhotoPreview(null);
    }
    setFormErrors({}); // Clear errors when drawer opens/closes
    setPendingRole(null); // Clear pending role when drawer opens/closes
    setIsAddingRole(false);
    setNewRoleName('');
  }, [initialData, isOpen]);

  const selectOptions = useMemo(() => {
    const options = [...availableRoles];
    // Safeguard: if initialData has a custom role not in the dynamic list, add it to options
    if (initialData?.role && !options.some(r => r.value === initialData.role)) {
      options.push({
        value: initialData.role,
        label: initialData.role.charAt(0).toUpperCase() + initialData.role.slice(1)
      });
    }
    // Add pending role if it exists
    if (pendingRole && !options.some(r => r.value === pendingRole.slug)) {
      options.push({
        value: pendingRole.slug,
        label: pendingRole.name.charAt(0).toUpperCase() + pendingRole.name.slice(1)
      });
    }
    // Also, if formData.role is set and not in the list, add it
    if (formData.role && !options.some(r => r.value === formData.role)) {
      options.push({
        value: formData.role,
        label: formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
      });
    }
    return options;
  }, [availableRoles, initialData?.role, formData.role, pendingRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(initialData?.photo || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
    // If the selected role is not the pending one, clear pendingRole
    if (!pendingRole || role !== pendingRole.slug) {
      setPendingRole(null);
    }
    setRoleDropdownOpen(false);
  };

  const handleAddNewRole = () => {
    const trimmed = newRoleName.trim();
    if (!trimmed) return;
    
    // Check if role name already exists in availableRoles (case insensitive)
    const exists = availableRoles.some(r => r.label.toLowerCase() === trimmed.toLowerCase());
    
    if (exists) {
      const foundRole = availableRoles.find(r => r.label.toLowerCase() === trimmed.toLowerCase());
      setFormData(prev => ({ ...prev, role: foundRole.value }));
      setPendingRole(null); // No pending role needed
    } else {
      // Generate a beautiful, unique dot background color for Access Management
      const backendColors = [
        'bg-purple-500',
        'bg-orange-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-pink-500',
        'bg-fuchsia-500',
        'bg-violet-500',
      ];
      let hash = 0;
      const normalized = trimmed.toLowerCase();
      for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
      }
      const backendColor = backendColors[Math.abs(hash) % backendColors.length];

      // Store as pending instead of creating immediately
      setPendingRole({
        name: trimmed,
        color: backendColor,
        slug: trimmed.toLowerCase()
      });
      setFormData(prev => ({ ...prev, role: trimmed.toLowerCase() }));
    }
    
    setNewRoleName('');
    setIsAddingRole(false);
    setRoleDropdownOpen(false);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormErrors({}); // Clear previous errors before submitting
      
      // If there's a pending role, create it first
      let finalRole = formData.role;
      if (pendingRole) {
        try {
          const response = await api.post('api/v1/roles-permissions/roles', {
            name: pendingRole.name,
            color: pendingRole.color
          });
          
          if (response && response.success) {
            finalRole = response.role.slug || pendingRole.slug;
            // Refresh roles list in parent
            if (onRefreshRoles) {
              await onRefreshRoles();
            }
          } else {
            finalRole = pendingRole.slug;
          }
        } catch (err) {
          console.error('Error creating pending role:', err);
          finalRole = pendingRole.slug;
        }
      }

      // Use FormData to support file upload
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          // Special handling for photo: only append if it's a File object
          if (key === 'photo') {
            if (formData[key] instanceof File || formData[key] instanceof Blob) {
              data.append(key, formData[key]);
            }
          } else if (key === 'role') {
            data.append(key, finalRole);
          } else {
            data.append(key, formData[key]);
          }
        }
      });

      await onSubmit(data);
      setPendingRole(null); // Reset pending role
      if (initialData) {
        onClose();
      }
    } catch (err) {
      // Log everything for debugging
      console.error('[FULL ERROR OBJECT]', err);
      
      // The error is already err.response.data directly (because of the api interceptor)
      // So err itself is the response data!
      
      // Log full server validation errors for debugging
      if (err.errors) {
        console.error('[422 Validation Errors]', err.errors);
        console.error('[422 Message]', err.message);
        
        // Map errors to form fields
        const errors = {};
        Object.entries(err.errors).forEach(([field, messages]) => {
          errors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setFormErrors(errors);
      } else if (err.message) {
        // Handle general unique constraint error
        console.error('[Error Message]', err.message);
        const errorMessage = err.message;
        
        // Check if it's the unique constraint error
        if (errorMessage.includes('Une donnée unique') || errorMessage.includes('déjà utilisée')) {
          // Show this error on telephone (the only editable unique field) AND as general error
          const newErrors = {
            telephone: errorMessage,
            _general: errorMessage
          };
          console.error('[Setting form errors]', newErrors);
          setFormErrors(newErrors);
        } else {
          // For other general errors
          setFormErrors({ _general: errorMessage });
        }
      } else {
        console.error('[Error]', err);
        setFormErrors({ _general: 'Une erreur est survenue.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:max-w-[500px] bg-white z-[70] border-l border-gray-100 transition-transform duration-500 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-50">
          <h2 className="text-xl md:text-2xl font-bold text-[#111827]">
            {initialData ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} icon={X} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 space-y-6 pt-4">
          
          {/* General Error Banner */}
          {formErrors._general && (
            <Alert 
              type="error" 
              message={formErrors._general} 
              onClose={() => setFormErrors(prev => ({ ...prev, _general: null }))}
            />
          )}
          
          {/* Enhanced Photo Upload */}
          <div className="flex flex-col items-center gap-4 py-4 md:py-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-24 h-24 md:w-28 md:h-28 rounded-sm object-cover border-4 border-white group-hover:brightness-90 transition-all"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center text-slate-400 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <Camera size={28} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">Choisir</span>
                </div>
              )}
              
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <div className="w-8 h-8 rounded-sm bg-[#1428C9] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <Upload size={14} />
                </div>
                {formData.photo && (
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removePhoto(); }}
                    className="w-8 h-8 rounded-sm bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              className="hidden" 
              accept="image/*"
            />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Photo de profil</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Nom" 
              name="nom" 
              value={formData.nom} 
              onChange={handleChange} 
              placeholder="Dupont" 
              required
              error={formErrors.nom || formErrors.last_name}
            />
            <Input 
              label="Prénom" 
              name="prenom" 
              value={formData.prenom} 
              onChange={handleChange} 
              placeholder="Jean" 
              required
              error={formErrors.prenom || formErrors.first_name}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Téléphone" 
              name="telephone" 
              value={formData.telephone} 
              onChange={handleChange} 
              placeholder="+33..." 
              error={formErrors.telephone || formErrors.phone}
            />
            <Input 
              label="CIN / Identité" 
              name="cin" 
              value={formData.cin} 
              onChange={handleChange} 
              placeholder="AB123456" 
              error={formErrors.cin}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Date de naissance" 
              type="date" 
              name="dateNaissance" 
              value={formData.dateNaissance} 
              onChange={handleChange} 
              max={maxDate} 
              error={formErrors.dateNaissance || formErrors.date_naissance}
            />
            <Input 
              label="Adresse" 
              name="adresse" 
              value={formData.adresse} 
              onChange={handleChange} 
              placeholder="Ville, Code Postal" 
              error={formErrors.adresse}
            />
          </div>

          {/* Simple Professional Select */}
          <Select 
            label="Attribuer un rôle"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: '', label: 'Choisir' },
              ...selectOptions.map(role => ({ value: role.value, label: role.label }))
            ]}
            error={formErrors.role}
          />

          {!isAddingRole ? (
            <button
              type="button"
              onClick={() => setIsAddingRole(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#1428C9]/5 text-[#1428C9] text-[11px] font-bold uppercase tracking-wider hover:bg-[#1428C9]/10 transition-all active:scale-95 border border-[#1428C9]/10"
            >
              <Plus size={14} />
              Créer un rôle personnalisé
            </button>
          ) : (
            <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 animate-in slide-in-up duration-300">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold text-[#1428C9] uppercase tracking-widest">Nouveau rôle</label>
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewRole(); } if (e.key === 'Escape') setIsAddingRole(false); }}
                    placeholder="ex: Manager Regional"
                    containerClassName="flex-1"
                  />
                  <Button variant="primary" size="sm" onClick={handleAddNewRole} className="h-10 px-6" type="button">Créer</Button>
                  <button type="button" onClick={() => setIsAddingRole(false)} className="p-2 text-slate-400"><X size={20} /></button>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-sm border border-slate-200 flex gap-3">
            <Info className="text-[#1428C9] shrink-0 mt-0.5" size={20} />
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              L'identifiant et le mot de passe provisoire seront générés automatiquement.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Button variant="outline" className="flex-1" onClick={onClose} type="button">Annuler</Button>
            <Button variant="primary" className="flex-[2]" type="submit" loading={isSubmitting}>
              {initialData ? 'Mettre à jour' : 'Valider la création'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserDrawer;
