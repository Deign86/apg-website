import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, Briefcase } from 'lucide-react';

// Subcomponents
import HomeSection from './components/HomeSection';
import ListingsSection from './components/ListingsSection';
import PropertiesSection from './components/PropertiesSection';
import BlogsSection from './components/BlogsSection';
import CareersSection from './components/CareersSection';
import InquireModal from './components/InquireModal';
import GoldWavesBackground from './components/GoldWavesBackground';

// Controlled by Realty.jsx; header/footer chrome comes from the unified EnterpriseShell.
export default function App({ page: activeTab, setPage: setActiveTab, onOpenListing, inquireRequest }: {
  page: string;
  setPage: (page: string) => void;
  /** Opens one live listing on the Properties page (deep link ?ref=APR-XXXXXX). */
  onOpenListing: (ref: string) => void;
  /** Bumped by the header "Inquire" button; each change opens the general inquiry modal. */
  inquireRequest: number;
}) {
  // Modal Inquire now general toggle
  const [isInquireOpen, setIsInquireOpen] = useState(false);

  useEffect(() => {
    if (inquireRequest > 0) {
      setIsInquireOpen(true);
    }
  }, [inquireRequest]);
  const [prefilledProperty, setPrefilledProperty] = useState<{ title: string; ref?: string } | undefined>(undefined);

  // Success message toast notification triggers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'career'>('success');

  // Show Toast
  const triggerToast = (msg: string, type: 'success' | 'career' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // The home hero opens a general inquiry with no title; never toast "undefined".
  const handleSpecificInquire = (propertyTitle?: string, ref?: string) => {
    setPrefilledProperty(propertyTitle ? { title: propertyTitle, ref } : undefined);
    setIsInquireOpen(true);
  };

  const handleInquirySubmitSuccess = () => {
    triggerToast(
      prefilledProperty 
        ? `Your inquiry for "${prefilledProperty.title}" has been sent. An advisor will get back to you within one business day.`
        : `Your inquiry has been sent. An advisor will get back to you within one business day.`,
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
      
      {/* 1. Main Tabbed Content */}
      <div className="relative flex-grow">
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
                onExploreExpertise={() => setActiveTab('services')}
                onInquireClick={handleSpecificInquire}
                onViewProperties={() => setActiveTab('properties')}
                onOpenListing={onOpenListing}
              />
            )}

            {activeTab === 'properties' && (
              <PropertiesSection onInquire={(listing) => handleSpecificInquire(listing?.title, listing?.ref)} />
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
      </div>

      {/* 2. Persistent Portals / Inquire Popup Modal */}
      <InquireModal
        isOpen={isInquireOpen}
        onClose={() => { setIsInquireOpen(false); setPrefilledProperty(undefined); }}
        onSubmitSuccess={handleInquirySubmitSuccess}
        prefilledPropertyTitle={prefilledProperty?.title}
        prefilledPropertyRef={prefilledProperty?.ref}
      />

      {/* 3. Stunning Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-md bg-[#0a0b0f] border border-[#c5a85c]/60 shadow-2xl p-5 rounded-sm flex items-start gap-4"
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
                {toastType === 'success' ? 'INQUIRY SENT' : 'APPLICATION REGISTERED'}
              </h5>
              <p className="text-white/80 text-sm mt-1.5 leading-relaxed font-sans font-normal">
                {toastMessage}
              </p>
              <p className="text-xs font-mono text-white/60 uppercase mt-2">
                VERIFIED SECURE CONNECTION
              </p>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
