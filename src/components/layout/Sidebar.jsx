import { memo } from 'react';
import { useLocation, Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Folder,
  Box,
  MessageSquare,
  CheckSquare,
  Clock,
  Settings,
  HelpCircle,
  Activity,
  ShieldCheck,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from '../../utils/cn';

const Sidebar = memo(({ isOpen, onClose }) => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAssistant = user?.role?.toLowerCase() === 'assistant' || user?.email === 'assistante@oriotel.com';

  const NAVIGATION = [
    { name: "Tableau de bord", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Utilisateurs", href: "/dashboard/users", icon: <Users className="w-5 h-5" /> },
    { name: "Rôles & Permissions", href: "/dashboard/roles-permissions", icon: <ShieldCheck className="w-5 h-5" /> },
    { name: "Historique", href: "/dashboard/historique", icon: <Activity className="w-5 h-5" /> },
    { 
      name: "Souscriptions", 
      href: "/dashboard/subscriptions",
      icon: <CreditCard className="w-5 h-5" /> 
    },
    { name: "Dossiers", href: "/dashboard/dossiers", icon: <Folder className="w-5 h-5" /> },
    { name: "Stock", href: "/dashboard/stock", icon: <Box className="w-5 h-5" /> },
    { name: "Communication", href: "/dashboard/communication", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Tâches", href: "/dashboard/tasks", icon: <CheckSquare className="w-5 h-5" /> },
    { name: "Pointage", href: "/dashboard/time", icon: <Clock className="w-5 h-5" /> },
  ];

  const NAVS_FOOTER = [
    { name: "Aide", href: "/dashboard/help", icon: <HelpCircle className="w-5 h-5" /> },
    { name: "Paramètres", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 h-full bg-white/95 backdrop-blur-lg border-r border-gray-100 flex flex-col z-[50] transition-all duration-[1000ms] cubic-bezier(0.23, 1, 0.32, 1)",
      "w-64 lg:w-20",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:-translate-x-[calc(100%-4px)]",
      "lg:hover:translate-x-0 group/sidebar"
    )}>
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-4 p-2 text-gray-400 hover:text-[#1428C9] lg:hidden"
      >
        <X size={20} />
      </button>

      {/* Visual Indicator (Fleche) */}
      <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-8 h-14 bg-[#1428C9] flex lg:items-center justify-center rounded-r-sm lg:group-hover/sidebar:opacity-0 lg:group-hover/sidebar:pointer-events-none transition-all duration-300 cursor-pointer hidden lg:flex">
        <ChevronRight size={20} className="text-white animate-bounce-horizontal" />
      </div>

      <div className={cn(
        "flex flex-col h-full items-center justify-start relative pt-24 transition-all duration-[800ms] cubic-bezier(0.23, 1, 0.32, 1) delay-[100ms]",
        "opacity-100 lg:opacity-0 lg:-translate-x-4 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:translate-x-0 lg:group-hover/sidebar:delay-300"
      )}>

        {/* Brand Logo */}
        <div className="absolute top-0 left-0 w-full h-20 flex items-center justify-center border-b border-gray-50 lg:border-none">
          <div className="w-10 h-10 rounded-sm bg-[#1428C9] flex items-center justify-center active:scale-90 transition-transform cursor-pointer">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <span className="ml-3 font-bold text-[#111827] text-lg lg:hidden">Oriotel ERP</span>
        </div>

        {/* Navigation Icons */}
        <div className="w-full mt-6 lg:mt-0">
          <ul className="px-3 space-y-4">
            {NAVIGATION.map((item, idx) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <li key={idx} className="relative group">
                  <Link
                    to={item.href}
                    onClick={() => onClose()}
                    className={cn(
                      "flex items-center gap-4 lg:justify-center w-full h-12 rounded-sm transition-all duration-300 ease-out active:scale-95 px-4 lg:px-0",
                      isActive
                        ? "bg-[#1428C9] text-white"
                        : "text-gray-400 hover:bg-gray-50 hover:text-[#111827]"
                    )}
                  >
                    {item.icon}
                    <span className="text-sm font-bold lg:hidden">{item.name}</span>
                    <span className="absolute left-16 px-3 py-2 rounded-sm whitespace-nowrap text-xs font-bold text-white bg-[#111827] opacity-0 translate-x-[-10px] lg:group-hover:opacity-100 lg:group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-[100] hidden lg:block">
                      {item.name}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#111827] rotate-45" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer Icons */}
        <div className="mt-auto lg:absolute lg:bottom-0 lg:left-0 w-full px-3 pb-8 flex flex-col items-center">
          <ul className="w-full space-y-4">
            {NAVS_FOOTER.map((item, idx) => (
              <li key={idx} className="relative group">
                <Link
                  to={item.href}
                  onClick={() => onClose()}
                  className="flex items-center gap-4 lg:justify-center w-full h-12 rounded-sm text-gray-400 hover:bg-gray-50 hover:text-[#111827] transition-all duration-300 ease-out active:scale-95 px-4 lg:px-0"
                >
                  {item.icon}
                  <span className="text-sm font-bold lg:hidden">{item.name}</span>
                  <span className="absolute left-16 px-3 py-2 rounded-sm whitespace-nowrap text-xs font-bold text-white bg-[#111827] opacity-0 translate-x-[-10px] lg:group-hover:opacity-100 lg:group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-[100] hidden lg:block">
                    {item.name}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#111827] rotate-45" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
});

export default Sidebar;
