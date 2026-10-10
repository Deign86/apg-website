import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { UnifiedLuxuryBackground } from './UnifiedLuxuryBackground';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { InquireModal } from './InquireModal';
import { JobApplyModal } from './JobApplyModal';
import { BlogDetailModal } from './BlogDetailModal';
import { AlphaAssistant } from './AlphaAssistant';

import { Helmet } from 'react-helmet-async';
import Seo, { ORGANIZATION_JSONLD, WEBSITE_JSONLD } from '../Seo';
import { HomeView } from '../../views/HomeView';
import { EnterprisesView } from '../../views/EnterprisesView';
import { CareersView } from '../../views/CareersView';
import { BlogsView } from '../../views/BlogsView';
import { InquireView } from '../../views/InquireView';

export default function RedesignShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive currentTab from path
  const getTabFromPath = (path) => {
    if (path === '/') return 'home';
    if (path.startsWith('/enterprises')) return 'enterprises';
    if (path.startsWith('/careers')) return 'careers';
    if (path.startsWith('/blogs')) return 'blogs';
    if (path.startsWith('/inquire')) return 'inquire';
    if (path.startsWith('/properties')) return 'properties';
    // Dedicated outlet pages — do not render home tab on top of Outlet
    if (path.startsWith('/virtual-office') || path.startsWith('/contact') || path.startsWith('/privacy') || path.startsWith('/terms')) {
      return null;
    }
    return 'home';
  };

  const [currentTab, setCurrentTab] = useState(() => getTabFromPath(location.pathname));

  // Modal state is declared below; route changes (incl. Back/Forward) must not leave a modal over the new page.
  useEffect(() => {
    setCurrentTab(getTabFromPath(location.pathname));
    setInquireModalOpen(false);
    setJobModalOpen(false);
    setBlogModalOpen(false);
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (tab === 'home') navigate('/');
    else navigate(`/${tab}`);
  };

  // Modals state
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [inquireEnterprise, setInquireEnterprise] = useState(undefined);

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleOpenInquire = (enterpriseName) => {
    if (enterpriseName) {
      setInquireEnterprise(enterpriseName);
      setInquireModalOpen(true);
    } else {
      navigate('/inquire');
    }
  };

  const handleApplyJob = (job) => {
    setSelectedJob(job);
    setJobModalOpen(true);
  };

  const handleGeneralApply = () => {
    setSelectedJob(null);
    setJobModalOpen(true);
  };

  const handleSelectBlogPost = (post) => {
    setSelectedPost(post);
    setBlogModalOpen(true);
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
    home: { path: '/', title: 'Office, Commercial & Warehouse Spaces for Lease and Sale | Alpha Premier Group', description: 'Browse office spaces, commercial spaces and warehouses currently available for lease or sale in Metro Manila and nearby provinces, updated live by Alpha Premier Realty. Inquire online in one tap.', jsonLd: [ORGANIZATION_JSONLD, WEBSITE_JSONLD] },
    enterprises: { path: '/enterprises', title: 'Our Enterprises | Alpha Premier Group', description: 'Meet the Alpha Premier Group companies: Alpha Premier Realty, Luxe Prime Realty, Alpha Premier Construction, SwiftClear, 88 Prime, Alta Venture, Dynamic Tree, and Virtual Office.' },
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
          <CareersView
            onApplyJob={handleApplyJob}
            onGeneralApply={handleGeneralApply}
          />
        )}

        {currentTab === 'inquire' && (
          <InquireView />
        )}

        <Outlet />
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

      {/* Job Application Modal */}
      <JobApplyModal
        job={selectedJob}
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
      />

      {/* Blog Article Reader Modal */}
      <BlogDetailModal
        post={selectedPost}
        isOpen={blogModalOpen}
        onClose={() => setBlogModalOpen(false)}
        onOpenInquire={() => handleOpenInquire()}
      />
    </div>
  );
}
