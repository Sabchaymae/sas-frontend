import React from 'react';
import { clsx } from 'clsx';
import { Shield, Plus, Check, Pencil, Trash2 } from 'lucide-react';

const RoleList = ({ roles, selectedRoles, onToggleRole, onAddRole, onDoubleClickRole, onEditRole, onDeleteRole, canAdd = true, canEdit = true, canDelete = true }) => {
  return (
    <div className="h-[400px] overflow-y-auto custom-scrollbar border border-gray-100 bg-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add Role Button */}
        {canAdd && (
          <button
            onClick={onAddRole}
            className="p-5 border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 min-h-[120px]"
          >
            <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center text-primary">
              <Plus size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ajouter un rôle</span>
          </button>
        )}

        {/* Existing Roles */}
        {roles.map((role) => {
          const isSelected = selectedRoles.includes(role.id);
          return (
            <div
              key={role.id}
              onClick={() => onToggleRole(role.id)}
              onDoubleClick={() => onDoubleClickRole && onDoubleClickRole(role.id)}
              className={clsx(
                "group relative cursor-pointer text-left p-5 transition-all duration-200 border flex flex-col gap-4 overflow-hidden min-h-[120px]",
                isSelected
                  ? "bg-primary/5 border-primary"
                  : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {/* Action Overlay (Hover) */}
              {!role.isStatic && (canEdit || canDelete) && (
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {canEdit && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRole(role);
                      }}
                      className="p-1.5 bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-primary transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRole(role);
                      }}
                      className="p-1.5 bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between w-full">
                <div className={clsx(
                  "w-10 h-10 flex items-center justify-center text-white transition-all duration-200 group-hover:scale-110",
                  role.color || "bg-gray-500"
                )}>
                  <Shield size={18} />
                </div>
                <div className={clsx(
                  "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border",
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-100 text-gray-500 border-transparent"
                )}>
                  {role.users} users
                </div>
              </div>

              <div>
                <h4 className={clsx(
                  "font-black text-sm uppercase tracking-tight transition-colors",
                  isSelected ? "text-primary" : "text-text-dark"
                )}>
                  {role.name}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleList;
