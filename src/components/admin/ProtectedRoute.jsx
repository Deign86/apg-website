import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="admin-loading-screen bg-[#0A0803] text-neutral-100"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <div className="w-full max-w-sm space-y-4" aria-busy="true">
          <div className="h-4 w-2/3 animate-pulse rounded-xl bg-neutral-800" />
          <div className="h-4 w-1/2 animate-pulse rounded-xl bg-neutral-800" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-800" />
        </div>
        <p className="text-sm tracking-widest uppercase text-[#E2B857]">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
