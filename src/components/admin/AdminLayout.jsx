import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ToastProvider } from './Toast';
import { supabaseReady, checkConnection } from '@/lib/supabase';
import '../../routes/admin/admin.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [dismissBanner, setDismissBanner] = useState(false);

  useEffect(() => {
    if (!supabaseReady) {
      setBackendOnline(false);
      return;
    }
    checkConnection().then(r => setBackendOnline(r.ok));
  }, []);

  return (
    <ToastProvider>
      <div className="admin-layout">
        {!dismissBanner && !backendOnline && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: '#b91c1c', color: '#fff', padding: '10px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem',
          }}>
            <span>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
              Supabase backend not configured — set <code style={{ background: '#7f1d1d', padding: '2px 6px', borderRadius: 3 }}>VITE_SUPABASE_URL</code> and <code style={{ background: '#7f1d1d', padding: '2px 6px', borderRadius: 3 }}>VITE_SUPABASE_ANON_KEY</code> in <code style={{ background: '#7f1d1d', padding: '2px 6px', borderRadius: 3 }}>.env.local</code>
            </span>
            <button onClick={() => setDismissBanner(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
          </div>
        )}
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
