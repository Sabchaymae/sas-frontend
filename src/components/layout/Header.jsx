import { Bell, Search, Globe, ChevronRight, Users, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import Button from '../common/Button';
import Input from '../common/Input';
import useAuth from '@/hooks/useAuth';

const Header = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbMap = {
    'users': 'Utilisateurs',
    'settings': 'Paramètres',
    'dashboard': 'Tableau de bord',
    'stock': 'Gestion du stock'
  };

  return (
    <header className="min-h-[4rem] py-3 lg:py-0 bg-white border-b border-gray-100 sticky top-0 z-40 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:h-16">
        {/* Left: Menu Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden p-2 -ml-2" 
            onClick={onMenuClick}
            icon={Menu}
          />
          
          <nav className="flex items-center gap-3 text-sm font-medium overflow-x-auto whitespace-nowrap no-scrollbar py-1">
            <Link to="/dashboard" className="text-gray-500 hover:text-[#1428C9] transition-all duration-200 shrink-0 font-semibold">Accueil</Link>
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const name = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

              return (
                <div key={to} className="flex items-center gap-3 shrink-0 animate-in fade-in slide-in-right" style={{ animationDelay: `${index * 50}ms` }}>
                  <ChevronRight size={14} className="text-gray-300" />
                  {last ? (
                    <span className="font-bold text-[#111827]">{name}</span>
                  ) : (
                    <Link to={to} className="text-gray-500 hover:text-[#1428C9] transition-all duration-200 font-semibold">
                      {name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-2 md:gap-4 w-full lg:w-auto">
          <Input
            icon={Search}
            placeholder="Rechercher..."
            containerClassName="flex-1 lg:w-80 lg:flex-none"
            className="py-2"
          />

          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="relative p-2 md:p-2.5">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#1428C9] rounded-full border-2 border-white"></span>
            </Button>

            {/* Profile Dropdown */}
            <div className="flex items-center pl-2 md:pl-4 border-l border-gray-100 ml-1 md:ml-0">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger className="outline-none group">
                  <div className="flex items-center gap-3 p-1 rounded-sm hover:bg-gray-50 transition-all cursor-pointer">
                    <Avatar.Root className="flex-none">
                      <Avatar.Image
                        className="w-9 h-9 md:w-10 md:h-10 rounded-sm object-cover ring-2 ring-transparent group-hover:ring-[#1428C9]/10 transition-all"
                        src={user?.avatar || "https://randomuser.me/api/portraits/women/79.jpg"}
                        alt={user?.first_name || "vienna"}
                      />
                      <Avatar.Fallback
                        className="flex w-9 h-9 md:w-10 md:h-10 rounded-sm items-center justify-center text-white text-xs font-bold bg-gradient-to-tr from-[#1428C9] to-blue-400"
                      >
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-bold text-[#111827] leading-none">{user?.full_name || 'Utilisateur'}</p>
                      <p className="text-[11px] text-gray-400 mt-1 capitalize">{user?.role || 'Rôle'}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                  </div>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-[100] w-64 bg-white rounded-sm border border-gray-100 p-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
                    sideOffset={12}
                    align="end"
                  >
                    <div className="px-4 py-3 mb-1 border-b border-gray-50">
                      <p className="text-sm font-bold text-[#111827] leading-none">{user?.full_name || 'Utilisateur'}</p>
                      <p className="text-[11px] text-gray-500 mt-1.5 font-medium">{user?.email || 'email@example.com'}</p>
                    </div>
                    <div className="p-1">
                      <DropdownMenu.Item className="outline-none">
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-semibold text-gray-600 hover:bg-[#F0F3FF] hover:text-[#1428C9] transition-all duration-200">
                          <Users size={18} />
                          <span>Mon Profil</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="outline-none">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200">
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
