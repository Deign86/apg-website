import React, { lazy, useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useSiteNavigate } from '../../hooks/useSiteNavigate';
import { hostEnterprise } from '../../lib/enterpriseHost';
import ErrorBoundary from '../ErrorBoundary';
import { UnifiedLuxuryBackground } from './UnifiedLuxuryBackground';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { InquireModal } from './InquireModal';
import { AlphaAssistant } from './AlphaAssistant';

import { Helmet } from 'react-helmet-async';
import Seo, { ORGANIZATION_JSONLD, WEBSITE_JSONLD } from '../Seo';
import { CAREERS_SEO, jobIdFromPath } from '../../lib/jobSeo';

// Each view is its own chunk; App.jsx starts the current one together with this shell.
const VIEW_LOADERS = {
  home: () => import('../../views/HomeView'),
  enterprises: () => import('../../views/EnterprisesView'),
  careers: () => import('../../views/CareersView'),
  blogs: () => import('../../views/BlogsView'),
  inquire: () => import('../../views/InquireView'),
};
const HomeView = lazy(() => VIEW_LOADERS.home().then((m) => ({ default: m.HomeView })));
const EnterprisesView = lazy(() => VIEW_LOADERS.enterprises().then((m) => ({ default: m.EnterprisesView })));
const CareersView = lazy(() => VIEW_LOADERS.careers().then((m) => ({ default: m.CareersView })));
const BlogsView = lazy(() => VIEW_LOADERS.blogs().then((m) => ({ default: m.BlogsView })));
const InquireView = lazy(() => VIEW_LOADERS.inquire().then((m) => ({ default: m.InquireView })));

/** Starts loading a tab's view ahead of the click (nav hover, touch or focus). */
const prefetchView = (tab) => { VIEW_LOADERS[tab]?.().catch(() => {}); };

/**
 * Once the page has fully loaded, fetches the other views one per idle period, so later tab
 * switches don't wait on the network while the current page's images and first interactions never
 * compete with them. Skipped on the Virtual Office subdomain, whose apex links are full page loads.
 */
function PrefetchViews() {
  useEffect(() => {
    if (hostEnterprise()) return undefined;
    const idle = window.requestIdleCallback ? (cb) => window.requestIdleCallback(cb, { timeout: 5000 }) : (cb) => setTimeout(cb, 500);
    const queue = Object.values(VIEW_LOADERS);
    let stopped = false;
    const next = () => {
      const load = queue.shift();
      if (!stopped && load) load().catch(() => {}).finally(() => idle(next));
    };
    const start = () => idle(next);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      stopped = true;
      window.removeEventListener('load', start);
    };
  }, []);
  return null;
}

/** A blog article's own page, the `blogs/:slug` route in App.jsx. */
const BLOG_ARTICLE_PATH = /^\/blogs\/[^/]+\/?$/;

// Derive currentTab from path
const getTabFromPath = (path) => {
  if (path === '/') return 'home';
  if (path.startsWith('/enterprises')) return 'enterprises';
  if (path.startsWith('/careers')) return 'careers';
  if (path.startsWith('/blogs')) return 'blogs';
  if (path.startsWith('/inquire')) return 'inquire';
  // Dedicated outlet pages — do not render home tab on top of Outlet
  if (path.startsWith('/virtual-office') || path.startsWith('/contact') || path.startsWith('/pay') || path.startsWith('/properties') || path.startsWith('/privacy') || path.startsWith('/terms')) {
    return null;
  }
  return 'home';
};

