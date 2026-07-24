import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import EnterpriseHeader from './EnterpriseHeader';
import EnterpriseFooter from './EnterpriseFooter';
import EnterpriseChatbot from './EnterpriseChatbot';

// EnterpriseShell — the shared layout for all /subsidiaries/* routes.
// Renders EnterpriseHeader (per-enterprise logo + nav from config) at top,
// <Outlet /> for the enterprise body, EnterpriseFooter at bottom, and EnterpriseChatbot.

export default function EnterpriseShell() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <EnterpriseHeader />
      <main>
        <Outlet />
      </main>
      <EnterpriseFooter />
      <EnterpriseChatbot />
    </>
  );
}