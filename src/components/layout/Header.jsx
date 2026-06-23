import { Bell, Search, Globe, ChevronRight, Users, LogOut, ChevronDown, Menu, Package, Clock, X, AlertTriangle } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import useAuth from '@/hooks/useAuth';
import { stockService } from '@/services/stockService';

const Header = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await stockService.getNotifications();
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unread_count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await stockService.markNotificationRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const pathnames = location.pathname.split('/').filter((x) => x);
  // Get the current page (last part of the path)
  const currentPage = pathnames[pathnames.length - 1];

  const breadcrumbMap = {
    'users': 'Utilisateurs',
    'settings': 'Paramètres',
    'dashboard': 'Tableau de bord',
    'stock': 'Gestion du stock',
    'roles-permissions': 'Roles & Permissions',
    'historique': 'Historique',
    'subscriptions': 'Souscriptions',
    'dossiers': 'Dossiers',
    'catalogue': 'Catalogue',
    'communication': 'Communication',
    'tasks': 'Tâches',
    'incidents': 'Incidents',
    'time': 'Pointage',
    'help': 'Aide'
  };

  const currentPageName = currentPage 
    ? (breadcrumbMap[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1))
    : '';

  return (
    <header className="h-20 bg-white/80 backdrop-blur-2xl border-b border-[#1428C9]/5 sticky top-0 z-40 px-6 lg:pl-28 lg:pr-8">
      <div className="flex items-center justify-between h-full">
        {/* Left: Menu Toggle & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden p-2 rounded-2xl hover:bg-[#1428C9]/10" 
            onClick={onMenuClick}
            icon={Menu}
          />
          
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link to="/dashboard" className="text-gray-400 hover:text-[#1428C9] transition-all duration-300 font-semibold">Accueil</Link>
            {currentPageName && currentPageName !== 'Tableau de bord' && (
              <div className="flex items-center gap-3">
                <ChevronRight size={16} className="text-gray-300" />
                <span className="font-extrabold text-[#111827] tracking-tight">{currentPageName}</span>
              </div>
            )}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-11 pr-4 py-2.5 bg-gray-50/80 border border-transparent hover:border-[#1428C9]/20 focus:border-[#1428C9]/40 focus:bg-white rounded-2xl text-sm font-medium text-gray-700 placeholder:text-gray-400 transition-all duration-300 w-64 focus:w-80 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="relative p-2.5 rounded-2xl hover:bg-[#1428C9]/10 text-gray-400 hover:text-[#1428C9] transition-all duration-300">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-br from-red-500 to-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-[100] w-96 bg-white/95 backdrop-blur-2xl rounded-3xl border border-gray-100 shadow-2xl p-3 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
                  sideOffset={16}
                  align="end"
                >
                  <div className="px-4 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#111827]">Notifications</h3>
                    <span className="text-[10px] font-bold bg-gradient-to-r from-[#1428C9] to-indigo-500 text-white px-3 py-1 rounded-full shadow-md">
                      {unreadCount} Nouvelles
                    </span>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto py-3 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Bell size={24} className="text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownMenu.Item 
                          key={notif.id} 
                          className="outline-none p-4 hover:bg-gradient-to-r from-[#1428C9]/5 to-indigo-50 rounded-2xl transition-all cursor-pointer group relative mb-2"
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                              notif.data.type === 'stock_alert' 
                                ? 'bg-gradient-to-br from-red-50 to-rose-50 text-red-500' 
                                : 'bg-gradient-to-br from-[#1428C9]/10 to-indigo-50 text-[#1428C9]'
                            }`}>
                              {notif.data.type === 'stock_alert' ? <AlertTriangle size={20} /> : <Package size={20} />}
                            </div>
                            <div className="space-y-1 flex-1">
                              <p className="text-xs font-black text-[#111827]">{notif.data.title}</p>
                              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                {notif.data.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock size={12} className="text-gray-300" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-xl transition-all shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id);
                            }}
                          >
                            <X size={14} className="text-gray-400" />
                          </button>
                        </DropdownMenu.Item>
                      ))
                    )}
                  </div>
                  
                  <Link 
                    to="/stock" 
                    className="block w-full py-3.5 mt-2 text-center text-[11px] font-black text-white bg-gradient-to-r from-[#1428C9] to-indigo-600 hover:from-[#1428C9]/90 hover:to-indigo-600/90 rounded-2xl transition-all duration-300 uppercase tracking-widest shadow-lg shadow-[#1428C9]/25"
                  >
                    Voir tout l'historique
                  </Link>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Profile Dropdown */}
            <div className="flex items-center pl-3 border-l border-gray-100">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="outline-none group">
                  <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="w-10 h-10 flex-none">
                      {/* Avatar supprimé mais espace conservé */}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-extrabold text-[#111827] leading-tight">{user?.full_name || (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.name || 'Utilisateur')}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{user?.role_name || user?.role || 'Rôle'}</p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 hidden sm:block group-hover:text-[#1428C9] transition-colors" />
                  </div>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-[100] w-64 bg-white/95 backdrop-blur-2xl rounded-3xl border border-gray-100 p-3 shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
                    sideOffset={16}
                    align="end"
                  >
                    <div className="px-4 py-4 mb-2 border-b border-gray-50">
                      <p className="text-sm font-extrabold text-[#111827] leading-none">{user?.full_name || (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.name || 'Utilisateur')}</p>
                      <p className="text-[11px] text-gray-500 mt-1.5 font-medium">{user?.email || 'email@example.com'}</p>
                    </div>
                    <div className="p-1 space-y-1">
                      <DropdownMenu.Item asChild className="outline-none">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gradient-to-r from-[#1428C9]/10 to-indigo-50 hover:text-[#1428C9] transition-all duration-300">
                          <Users size={18} />
                          <span>Mon Profil</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild className="outline-none">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-gradient-to-r from-red-50 to-rose-50 transition-all duration-300">
                          <LogOut size={18} />
                          <span>Déconnexion</span>
                        </button>
                      </DropdownMenu.Item>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
