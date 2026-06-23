import { useState, useCallback, useEffect } from 'react';
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
