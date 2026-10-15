import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import EnterpriseHeader from './EnterpriseHeader';
import EnterpriseFooter from './EnterpriseFooter';
import EnterpriseChatbot from './EnterpriseChatbot';
import { EnterpriseNavProvider } from '../context/EnterpriseNavContext';
import ErrorBoundary from './ErrorBoundary';

// EnterpriseShell — the shared layout for all /subsidiaries/* routes.
// Renders EnterpriseHeader (per-enterprise logo + nav from config) at top,
// <Outlet /> for the enterprise body, EnterpriseFooter at bottom, and EnterpriseChatbot.

export default function EnterpriseShell() {
  const { pathname } = useLocation();

  // Every new page/section opens at its top, before it paints: no animated scroll through it.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <EnterpriseNavProvider>
      <EnterpriseHeader />
      <main>
        {/* A crash in one enterprise page keeps the header/footer so visitors can navigate away. */}
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <EnterpriseFooter />
      <EnterpriseChatbot />
    </EnterpriseNavProvider>
  );
}
