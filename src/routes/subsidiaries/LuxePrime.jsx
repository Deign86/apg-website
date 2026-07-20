import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import FigmaApp from './luxe-prime/app/App';
import './luxe-prime/styles/index.css';

// LuxePrime — renders the Figma Make export inside the shared <EnterpriseShell> wrapper
// (which provides EnterpriseHeader + EnterpriseFooter). The Figma app's internal page
// state is managed here. To allow EnterpriseHeader/Footer to trigger navigation from
// outside the Figma tree (they are siblings of Outlet in EnterpriseShell, not children
// of this component), we expose the navigate function via window.enterpriseNavigate.
// EnterpriseHeader/Footer call window.enterpriseNavigate(key) on click.
//
// Why window and not React context: EnterpriseHeader and EnterpriseFooter live ABOVE
// us in the tree (rendered by EnterpriseShell as siblings to <Outlet/>). Wrapping with
// a provider here would not reach them. Either lift state up to EnterpriseShell (couples
// it to each enterprise's navigation shape) or use a global side-channel (window).
// The latter is the minimum-effort bridge that keeps EnterpriseShell enterprise-agnostic.

export default function LuxePrime() {
  const [page, setPage] = useState('home');

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const navigate = useCallback((p) => {
    setPage(p);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Expose navigate + current page to EnterpriseHeader/Footer via a global side channel.
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
        <title>Luxe Prime | Alpha Premier</title>
        <meta
          name="description"
          content="Luxe Prime Realty — where prestige meets practicality. Co-managed subleasing, end-to-end property administration, and tailored leasing strategies."
        />
      </Helmet>
      <FigmaApp page={page} setPage={navigate} />
    </>
  );
}
