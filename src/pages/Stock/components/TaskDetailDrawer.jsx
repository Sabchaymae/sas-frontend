import { X, Info, Send, AlertCircle, MessageSquare, Clock, CheckCircle2, ChevronRight, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { stockService } from '@/services/stockService';
import useAuth from '@/hooks/useAuth';

const TaskDetailDrawer = ({ isOpen, onClose, task, onUpdate, onStatusChange }) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('comment'); // 'comment' | 'issue'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(task?.comments || []);

  // Update local comments when task prop changes
  useEffect(() => {
    setLocalComments(task?.comments || []);
  }, [task]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await stockService.addTaskComment(task.id, {
        content: newComment,
        type: commentType
      });

      if (response.success) {
        const comment = response.comment;
        setLocalComments(prev => [...prev, comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('[Error adding comment]', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'TO_DO', label: 'A FAIRE' },
    { value: 'IN_PROGRESS', label: 'EN COURS' },
    { value: 'BLOCKED', label: 'BLOQUÉE' },
    { value: 'COMPLETED', label: 'TERMINÉE' },
    { value: 'CANCELLED', label: 'ANNULÉE' },
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:max-w-[550px] bg-white z-[110] border-l border-gray-100 transition-transform duration-500 ease-in-out flex flex-col shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
              task.status === 'COMPLETED' ? "bg-emerald-500 text-white" : "bg-[#1428C9] text-white"
            )}>
              {task.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827] line-clamp-1">{task.title}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Détails de la tâche #{task.id}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={X} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
          
          {/* Status & Priority Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Statut actuel</label>
              <Select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                options={statusOptions}
                className="font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Échéance</label>
              <div className="h-[42px] flex items-center px-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-[#111827]">
                <Clock size={16} className="text-gray-300 mr-2" />
                {task.due_date || 'Non définie'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 leading-relaxed min-h-[100px]">
              {task.description || 'Aucune description fournie.'}
            </div>
          </div>

          {/* Assigned Users */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Membres assignés</label>
            <div className="flex flex-wrap gap-2">
              {task.users?.map(u => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[#1428C9]/10 flex items-center justify-center text-[10px] font-black text-[#1428C9] overflow-hidden">
                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-[#111827]">{u.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments & Issues Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-[#111827] uppercase tracking-widest ml-1">
                Discussion & Signalements
              </label>
              <span className="text-[10px] font-black text-[#1428C9] bg-[#1428C9]/5 px-2 py-1 rounded-lg">
                {localComments.length} messages
              </span>
            </div>

            {/* Comment List */}
            <div className="space-y-4">
              {localComments.length > 0 ? (
                localComments.map((comment, idx) => (
                  <div 
                    key={comment.id || idx} 
                    className={cn(
                      "p-4 rounded-2xl border transition-all animate-in slide-in-from-bottom-2",
                      comment.type === 'issue' 
                        ? "bg-red-50/50 border-red-100" 
                        : "bg-gray-50/50 border-gray-100"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                          {comment.user?.name?.charAt(0)}
                        </div>
                        <span className="text-[11px] font-black text-[#111827]">{comment.user?.name}</span>
                        {comment.type === 'issue' && (
                          <span className="flex items-center gap-1 text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                            <AlertCircle size={10} /> Problème
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                  <MessageSquare size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Aucun message</p>
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-4 pt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCommentType('comment')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                    commentType === 'comment' 
                      ? "border-[#1428C9] bg-[#1428C9] text-white" 
                      : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                  )}
                >
                  Commentaire
                </button>
                <button
                  type="button"
                  onClick={() => setCommentType('issue')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                    commentType === 'issue' 
                      ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/20" 
                      : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                  )}
                >
                  Signaler un Problème
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={commentType === 'issue' ? "Décrivez le problème rencontré..." : "Ajouter un commentaire..."}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border-2 text-xs font-bold outline-none transition-all resize-none h-24",
                    commentType === 'issue' 
                      ? "bg-red-50/30 border-red-100 focus:border-red-500" 
                      : "bg-gray-50 border-gray-100 focus:border-[#1428C9]"
                  )}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className={cn(
                    "absolute bottom-3 right-3 p-2 rounded-xl transition-all active:scale-95 disabled:opacity-50",
                    commentType === 'issue' ? "bg-red-500 text-white" : "bg-[#1428C9] text-white"
                  )}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-50 flex gap-4">
          <Button variant="outline" className="flex-1 h-12" onClick={onClose}>Fermer</Button>
          {isAdmin && (
            <Button 
              variant="primary" 
              className="flex-[2] h-12"
              onClick={() => {
                // Optionnel: Ouvrir le drawer d'édition
                onClose();
              }}
            >
              Modifier la tâche
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskDetailDrawer;