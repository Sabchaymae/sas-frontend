import { useState, useCallback, useEffect } from 'react';
<<<<<<< HEAD
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import useCommunicationWebSocket from '../../hooks/useCommunicationWebSocket';

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Initialize WebSocket connections (including presence channel for online status)
  useCommunicationWebSocket();

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#F9FAFB] flex">
      {/* Sidebar Component */}
      <Sidebar isMobileOpen={isMobileOpen} onMobileClose={closeMobileSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-[80px] transition-all duration-300"
           id="main-content-area">
        <Header onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-[1800px] mx-auto">
=======
import { Outlet, useLocation, Link } from 'react-router-dom';
import Header from './Header';
import { useWebSockets, initAudioContext } from '../../hooks/useWebSockets';
import ChatWidget from '../communication/ChatWidget';
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
  ChevronRight,
  Shield,
  History
} from "lucide-react";

const DashboardLayout = () => {
  // 1. ALL HOOKS AT TOP, IN FIXED ORDER (no conditionals!)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation(); // Always call this hook first!
  useWebSockets(); // Initialize WebSocket connections here
  
  // Initialize audio context on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);
  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Utilisateurs", href: "/dashboard/users", icon: <Users className="w-5 h-5" /> },
    { name: "Rôles", href: "/dashboard/roles-permissions", icon: <Shield className="w-5 h-5" /> },
    { name: "Historique", href: "/dashboard/historique", icon: <History className="w-5 h-5" /> },
    { name: "Souscriptions", href: "/dashboard/subscriptions", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Dossiers", href: "/dashboard/dossiers", icon: <Folder className="w-5 h-5" /> },
    { name: "Stock", href: "/dashboard/stock", icon: <Box className="w-5 h-5" /> },
    { name: "Communication", href: "/dashboard/communication", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Tâches", href: "/dashboard/tasks", icon: <CheckSquare className="w-5 h-5" /> },
    { name: "Temps", href: "/dashboard/time", icon: <Clock className="w-5 h-5" /> },
  ];

  const navsFooter = [
    { name: "Aide", href: "/dashboard/help", icon: <HelpCircle className="w-5 h-5" /> },
    { name: "Paramètres", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <div className="hidden lg:block">
        <nav className="fixed top-0 left-0 w-20 h-full bg-white/95 backdrop-blur-lg border-r border-gray-100 flex flex-col z-[50] -translate-x-[calc(100%-4px)] hover:translate-x-0 transition-all duration-[1000ms] cubic-bezier(0.23, 1, 0.32, 1) delay-[400ms] group-hover:duration-700 group-hover:delay-150 group/sidebar">
          {/* Visual Indicator (Fleche) - Visible when hidden */}
          <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-8 h-14 bg-[#1428C9] flex items-center justify-center rounded-r-sm group-hover/sidebar:opacity-0 group-hover/sidebar:pointer-events-none transition-all duration-300 cursor-pointer">
            <ChevronRight size={20} className="text-white animate-bounce-horizontal" />
          </div>

          {/* Invisible trigger padding to make it easier to hover */}
          <div className="absolute top-0 -right-8 w-8 h-full" />

          <div className="flex flex-col h-full items-center justify-start relative pt-24 opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-[800ms] cubic-bezier(0.23, 1, 0.32, 1) delay-[100ms] group-hover/sidebar:delay-300">

            {/* Brand Logo - Top Absolute */}
            <div className="absolute top-0 left-0 w-full h-20 flex items-center justify-center">
              <div className="w-10 h-10 rounded-sm bg-[#1428C9] flex items-center justify-center active:scale-90 transition-transform cursor-pointer">
                <span className="text-white font-bold text-xl">O</span>
              </div>
            </div>

            {/* Navigation Icons - Centered Vertically */}
            <div className="w-full">
              <ul className="px-3 space-y-4">
                {navigation.map((item, idx) => {
                  const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <li key={idx} className="relative group">
                      <Link
                        to={item.href}
                        className={`flex items-center justify-center w-full h-12 rounded-sm transition-all duration-300 ease-out active:scale-95 ${isActive
                          ? "bg-[#1428C9] text-white"
                          : "text-gray-400 hover:bg-gray-50 hover:text-[#111827]"
                          }`}
                      >
                        {item.icon}
                        {/* Tooltip on hover */}
                        <span className="absolute left-16 px-3 py-2 rounded-sm whitespace-nowrap text-xs font-bold text-white bg-[#111827] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-[100]">
                          {item.name}
                          {/* Small Arrow */}
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#111827] rotate-45" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer Icons - Bottom Absolute */}
            <div className="absolute bottom-0 left-0 w-full px-3 pb-8 flex flex-col items-center">
              <ul className="w-full space-y-4">
                {navsFooter.map((item, idx) => (
                  <li key={idx} className="relative group">
                    <Link
                      to={item.href}
                      className="flex items-center justify-center w-full h-12 rounded-sm text-gray-400 hover:bg-gray-50 hover:text-[#111827] transition-all duration-300 ease-out active:scale-95"
                    >
                      {item.icon}
                      <span className="absolute left-16 px-3 py-2 rounded-sm whitespace-nowrap text-xs font-bold text-white bg-[#111827] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-[100]">
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
      </div>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <div className="max-w-[1600px] mx-auto">
>>>>>>> import/master
            <Outlet />
          </div>
        </main>
      </div>
<<<<<<< HEAD
=======

      {/* Global Chat Widget — hidden on /dashboard/communication */}
      {!location.pathname.startsWith('/dashboard/communication') && <ChatWidget />}


>>>>>>> import/master
    </div>
  );
};

export default DashboardLayout;
