import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import Login from './Login';
import Dashboard from './Dashboard';
import ContentEditor from './ContentEditor';
import ServicesManager from './ServicesManager';
import BlogManager from './BlogManager';
import CareerManager from './CareerManager';
import ApplicantsManager from './ApplicantsManager';
import LiveChat from './LiveChat';
import UsersManager from './UsersManager';
import ListingsManager from './ListingsManager';
import InquiriesManager from './InquiriesManager';
import NotFound from './NotFound';
import './admin.css';

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
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
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
