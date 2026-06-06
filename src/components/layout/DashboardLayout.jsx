import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar Component (Mobile & Desktop) */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
