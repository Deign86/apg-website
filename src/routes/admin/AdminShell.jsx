import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import Login from './Login';
import Dashboard from './Dashboard';
import ContentEditor from './ContentEditor';
import ServicesManager from './ServicesManager';
import BlogManager from './BlogManager';
import CareerManager from './CareerManager';
import NotFound from './NotFound';

export default function AdminShell() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="content" element={<ContentEditor />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="careers" element={<CareerManager />} />
          <Route path="blogs" element={<BlogManager />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
