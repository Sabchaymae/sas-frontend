import React from 'react';
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const SubscriptionTable = ({ data = [], onView, onEdit, onDelete, isAssistant = false }) => {
  return (
    <div className="sub-table-container">
      <table className="sub-table border-spacing-0">
        <thead>
          <tr>
            <th className="py-4 px-6 text-xs font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Client Name</th>
            <th className="py-4 px-6 text-xs font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">CIN / Phone</th>
            <th className="py-4 px-6 text-xs font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Operator / Type</th>
            <th className="py-4 px-6 text-xs font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Status</th>
            <th className="py-4 px-6 text-xs font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Animateur</th>
            <th className="py-4 px-6 text-xs font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Date</th>
            <th className="py-4 px-6 text-xs font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="py-5 px-6 border-b border-slate-50">
                <div className="client-cell">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shadow-sm">{row.client.avatar}</div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{row.client.name}</div>
                    <div className="text-[11px] font-bold text-slate-400 truncate max-w-[150px]">{row.client.address}</div>
                  </div>
                </div>
              </td>
              <td className="py-5 px-6 border-b border-slate-50">
                <div className="text-sm font-extrabold text-slate-900">{row.contact.cin}</div>
                <div className="text-[11px] font-bold text-slate-400">{row.contact.phone}</div>
              </td>
              <td className="py-5 px-6 border-b border-slate-50">
                <div className="operator-pill">
                  <span className="dot" style={{ backgroundColor: row.operator.color }}></span>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{row.operator.name}</span>
                </div>
                <div className="mt-1 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md inline-block uppercase">{row.operator.type}</div>
              </td>
              <td className="py-5 px-6 border-b border-slate-50">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider status-${row.status.toLowerCase()}`}>
                  {row.status}
                </span>
              </td>
              <td className="py-5 px-6 border-b border-slate-50">
                <div className="text-[11px] font-extrabold text-slate-500">{row.validator}</div>
              </td>
              <td className="py-5 px-6 border-b border-slate-50">
                <div className="text-xs font-extrabold text-slate-900">{row.date}</div>
              </td>
              <td className="py-5 px-6 border-b border-slate-50 text-right">
                {isAssistant ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <button 
                      className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                      onClick={() => onView(row)}
                    >
                      <Eye size={12} strokeWidth={3} /> View Details
                    </button>
                    {row.status === 'PENDING' && (
                      <>
                        <button 
                          className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                          onClick={() => onEdit(row)}
                        >
                          <Edit2 size={12} strokeWidth={3} /> Validate
                        </button>
                        <button 
                          className="flex items-center gap-2 text-[10px] font-black text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                          onClick={() => onDelete(row)}
                        >
                          <Trash2 size={12} strokeWidth={3} /> Refuse
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-end gap-1">
                    <button className="action-icon-btn" onClick={() => onView(row)}><Eye size={16} /></button>
                    <button className="action-icon-btn" onClick={() => onEdit(row)}><Edit2 size={16} /></button>
                    <button className="action-icon-btn text-red-500 hover:bg-red-50" onClick={() => onDelete(row)}><Trash2 size={16} /></button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <div className="pagination-info">Showing {data.length} entries</div>
        <div className="pagination-buttons">
          <button className="page-btn"><ChevronLeft size={16} /></button>
          <button className="page-btn active">1</button>
          <button className="page-btn"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTable;
