import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AOS from 'aos';
import EnterpriseHeader from './EnterpriseHeader';
import EnterpriseFooter from './EnterpriseFooter';
import EnterpriseChatbot from './EnterpriseChatbot';
import { EnterpriseNavProvider } from '../context/EnterpriseNavContext';

// EnterpriseShell — the shared layout for all /subsidiaries/* routes.
// Renders EnterpriseHeader (per-enterprise logo + nav from config) at top,
// <Outlet /> for the enterprise body, EnterpriseFooter at bottom, and EnterpriseChatbot.

export default function EnterpriseShell() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refresh();
    setTimeout(() => {
      window.dispatchEvent(new Event('scroll'));
    }, 50);
  }, [pathname]);

  return (
    <EnterpriseNavProvider>
      <EnterpriseHeader />
      <main>
        <Outlet />
      </main>
      <EnterpriseFooter />
      <EnterpriseChatbot />
    </EnterpriseNavProvider>
  );
}