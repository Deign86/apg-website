import { Outlet } from 'react-router-dom';
import EnterpriseHeader from './EnterpriseHeader';
import EnterpriseFooter from './EnterpriseFooter';

// EnterpriseShell — the shared layout for all /subsidiaries/* routes.
// Renders EnterpriseHeader (per-enterprise logo + nav from config) at top,
// <Outlet /> for the enterprise body, and EnterpriseFooter at bottom.

// Communication: EnterpriseHeader/Footer navigate by calling
// window.enterpriseNavigate(key) — set by the mounted enterprise child via useEffect.
// The child reads/clears it on its own mount/unmount. EnterpriseShell itself is
// enterprise-agnostic and does NOT need to know what pages each enterprise has.

export default function EnterpriseShell() {
  return (
    <>
      <EnterpriseHeader />
      <main>
        <Outlet />
      </main>
      <EnterpriseFooter />
    </>
  );
}