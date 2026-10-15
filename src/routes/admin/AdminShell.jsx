import React, { lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import { roleCan } from '@/data/permissions';
import Login from './Login';
import Dashboard from './Dashboard';
import NotFound from './NotFound';
import './admin.css';

// Sign-in and the dashboard ship with the shell; each manager screen is its own chunk, so the
// auth check starts without downloading every screen first.
const screens = {
  content: () => import('./ContentEditor'),
  services: () => import('./ServicesManager'),
  blogs: () => import('./BlogManager'),
  careers: () => import('./CareerManager'),
  applicants: () => import('./ApplicantsManager'),
  chat: () => import('./LiveChat'),
  users: () => import('./UsersManager'),
  listings: () => import('./ListingsManager'),
  inquiries: () => import('./InquiriesManager'),
};
const ContentEditor = lazy(screens.content);
const ServicesManager = lazy(screens.services);
const BlogManager = lazy(screens.blogs);
const CareerManager = lazy(screens.careers);
const ApplicantsManager = lazy(screens.applicants);
const LiveChat = lazy(screens.chat);
const UsersManager = lazy(screens.users);
const ListingsManager = lazy(screens.listings);
const InquiriesManager = lazy(screens.inquiries);

/** Once signed in and the browser is idle, loads the screens this role may open, so they open instantly. */
function PrefetchScreens() {
  const role = useAuth().user?.role;
  useEffect(() => {
    const warm = () => Object.entries(screens).forEach(([capability, load]) => { if (roleCan(role, capability)) load().catch(() => {}); });
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 2000);
    return () => clearTimeout(id);
  }, [role]);
  return null;
}

/** Sends a role without the capability back to the dashboard instead of a page that can only 403. */
function RequireCapability({ capability, children }) {
  const { can } = useAuth();
  return can(capability) ? children : <Navigate to="/admin" replace />;
}

export default function AdminShell() {
  return (
    <div className="admin-root">
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute><PrefetchScreens /><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="live-chat" element={<RequireCapability capability="chat"><LiveChat /></RequireCapability>} />
          <Route path="content" element={<RequireCapability capability="content"><ContentEditor /></RequireCapability>} />
          <Route path="services" element={<RequireCapability capability="services"><ServicesManager /></RequireCapability>} />
          <Route path="careers" element={<RequireCapability capability="careers"><CareerManager /></RequireCapability>} />
          <Route path="applicants" element={<RequireCapability capability="applicants"><ApplicantsManager /></RequireCapability>} />
          <Route path="blogs" element={<RequireCapability capability="blogs"><BlogManager /></RequireCapability>} />
          <Route path="users" element={<RequireCapability capability="users"><UsersManager /></RequireCapability>} />
          <Route path="listings" element={<RequireCapability capability="listings"><ListingsManager /></RequireCapability>} />
          <Route path="inquiries" element={<RequireCapability capability="inquiries"><InquiriesManager /></RequireCapability>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
    </div>
  );
}
