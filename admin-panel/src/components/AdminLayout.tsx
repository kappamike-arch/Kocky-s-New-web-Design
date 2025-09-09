'use client';

import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Listen for sidebar state changes
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarOpen');
      setSidebarOpen(savedState !== 'false');
    };

    // Check initial state
    checkSidebarState();

    // Listen for storage changes
    window.addEventListener('storage', checkSidebarState);
    
    // Custom event for same-window updates
    window.addEventListener('sidebarToggle', checkSidebarState);

    return () => {
      window.removeEventListener('storage', checkSidebarState);
      window.removeEventListener('sidebarToggle', checkSidebarState);
    };
  }, []);

  return (
    <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
      {/* Top Security Banner */}
      <div className="admin-status admin-status-error text-center py-2 text-sm sticky top-0 z-30">
        🔒 SECURE ADMIN AREA - All Actions Are Logged
      </div>
      {/* Page Content */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
