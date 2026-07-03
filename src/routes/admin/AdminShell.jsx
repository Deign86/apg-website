import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import Login from './Login';
import Dashboard from './Dashboard';
import PropertiesManager from './PropertiesManager';
import Leads from './Leads';
import BlogManager from './BlogManager';
import CareerManager from './CareerManager';
import ChatbotTrainer from './ChatbotTrainer';
import Users from './Users';
import ActivityLog from './ActivityLog';
import Settings from './Settings';
import NotFound from './NotFound';

export default function AdminShell() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<PropertiesManager />} />
          <Route path="leads" element={<Leads />} />
          <Route path="blogs" element={<BlogManager />} />
          <Route path="careers" element={<CareerManager />} />
          <Route path="chatbot" element={<ChatbotTrainer />} />
          <Route path="users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
