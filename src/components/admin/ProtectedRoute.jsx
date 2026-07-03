import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  if (!profile?.active) {
    return (
      <div className="admin-page admin-error-page">
        <i className="fa-solid fa-lock" style={{ fontSize: 48, color: '#c5a059' }} />
        <h1>Account Disabled</h1>
        <p>Your account has been deactivated. Contact an administrator.</p>
      </div>
    );
  }

  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'owner') {
    return (
      <div className="admin-page admin-error-page">
        <i className="fa-solid fa-shield-halved" style={{ fontSize: 48, color: '#c5a059' }} />
        <h1>Access Denied</h1>
        <p>You need the <strong>{requiredRole}</strong> role to access this page.</p>
      </div>
    );
  }

  return children;
}
