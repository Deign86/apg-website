import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, MessageSquare, Briefcase, Sparkles, Star } from 'lucide-react';

// Subcomponents
import Header from './components/Header';
import Footer from './components/Footer';
import HomeSection from './components/HomeSection';
import ListingsSection from './components/ListingsSection';
import BlogsSection from './components/BlogsSection';
import CareersSection from './components/CareersSection';
import InquireModal from './components/InquireModal';
import GoldWavesBackground from './components/GoldWavesBackground';

interface AppProps {
  page?: string;
  setPage?: (page: string) => void;
}

export default function App({ page = 'home', setPage }: AppProps) {
  const [localActiveTab, setLocalActiveTab] = useState<string>('home');
  const activeTab = setPage ? page : localActiveTab;
  const setActiveTab = setPage ? setPage : setLocalActiveTab;
  
  // Modal Inquire now general toggle
  const [isInquireOpen, setIsInquireOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'inquire') {
      setIsInquireOpen(true);
    }
  }, [activeTab]);
  const [prefilledProperty, setPrefilledProperty] = useState<{ title: string; id: string } | undefined>(undefined);

  // Success message toast notification triggers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'career'>('success');

  // Trigger scroll to top upon switching tabs
  useEffect(() => {
    if (!setPage) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab, setPage]);

  // Show Toast
  const triggerToast = (msg: string, type: 'success' | 'career' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleGeneralInquire = () => {
    setPrefilledProperty(undefined);
    setIsInquireOpen(true);
  };

  const handleSpecificInquire = (propertyTitle: string, propertyId: string) => {
    setPrefilledProperty({ title: propertyTitle, id: propertyId });
    setIsInquireOpen(true);
  };

  const handleInquirySubmitSuccess = () => {
    triggerToast(
      prefilledProperty 
        ? `Your inquiry for "${prefilledProperty.title}" has been successfully encrypted and submitted.`
        : `Your portfolio inquiry has been filed. An executive advisor will contact you shortly.`,
      'success'
    );
  };

  const handleJobApplySuccess = (jobTitle: string) => {
    triggerToast(
      `Application for "${jobTitle}" submitted successfully. Our talent division will review your credentials.`,
      'career'
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between selection:bg-[#c5a85c] selection:text-[#06070a] relative overflow-hidden" id="app-viewport">
      
      {/* Premium ambient design backgrounds */}
      <GoldWavesBackground activeTab={activeTab} />
      
      {/* 1. Header Navigation — rendered by unified EnterpriseHeader when embedded in EnterpriseShell */}
      {!setPage && (
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onInquireClick={handleGeneralInquire}
        />
      )}

      {/* 2. Main Tabbed Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {activeTab === 'home' && (
              <HomeSection 
                onLearnStory={() => setActiveTab('blogs')} 
                onExploreExpertise={() => setActiveTab('services')}
                onInquireClick={handleSpecificInquire}
              />
            )}

            {activeTab === 'services' && (
              <ListingsSection 
                onInquireClick={handleSpecificInquire}
              />
            )}

            {activeTab === 'blogs' && (
              <BlogsSection />
            )}

            {activeTab === 'careers' && (
              <CareersSection 
                onApplySuccess={handleJobApplySuccess}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Luxury Black Footer — rendered by unified EnterpriseFooter when embedded in EnterpriseShell */}
      {!setPage && (
        <Footer 
          setActiveTab={setActiveTab} 
          onInquireClick={handleGeneralInquire}
        />
      )}

      {/* 4. Persistent Portals / Inquire Popup Modal */}
      <InquireModal
        isOpen={isInquireOpen}
        onClose={() => { setIsInquireOpen(false); setPrefilledProperty(undefined); }}
        onSubmitSuccess={handleInquirySubmitSuccess}
        prefilledPropertyTitle={prefilledProperty?.title}
        prefilledPropertyId={prefilledProperty?.id}
      />

      {/* 5. Stunning Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0a0b0f] border border-[#c5a85c]/60 shadow-2xl p-5 rounded-sm flex items-start gap-4"
          >
            {toastType === 'success' ? (
              <div className="w-10 h-10 rounded-full bg-[#c5a85c]/10 flex items-center justify-center shrink-0 border border-[#c5a85c]/40 text-[#c5a85c]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/40 text-blue-400">
                <Briefcase className="w-5 h-5" />
              </div>
            )}

            <div className="flex-grow">
              <h5 className="font-sans text-xs font-bold tracking-widest uppercase text-[#c5a85c]">
                {toastType === 'success' ? 'SECURE FILE FILED' : 'APPLICATION REGISTERED'}
              </h5>
              <p className="text-white/80 text-xs mt-1.5 leading-relaxed font-sans font-light">
                {toastMessage}
              </p>
              <p className="text-[9px] font-mono text-white/30 uppercase mt-2">
                VERIFIED SECURE CONNECTION
              </p>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
