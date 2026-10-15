import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ToastProvider } from './Toast';
import '../../routes/admin/admin.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="admin-layout bg-[#0A0803]">
        {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main">
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="admin-content">
            {/* Screens load as separate chunks: the sidebar and top bar stay while one arrives. */}
            <Suspense fallback={<div className="listings-loading" role="status"><div className="admin-spinner" aria-hidden="true" /><span className="sr-only">Loading…</span></div>}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
