import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ToastProvider } from './Toast';
import '../../routes/admin/admin.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div
        className="admin-layout bg-[#0A0803] text-neutral-100"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main">
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
