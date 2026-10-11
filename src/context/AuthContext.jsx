import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { roleCan } from '@/data/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set when a signed-in admin's session dies server-side; the login page shows it.
  const [sessionExpired, setSessionExpired] = useState(false);
  const userRef = useRef(null);
  userRef.current = user;

  // Session expiry, handled once for every admin screen: a 401 from any /api/admin/ endpoint
  // while signed in means the PHP session is gone (timed out, signed out by a password change,
  // account removed). Drop the user; ProtectedRoute then redirects to /admin/login.
  // A failed sign-in also answers 401, but no one is signed in then, so it is ignored.
  useEffect(() => {
    const nativeFetch = window.fetch;
    window.fetch = async (input, init) => {
      const res = await nativeFetch(input, init);
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (res.status === 401 && userRef.current && new URL(url, window.location.href).pathname.startsWith('/api/admin/')) {
        userRef.current = null;
        setSessionExpired(true);
        setUser(null);
      }
      return res;
    };
    return () => {
      window.fetch = nativeFetch;
    };
  }, []);

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
    setSessionExpired(false);
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

  const can = (capability) => roleCan(user?.role, capability);

  return (
    <AuthContext.Provider value={{ user, session: user ? { user } : null, profile: user, loading, sessionExpired, signIn, signOut, hasRole, can, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
