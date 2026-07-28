// src/layouts/MainLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className='flex flex-col h-screen overflow-hidden bg-gray-50'>
      {/* 1. Navbar gets the trigger to open sidebar */}
      <Navbar onToggleSidebar={toggleMobileSidebar} />

      <div className='flex flex-1 overflow-hidden relative'>
        {/* 2. Sidebar gets the state and close function */}
        <Sidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

        {/* 3. Main Outlet container */}
        <main className='flex-1 overflow-y-auto no-scrollbar p-4 md:p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
