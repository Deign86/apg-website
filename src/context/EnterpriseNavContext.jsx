import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

const EnterpriseNavContext = createContext({
  currentPage: 'home',
  setCurrentPage: (_page) => {},
  registerNavigator: (_fn) => () => {},
  navigate: (_key) => false,
});

// EnterpriseShell (and this provider) stays mounted while the visitor moves between
// enterprises and their /inquire routes, so a navigator must be unregistered when its
// page unmounts — otherwise header/footer nav keeps calling the previous enterprise's
// dead setPage and does nothing.
export function EnterpriseNavProvider({ children }) {
  const [currentPage, setCurrentPageState] = useState('home');
  const navigatorRef = useRef(null);
  const pendingKeyRef = useRef(null);

  // Returns the unregister function; call sites return it from their effect.
  const registerNavigator = useCallback((fn) => {
    navigatorRef.current = fn;
    if (typeof window !== 'undefined') window.enterpriseNavigate = fn;
    const pending = pendingKeyRef.current;
    if (pending) {
      pendingKeyRef.current = null;
      fn(pending);
    }
    return () => {
      if (navigatorRef.current === fn) navigatorRef.current = null;
      if (typeof window !== 'undefined' && window.enterpriseNavigate === fn) window.enterpriseNavigate = undefined;
    };
  }, []);

  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      window.enterpriseCurrentPage = page;
    }
  }, []);

  // Returns false when no enterprise page is mounted (e.g. on /subsidiaries/<x>/inquire);
  // the key is then handed to the next navigator that registers, so the caller can
  // route to the enterprise home and land on the requested section.
  const navigate = useCallback((key) => {
    const fn = navigatorRef.current
      ?? (typeof window !== 'undefined' && typeof window.enterpriseNavigate === 'function' ? window.enterpriseNavigate : null);
    if (fn) {
      fn(key);
      return true;
    }
    pendingKeyRef.current = key;
    return false;
  }, []);

  const value = useMemo(() => ({
    currentPage,
    setCurrentPage,
    registerNavigator,
    navigate,
  }), [currentPage, setCurrentPage, registerNavigator, navigate]);

  return (
    <EnterpriseNavContext.Provider value={value}>
      {children}
    </EnterpriseNavContext.Provider>
  );
}

export function useEnterpriseNav() {
  return useContext(EnterpriseNavContext);
}
