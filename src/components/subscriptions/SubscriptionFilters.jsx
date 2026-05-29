import React, { useState } from 'react';
import { Search, Plus, Filter, Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react';

import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const SubscriptionFilters = ({ onAddClick, onSearch, onExport, onFilterToggle }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const user = useSelector(selectUser);
  const isAssistant = user?.role?.toLowerCase() === 'assistant' || user?.email === 'assistante@oriotel.com';

  const handleExport = (format) => {
    onExport(format);
    setIsExportOpen(false);
  };

  return (
    <div className="toolbar">
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search by ID, name, or CIN..." 
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      <div className="action-buttons">
        <button className="btn-premium btn-secondary" onClick={onFilterToggle}>
          <Filter size={18} />
          <span>Filter</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative inline-block text-left">
          <button 
            className="btn-premium btn-secondary"
            onClick={() => setIsExportOpen(!isExportOpen)}
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          
          {isExportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20 overflow-hidden border border-slate-100">
                <div className="py-1">
                  <button 
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => handleExport('pdf')}
                  >
                    <FileText size={16} className="text-red-500" />
                    <span>Export as PDF</span>
                  </button>
                  <button 
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => handleExport('excel')}
                  >
                    <FileSpreadsheet size={16} className="text-emerald-500" />
                    <span>Export as Excel</span>
                  </button>
                  <button 
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => handleExport('csv')}
                  >
                    <FileCode size={16} className="text-blue-500" />
                    <span>Export as CSV</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {onAddClick && !isAssistant && (
          <button className="btn-premium btn-primary" onClick={onAddClick}>
            <Plus size={18} />
            <span>Add Subscription</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFilters;
