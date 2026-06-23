import { useState, useEffect, memo } from 'react';
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  History,
  Shield,
  Menu,
  X,
  AlertTriangle,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from '../../utils/cn';
import usePermissions from '../../hooks/usePermissions';

const Sidebar = memo(({ isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  
  // Persist collapse state in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    
    // Update main content margin
    const mainContent = document.getElementById('main-content-area');
    if (mainContent) {
      mainContent.style.marginLeft = isCollapsed ? '80px' : '280px';
    }
  }, [isCollapsed]);

  // Set initial margin on mount
  useEffect(() => {
    const mainContent = document.getElementById('main-content-area');
    if (mainContent) {
      mainContent.style.marginLeft = isCollapsed ? '80px' : '280px';
    }
  }, []);

  const NAVIGATION = [
    { name: "Tableau de bord", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, show: true },
    { name: "Utilisateurs", href: "/dashboard/users", icon: <Users className="w-5 h-5" />, show: hasPermission('Utilisateurs') },
    { name: "Rôles & Permissions", href: "/dashboard/roles-permissions", icon: <Shield className="w-5 h-5" />, show: hasPermission('Autorisation') },
    { name: "Historique", href: "/dashboard/historique", icon: <History className="w-5 h-5" />, show: true },
    { 
      name: "Souscriptions", 
      href: "/dashboard/subscriptions",
      icon: <CreditCard className="w-5 h-5" />,
      show: hasPermission('Souscriptions')
    },
    { name: "Dossiers", href: "/dashboard/dossiers", icon: <Folder className="w-5 h-5" />, show: true },
    { name: "Stock", href: "/dashboard/stock", icon: <Box className="w-5 h-5" />, show: hasPermission('Stock') },
    { name: "Catalogue", href: "/dashboard/catalogue", icon: <ShoppingCart className="w-5 h-5" />, show: hasPermission('Stock') },
    { name: "Communication", href: "/dashboard/communication", icon: <MessageSquare className="w-5 h-5" />, show: hasPermission('Communication') },
    { name: "Tâches", href: "/dashboard/tasks", icon: <CheckSquare className="w-5 h-5" />, show: hasPermission('Tâches') },
    { name: "Incidents", href: "/dashboard/incidents", icon: <AlertTriangle className="w-5 h-5" />, show: hasPermission('Incidents', 'Lecture') },
    { name: "Pointage", href: "/dashboard/time", icon: <Clock className="w-5 h-5" />, show: hasPermission('Temps') },
  ].filter(item => item.show);

  const NAVS_FOOTER = [
    { name: "Aide", href: "/dashboard/help", icon: <HelpCircle className="w-5 h-5" /> },
    { name: "Paramètres", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  // Find active module name
  const activeModule = NAVIGATION.find(item => location.pathname.startsWith(item.href)) || 
                        NAVS_FOOTER.find(item => location.pathname === item.href) ||
                        { name: "Tableau de bord" };

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <motion.nav
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 h-full z-[60]",
          // Mobile
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop
          "lg:translate-x-0"
        )}
      >
        {/* Background - Oriotel Dark Blue Gradient with Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1428C9] to-[#0F172A]" />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5" />
        
        {/* Border */}
        <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        {/* Mobile Close Button */}
        <button 
          onClick={onMobileClose}
          className="absolute top-6 right-4 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 lg:hidden"
        >
          <X size={22} />
        </button>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-24 z-10 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#1428C9] to-indigo-600 text-white shadow-lg hover:scale-110 transition-all duration-300"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="relative h-full flex flex-col">
          {/* Header with Logo */}
          <div className="px-6 py-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-transparent rounded-2xl blur opacity-30" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1428C9] to-indigo-600 flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-2xl">O</span>
                </div>
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col"
                  >
                    <span className="text-white font-bold text-lg tracking-tight">Oriotel</span>
                    <span className="text-blue-200 text-xs font-medium">ERP Suite</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Active Module Name */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6"
                >
                  <div className="flex items-center gap-2 text-blue-100">
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Module actif</span>
                  </div>
                  <h2 className="text-white font-bold text-xl mt-1">{activeModule.name}</h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
            {NAVIGATION.map((item, idx) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
              return (
                <div key={idx} className="relative group">
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-4 h-12 rounded-xl transition-all duration-300 group",
                      isActive
                        ? "bg-white/20 text-white shadow-lg shadow-black/10"
                        : "text-blue-100/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-gradient-to-r from-[#1428C9] to-indigo-600 text-white" 
                        : "group-hover:bg-white/10"
                    )}>
                      {item.icon}
                    </div>

                    {/* Label */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="font-semibold text-sm whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-r-full shadow-lg"
                      />
                    )}

                    {/* Tooltip - Only when collapsed */}
                    <AnimatePresence>
                      {isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-20 px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none hidden group-hover:block"
                        >
                          {item.name}
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-white/10 px-4 py-6 space-y-2">
            {NAVS_FOOTER.map((item, idx) => {
              const isActive = location.pathname === item.href;
              return (
                <div key={idx} className="relative group">
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-4 h-12 rounded-xl transition-all duration-300 group",
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-blue-100/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl">
                      {item.icon}
                    </div>

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="font-semibold text-sm whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute left-20 px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none hidden group-hover:block"
                        >
                          {item.name}
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </>
  );
});

export default Sidebar;
