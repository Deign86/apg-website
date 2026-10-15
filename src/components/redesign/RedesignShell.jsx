import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useSiteNavigate } from '../../hooks/useSiteNavigate';
import { hostEnterprise } from '../../lib/enterpriseHost';
import ErrorBoundary from '../ErrorBoundary';
import { UnifiedLuxuryBackground } from './UnifiedLuxuryBackground';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { InquireModal } from './InquireModal';
import { BlogDetailModal } from './BlogDetailModal';
import { AlphaAssistant } from './AlphaAssistant';

import { Helmet } from 'react-helmet-async';
import Seo, { ORGANIZATION_JSONLD, WEBSITE_JSONLD } from '../Seo';

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

/**
 * Sits beside the views inside their Suspense boundary, so its effect runs once the current view
 * has rendered: the other views are then fetched in idle time and tab switches don't wait on the
 * network. Skipped on the Virtual Office subdomain, whose apex links are full page loads.
 */
function PrefetchViews() {
  useEffect(() => {
    if (hostEnterprise()) return undefined;
    const prefetch = () => Object.values(VIEW_LOADERS).forEach((load) => load().catch(() => {}));
    if (!window.requestIdleCallback) {
      const timer = setTimeout(prefetch, 1000);
      return () => clearTimeout(timer);
    }
    const id = window.requestIdleCallback(prefetch, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }, []);
  return null;
}

// Derive currentTab from path
const getTabFromPath = (path) => {
  if (path === '/') return 'home';
  if (path.startsWith('/enterprises')) return 'enterprises';
  if (path.startsWith('/careers')) return 'careers';
  if (path.startsWith('/blogs')) return 'blogs';
  if (path.startsWith('/inquire')) return 'inquire';
  // Dedicated outlet pages — do not render home tab on top of Outlet
  if (path.startsWith('/virtual-office') || path.startsWith('/contact') || path.startsWith('/properties') || path.startsWith('/privacy') || path.startsWith('/terms')) {
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

  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Route changes (incl. Back/Forward) must not leave a modal over the new page.
  useEffect(() => {
    setInquireModalOpen(false);
    setBlogModalOpen(false);
  }, [location.pathname]);

  const handleOpenInquire = (enterpriseName) => {
    if (enterpriseName) {
      setInquireEnterprise(enterpriseName);
      setInquireModalOpen(true);
    } else {
      navigate('/inquire');
    }
  };

  // The open article lives in the URL (/blogs?post=<slug>) so it can be shared and a refresh
  // reopens it; closing removes it. replace: the reader is an overlay, not a new history step.
  const handleSelectBlogPost = (post) => {
    setSelectedPost(post);
    setBlogModalOpen(true);
    if (location.pathname.startsWith('/blogs')) {
      navigate(`/blogs?post=${encodeURIComponent(post.slug || String(post.id))}`, { replace: true });
    }
  };

  const handleCloseBlogPost = () => {
    setBlogModalOpen(false);
    if (location.pathname.startsWith('/blogs') && new URLSearchParams(location.search).has('post')) {
      navigate('/blogs', { replace: true });
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
    careers: { path: '/careers', title: 'Careers | Alpha Premier Group', description: 'Explore job openings across Alpha Premier Group companies in real estate, construction, facility services, outsourcing, and more. Apply online.' },
    inquire: { path: '/inquire', title: 'Inquire | Alpha Premier Group', description: 'Contact Alpha Premier Group in Ortigas Center, Pasig City. Send an inquiry or schedule a consultation with any of our enterprises.' },
  };
  const seo = seoMap[currentTab];

  return (
    <div className="min-h-screen relative overflow-x-hidden text-neutral-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-neutral-950 bg-[#0A0803]">
      {seo && <Seo {...seo} />}
      <Helmet>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Helmet>
      {blogModalOpen && selectedPost?.title && (
        <Helmet><title>{`${selectedPost.title} | Alpha Premier Group`}</title></Helmet>
      )}

      {/* Dynamic Animated Premium Black & Gold Background System */}
      <UnifiedLuxuryBackground currentTab={currentTab} />

      {/* Top Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleTabChange}
        onOpenInquire={() => handleOpenInquire()}
      />

      {/* Primary Page Content */}
      <main className="flex-1 relative z-10 pt-20">
        {/* A page crash keeps the navbar/footer so visitors can navigate away. */}
        <ErrorBoundary resetKey={location.pathname}>
          {/* While a first view loads, hold the viewport so the footer doesn't show and then jump. */}
          <Suspense fallback={<div className="min-h-screen" />}>
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
              <BlogsView
                onSelectPost={handleSelectBlogPost}
              />
            )}

            {currentTab === 'careers' && (
              <CareersView />
            )}

            {currentTab === 'inquire' && (
              <InquireView />
            )}

            <Outlet />
            <PrefetchViews />
          </Suspense>
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

      {/* Blog Article Reader Modal */}
      <BlogDetailModal
        post={selectedPost}
        isOpen={blogModalOpen}
        onClose={handleCloseBlogPost}
        onOpenInquire={() => handleOpenInquire()}
      />
    </div>
  );
}
