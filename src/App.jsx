import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './routes/Home';
import Properties from './routes/Properties';
import VirtualOffice from './routes/VirtualOffice';
import Careers from './routes/Careers';
import Blogs from './routes/Blogs';
import Contact from './routes/Contact';
import NotFound from './routes/NotFound';
// Subsidiaries
import Realty from './routes/subsidiaries/Realty';
import Construction from './routes/subsidiaries/Construction';
import SwiftClear from './routes/subsidiaries/SwiftClear';
import DynamicTree from './routes/subsidiaries/DynamicTree';
import LuxePrime from './routes/subsidiaries/LuxePrime';
import AltaVenture from './routes/subsidiaries/AltaVenture';
import Prime88 from './routes/subsidiaries/Prime88';
// Admin
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Login from './routes/admin/Login';
import AdminDashboard from './routes/admin/Dashboard';
import PropertiesManager from './routes/admin/PropertiesManager';
import Leads from './routes/admin/Leads';
import BlogManager from './routes/admin/BlogManager';
import CareerManager from './routes/admin/CareerManager';
import ChatbotTrainer from './routes/admin/ChatbotTrainer';
import Users from './routes/admin/Users';
import ActivityLog from './routes/admin/ActivityLog';
import Settings from './routes/admin/Settings';
import AdminNotFound from './routes/admin/NotFound';

export default function App() {
  return (
    <Routes>
      {/* === Public routes (unchanged) === */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="properties" element={<Properties />} />
        <Route path="virtual-office" element={<VirtualOffice />} />
        <Route path="careers" element={<Careers />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="about" element={<Navigate to="/" replace />} />
        <Route path="contact" element={<Contact />} />
        <Route path="subsidiaries/realty" element={<Realty />} />
        <Route path="subsidiaries/construction" element={<Construction />} />
        <Route path="subsidiaries/swiftclear" element={<SwiftClear />} />
        <Route path="subsidiaries/dynamic-tree" element={<DynamicTree />} />
        <Route path="subsidiaries/luxe-prime" element={<LuxePrime />} />
        <Route path="subsidiaries/alta-venture" element={<AltaVenture />} />
        <Route path="subsidiaries/88prime" element={<Prime88 />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* === Admin routes (separate layout, no public chrome) === */}
      <Route path="admin/login" element={
        <AuthProvider>
          <Login />
        </AuthProvider>
      } />
      <Route
        path="admin/*"
        element={
          <AuthProvider>
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          </AuthProvider>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="properties" element={<PropertiesManager />} />
        <Route path="leads" element={<Leads />} />
        <Route path="blogs" element={<BlogManager />} />
        <Route path="careers" element={<CareerManager />} />
        <Route path="chatbot" element={<ChatbotTrainer />} />
        <Route path="users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
    </Routes>
  );
}
