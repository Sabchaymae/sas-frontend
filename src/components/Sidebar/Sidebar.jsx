import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, MessageSquare, Factory, 
  ClipboardList, TrendingUp, Users, Settings, X, ChevronDown
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, onClose }) => {
  const mainMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Orders', icon: ShoppingCart, path: '/orders' },
    { label: 'Requests', icon: MessageSquare, path: '/requests' },
    { label: 'Shop Floor', icon: Factory, path: '/shop-floor' },
    { label: 'Production Plan', icon: ClipboardList, path: '/production-plan' },
    { label: 'Forecast', icon: TrendingUp, path: '/forecast' },
  ];

  const secondaryMenuItems = [
    { label: 'Users', icon: Users, path: '/roles-permissions' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={clsx(
        "fixed top-0 left-0 right-0 bg-white border-b border-gray-100 flex flex-col transition-all duration-500 ease-in-out z-50 overflow-hidden origin-top",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
      style={{ maxHeight: '80vh' }}
    >
      <div className="h-20 flex items-center px-6 md:px-10 justify-between bg-bg-light/30 border-b border-gray-50">
        <div className="flex items-center gap-4">
           <img src="/logo_oriotel.png" alt="Oriotel" className="h-8 w-auto" />
           <div className="w-px h-6 bg-gray-200 mx-2" />
           <span className="text-xs font-bold tracking-widest text-primary uppercase">Main Menu</span>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 bg-white grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase px-4 border-l-2 border-primary">Opérations</h3>
          <nav className="space-y-1">
            {mainMenuItems.slice(0, 3).map((item) => (
              <SidebarItem key={item.label} {...item} onClick={onClose} />
            ))}
          </nav>
        </div>
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase px-4 border-l-2 border-emerald-500">Fabrication</h3>
          <nav className="space-y-1">
            {mainMenuItems.slice(3).map((item) => (
              <SidebarItem key={item.label} {...item} onClick={onClose} />
            ))}
          </nav>
        </div>
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase px-4 border-l-2 border-amber-500">Configuration</h3>
          <nav className="space-y-1">
            {secondaryMenuItems.map((item) => (
              <SidebarItem key={item.label} {...item} onClick={onClose} />
            ))}
          </nav>
        </div>
        <div className="hidden lg:block">
          <div className="bg-bg-light p-6 border border-gray-100 relative overflow-hidden group">
            <h4 className="text-sm font-bold text-text-dark mb-2">Centre d'aide</h4>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">Consultez notre documentation complète pour maîtriser l'ERP Oriotel.</p>
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Voir les guides <ChevronDown size={14} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>
      <div className="h-1.5 w-full bg-primary/10">
        <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
      </div>
    </aside>
  );
};

export default Sidebar;
