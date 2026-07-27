import { useEffect } from 'react';
import Home from './pages/Home';
import Services from './pages/Services';
import Blogs from './pages/Blogs';
import Careers from './pages/Careers';
import Inquire from './pages/Inquire';

/**
 * Alta Venture body.
 *
 * Sits inside the shared <EnterpriseShell>. Receives `page` ("home" |
 * "services" | "blogs" | "careers" | "inquire") and `setPage` from the
 * parent (AltaVenture.jsx route component), which in turn exposes them
 * on window.enterpriseNavigate / window.enterpriseCurrentPage so the
 * shared EnterpriseHeader's nav clicks drive this internal page switch.
 *
 * On-page navigation (hero "Get Started", card "Explore", CTA "Get started
 * today") calls onNavigate('services') / onNavigate('inquire') — provided
 * by this App via the `handleNavigate` closure that wraps `setPage`.
 */
export default function AltaVentureApp({ page = 'home', setPage }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  const handleNavigate = (target) => {
    if (typeof setPage === 'function') setPage(target);
  };

  const renderPage = () => {
    switch (page) {
      case 'services': return <Services onNavigate={handleNavigate} />;
      case 'blogs':    return <Blogs    onNavigate={handleNavigate} />;
      case 'careers':  return <Careers  onNavigate={handleNavigate} />;
      case 'inquire':  return <Inquire  onNavigate={handleNavigate} />;
      case 'home':
      default:         return <Home     onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="alta-venture-scope">
      {renderPage()}
    </div>
  );
}
