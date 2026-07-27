import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import AltaVentureApp from './alta-venture/app/App';
import './alta-venture/styles/index.css';

// AltaVenture — renders the Alta Venture page body inside the shared
// <EnterpriseShell> wrapper (which provides EnterpriseHeader +
// EnterpriseFooter + EnterpriseChatbot, all driven by the per-enterprise
// config in src/data/enterpriseConfig.js).
//
// Internal page state (home | services | blogs | careers | inquire) is
// managed here. To allow the shared EnterpriseHeader/Footer (rendered as
// siblings of <Outlet/> in EnterpriseShell, not children of this component)
// to drive the AV body's page switching, we expose the navigate function
// via window.enterpriseNavigate and the current page via
// window.enterpriseCurrentPage. EnterpriseHeader/Footer call
// window.enterpriseNavigate(key) on click.

export default function AltaVenture() {
  const [page, setPage] = useState('home');

  const navigate = useCallback((p) => {
    setPage(p);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.enterpriseNavigate = navigate;
      window.enterpriseCurrentPage = page;
    }
    return () => {
      if (typeof window !== 'undefined') {
        if (window.enterpriseNavigate === navigate) window.enterpriseNavigate = undefined;
        if (window.enterpriseCurrentPage === page) window.enterpriseCurrentPage = undefined;
      }
    };
  }, [navigate, page]);

  return (
    <>
      <Helmet>
        <title>Alta Venture | Alpha Premier</title>
        <meta
          name="description"
          content="Alta Venture Outsourcing — premier BPO services, fractional CFO, talent & HR, IT, customer experience, back-office operations, and risk & compliance solutions for growing businesses."
        />
      </Helmet>
      <AltaVentureApp page={page} setPage={navigate} />
    </>
  );
}
