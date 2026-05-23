import { X, Shield, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

const RoleDrawer = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [roleName, setRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRoleName(initialData.name || '');
    } else {
      setRoleName('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(roleName);
      onClose();
    } catch (err) {
      console.error('[Error saving role]', err);
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
            {initialData ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} icon={X} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 space-y-8 pt-6">
          
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 bg-primary/10 rounded-sm flex items-center justify-center text-primary border border-primary/20">
              <Shield size={40} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration du rôle</p>
          </div>

          <div className="space-y-6">
            <Input 
              label="Nom du rôle" 
              value={roleName} 
              onChange={(e) => setRoleName(e.target.value)} 
              placeholder="Ex: Responsable Logistique" 
              required 
              autoFocus
            />

            <div className="p-4 bg-slate-50 rounded-sm border border-slate-200 flex gap-3">
              <Info className="text-[#1428C9] shrink-0 mt-0.5" size={20} />
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                Le nom du rôle doit être unique. Une fois créé, vous pourrez lui attribuer des permissions spécifiques dans les étapes suivantes.
              </p>
            </div>
          </div>

          <div className="pt-8 flex items-center gap-4">
            <Button variant="outline" className="flex-1" onClick={onClose} type="button">Annuler</Button>
            <Button variant="primary" className="flex-[2]" type="submit" loading={isSubmitting} disabled={!roleName.trim()}>
              {initialData ? 'Mettre à jour' : 'Confirmer la création'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RoleDrawer;
