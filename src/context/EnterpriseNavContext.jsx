import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const EnterpriseNavContext = createContext({
  currentPage: 'home',
  setCurrentPage: () => {},
  registerNavigator: () => {},
  navigate: () => {},
});

export function EnterpriseNavProvider({ children }) {
  const [currentPage, setCurrentPageState] = useState('home');
  const [navigatorFn, setNavigatorFn] = useState(null);

  const registerNavigator = useCallback((fn) => {
    setNavigatorFn(() => fn);
    if (typeof window !== 'undefined') {
      window.enterpriseNavigate = fn;
    }
  }, []);

  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      window.enterpriseCurrentPage = page;
    }
  }, []);

  const navigate = useCallback((key) => {
    if (typeof navigatorFn === 'function') {
      navigatorFn(key);
    } else if (typeof window !== 'undefined' && typeof window.enterpriseNavigate === 'function') {
      window.enterpriseNavigate(key);
    }
  }, [navigatorFn]);

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
