import React, { useState } from 'react';
import { NavTab, JobPosition, BlogPost, PropertyItem } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { InquireModal } from './components/InquireModal';
import { JobApplyModal } from './components/JobApplyModal';
import { BlogDetailModal } from './components/BlogDetailModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { UnifiedLuxuryBackground } from './components/UnifiedLuxuryBackground';

import { HomeView } from './views/HomeView';
import { EnterprisesView } from './views/EnterprisesView';
import { CareersView } from './views/CareersView';
import { BlogsView } from './views/BlogsView';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  
  // Modals state
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [inquireEnterprise, setInquireEnterprise] = useState<string | undefined>(undefined);

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);

  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);

  const handleOpenInquire = (enterpriseName?: string) => {
    setInquireEnterprise(enterpriseName);
    setInquireModalOpen(true);
  };

  const handleApplyJob = (job: JobPosition) => {
    setSelectedJob(job);
    setJobModalOpen(true);
  };

  const handleGeneralApply = () => {
    setSelectedJob(null);
    setJobModalOpen(true);
  };

  const handleSelectBlogPost = (post: BlogPost) => {
    setSelectedPost(post);
    setBlogModalOpen(true);
  };

  const handleSelectProperty = (property: PropertyItem) => {
    setSelectedProperty(property);
    setPropertyModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden text-neutral-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-neutral-950 bg-[#0A0803]">
      
      {/* Dynamic Animated Premium Black & Gold Background System (No wave lines) */}
      <UnifiedLuxuryBackground currentTab={currentTab} />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenInquire={() => handleOpenInquire()}
      />

      {/* Primary Page Content */}
      <main className="flex-1 relative z-10">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={setCurrentTab}
            onOpenInquire={() => handleOpenInquire()}
            onSelectProperty={handleSelectProperty}
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
      </main>

      {/* Footer */}
      <Footer
        onNavigate={setCurrentTab}
        onOpenInquire={() => handleOpenInquire()}
      />

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

export default App;
