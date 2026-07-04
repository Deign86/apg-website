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
          <Route index element={<ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="properties" element={<PropertiesManager />} />
          <Route path="leads" element={<ProtectedRoute requiredRole="admin"><Leads /></ProtectedRoute>} />
          <Route path="blogs" element={<BlogManager />} />
          <Route path="careers" element={<CareerManager />} />
          <Route path="chatbot" element={<ChatbotTrainer />} />
          <Route path="users" element={<ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>} />
          <Route path="activity" element={<ProtectedRoute requiredRole="admin"><ActivityLog /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
