import { createContext, useContext, useMemo } from 'react';

// EnterpriseNavContext — the bridge that lets a shared EnterpriseHeader / EnterpriseFooter
// (rendered OUTSIDE the Figma app) trigger the Figma app's internal "navigate" function
// without coupling the components to Figma-app-specific state shapes.
//
// The mounted Figma app will wrap its body in <EnterpriseNavProvider value={navigateFn}>.
// The header/footer will call useEnterpriseNav() -> "navigate('home')" etc.

export const EnterpriseNavContext = createContext({
  // The Figma apps have a fixed enum of pages. Defaults to a null function.
  navigate: () => { /* no-op until provider mounts */ },
  currentPage: null,
});

export function EnterpriseNavProvider({ navigate, currentPage, children }) {
  const value = useMemo(() => ({ navigate, currentPage }), [navigate, currentPage]);
  return (
    <EnterpriseNavContext.Provider value={value}>
      {children}
    </EnterpriseNavContext.Provider>
  );
}

export function useEnterpriseNav() {
  return useContext(EnterpriseNavContext);
}