export default function RedesignShell() {
  const location = useLocation();
  const navigate = useSiteNavigate();

  // From the URL, not state: a tab click then arrives with the router's navigation transition, so a
  // view whose chunk is still loading keeps the current view on screen instead of blanking <main>.
  const currentTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab) => {
    if (tab === 'home') navigate('/');
    else navigate(`/${tab}`);
  };

  // Modals state
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [inquireEnterprise, setInquireEnterprise] = useState(undefined);

  // Route changes (incl. Back/Forward) must not leave a modal over the new page.
  useEffect(() => {
    setInquireModalOpen(false);
  }, [location.pathname]);

  const handleOpenInquire = (enterpriseName) => {
    if (enterpriseName) {
      setInquireEnterprise(enterpriseName);
      setInquireModalOpen(true);
    } else {
      navigate('/inquire');
    }
  };

  const handleSelectEnterprise = (enterprise) => {
    const slugMap = {
      'realty': '/subsidiaries/realty',
      'luxe-prime': '/subsidiaries/luxe-prime',
      'swift-clear': '/subsidiaries/swiftclear',
      'swiftclear': '/subsidiaries/swiftclear',
      'dynamic-tree': '/subsidiaries/dynamic-tree',
      'alta-venture': '/subsidiaries/alta-venture',
      'construction': '/subsidiaries/construction',
      '88-prime': '/subsidiaries/88prime',
      '88prime': '/subsidiaries/88prime',
    };

    if (slugMap[enterprise.id]) {
      navigate(slugMap[enterprise.id]);
    } else {
      navigate('/enterprises');
    }
  };

  // Per-tab metadata; outlet pages (properties, contact, legal, virtual-office) set their own.
  const seoMap = {
    home: { path: '/', title: 'Alpha Premier Group of Companies | Pasig City, Philippines', description: 'Alpha Premier Group is a Philippine business group in Ortigas Center, Pasig: real estate, construction, facility services, talent, outsourcing, and trading.', jsonLd: [ORGANIZATION_JSONLD, WEBSITE_JSONLD] },
    enterprises: { path: '/enterprises', title: 'Our Enterprises | Alpha Premier Group', description: 'Meet the Alpha Premier Group companies: Alpha Premier Realty, Luxe Prime, Construction, SwiftClear, 88 Prime, Alta Venture, Dynamic Tree and Virtual Office.' },
    blogs: { path: '/blogs', title: 'Blogs & News | Alpha Premier Group', description: 'News, real estate insights, and company updates from Alpha Premier Group of Companies and its enterprises.' },
    careers: CAREERS_SEO,
    inquire: { path: '/inquire', title: 'Inquire | Alpha Premier Group', description: 'Contact Alpha Premier Group in Ortigas Center, Pasig City. Send an inquiry or schedule a consultation with any of our enterprises.' },
  };
  // A job opening's own page (/careers/39-marketing-intern) sets its own metadata (views/JobView),
  // as does a blog article's (/blogs/<slug>, views/BlogsView).
  const seo = jobIdFromPath(location.pathname) || BLOG_ARTICLE_PATH.test(location.pathname) ? null : seoMap[currentTab];

  return (
    <div className="min-h-screen relative overflow-x-hidden text-neutral-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-neutral-950 bg-[#0A0803]">
      {seo && <Seo {...seo} />}
      <Helmet>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Helmet>

      {/* Dynamic Animated Premium Black & Gold Background System */}
      <UnifiedLuxuryBackground currentTab={currentTab} />

      {/* Top Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleTabChange}
        onIntent={prefetchView}
        onOpenInquire={() => handleOpenInquire()}
      />

      {/* Primary Page Content */}
      <main className="flex-1 relative z-10 pt-20">
        {/* A page crash keeps the navbar/footer so visitors can navigate away. */}
        <ErrorBoundary resetKey={location.pathname}>
          {/* A view still loading suspends into App's boundary: the previous page stays on screen
              until shell and view are both ready (App.jsx starts the view with the shell). */}
          {currentTab === 'home' && (
            <HomeView
              onNavigate={handleTabChange}
              onOpenInquire={handleOpenInquire}
              onSelectEnterprise={handleSelectEnterprise}
            />
          )}

          {currentTab === 'enterprises' && (
            <EnterprisesView
              onOpenInquire={handleOpenInquire}
            />
          )}

          {currentTab === 'blogs' && (
            <BlogsView />
          )}

          {currentTab === 'careers' && (
            <CareersView />
          )}

          {currentTab === 'inquire' && (
            <InquireView />
          )}

          <Outlet />
          <PrefetchViews />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleTabChange}
        onOpenInquire={() => handleOpenInquire()}
      />

      {/* Floating AI Assistant Concierge */}
      <AlphaAssistant onOpenInquire={handleOpenInquire} />

      {/* Inquire & Consultation Modal */}
      <InquireModal
        isOpen={inquireModalOpen}
        onClose={() => setInquireModalOpen(false)}
        defaultEnterprise={inquireEnterprise}
      />
    </div>
  );
}
