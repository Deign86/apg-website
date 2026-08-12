import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { UnifiedLuxuryBackground } from './UnifiedLuxuryBackground';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { InquireModal } from './InquireModal';
import { JobApplyModal } from './JobApplyModal';
import { BlogDetailModal } from './BlogDetailModal';
import { PropertyDetailModal } from './PropertyDetailModal';
import { AlphaAssistant } from './AlphaAssistant';

import { Helmet } from 'react-helmet-async';
import { HomeView } from '../../views/HomeView';
import { EnterprisesView } from '../../views/EnterprisesView';
import { CareersView } from '../../views/CareersView';
import { BlogsView } from '../../views/BlogsView';

export default function RedesignShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive currentTab from path
  const getTabFromPath = (path) => {
    if (path.startsWith('/enterprises')) return 'enterprises';
    if (path.startsWith('/careers')) return 'careers';
    if (path.startsWith('/blogs')) return 'blogs';
    return 'home';
  };

  const [currentTab, setCurrentTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setCurrentTab(getTabFromPath(location.pathname));
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

  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleOpenInquire = (enterpriseName) => {
    setInquireEnterprise(enterpriseName);
    setInquireModalOpen(true);
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

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setPropertyModalOpen(true);
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

  return (
    <div className="min-h-screen relative overflow-x-hidden text-neutral-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-neutral-950 bg-[#0A0803]">
      <Helmet>
        <title>
          {currentTab === 'home' && 'Alpha Premier Group | Corporate Conglomerate'}
          {currentTab === 'enterprises' && 'Our Enterprises | Alpha Premier Group'}
          {currentTab === 'blogs' && 'Blogs & Newsroom | Alpha Premier Group'}
          {currentTab === 'careers' && 'Careers & Opportunities | Alpha Premier Group'}
        </title>
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
            onSelectProperty={handleSelectProperty}
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

      {/* Property Showcase Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={propertyModalOpen}
        onClose={() => setPropertyModalOpen(false)}
        onOpenInquire={() => handleOpenInquire()}
      />
    </div>
  );
}
