import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth.php?action=check', {
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    let res;
    let data;
    try {
      res = await fetch('/api/admin/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      data = await res.json().catch(() => ({}));
    } catch {
      throw new Error('Unable to connect to authentication server. Please try again.');
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid email or password.');
    }
    setUser(data.user);
    return data.user;
  };

  const signOut = async () => {
    try {
      await fetch('/api/admin/auth.php?action=logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
    }
  };

  const hasRole = () => !!user;

  return (
    <AuthContext.Provider value={{ user, session: user ? { user } : null, profile: user, loading, signIn, signOut, hasRole, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
