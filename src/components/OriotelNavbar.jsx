import React from 'react';
import { LayoutGrid, Search, Bell, ChevronRight } from 'lucide-react';

const OriotelNavbar = ({ breadcrumbs = [] }) => (
  <nav style={{ background: '#111827' }}
    className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 shadow-none border-none">
    {/* Left: Logo + Breadcrumb */}
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-5 h-5" style={{ color: '#1428C9' }} />
        <span className="font-bold text-white text-sm tracking-wide">oriotel</span>
        <span style={{ color: '#1428C9' }} className="font-black text-sm">.</span>
      </div>
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 text-xs">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-500" />}
              <span className={i === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-gray-400'}>{b}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>

    {/* Center: Search */}
    <div className="relative hidden md:block w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input type="text" placeholder="Search or type a command (Ctrl+G)"
        className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 placeholder:text-gray-500 outline-none focus:border-blue-500 transition-colors" />
    </div>

    {/* Right: Notif + Lang + Avatar */}
    <div className="flex items-center gap-3">
      <button className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
        <Bell className="w-4 h-4 text-gray-300" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: '#1428C9' }}>3</span>
      </button>
      <button className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold text-gray-300 border-none hover:bg-gray-700 transition-colors shadow-none">FR</button>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1428C9' }}>A</div>
    </div>
  </nav>
);

export default OriotelNavbar;
