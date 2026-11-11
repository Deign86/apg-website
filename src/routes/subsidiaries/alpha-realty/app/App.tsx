import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Check, X } from 'lucide-react';
import { FOCUS, SMALL_CAPS } from './components/ui';

/** How long the inquiry / application confirmation stays (paused while hovered or focused). */
const TOAST_MS = 10_000;

// Subcomponents
import HomeSection from './components/HomeSection';
import ListingsSection from './components/ListingsSection';
import PropertiesSection from './components/PropertiesSection';
import BlogsSection from './components/BlogsSection';
import CareersSection from './components/CareersSection';
import InquireModal from './components/InquireModal';
import RealtyBackground from './components/RealtyBackground';

// Controlled by Realty.jsx; header/footer chrome comes from the unified EnterpriseShell.
export default function App({ page: activeTab, setPage: setActiveTab, listingRef, hubPath, onOpenListing, onCloseListing, inquireRequest }: {
  page: string;
  setPage: (page: string) => void;
  /** The APR-XXXXXX ref after /properties/ ('' otherwise): the listing the Properties page opens. */
  listingRef: string;
  /** Browse page whose listings the Properties page shows (/properties/warehouse-for-lease[/cavite]); '' for all. */
  hubPath: string;
  /** Opens one live listing at its own URL (<base>/properties/APR-XXXXXX). */
  onOpenListing: (ref: string) => void;
  /** Back from a listing's URL to the Properties list. */
  onCloseListing: () => void;
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
  /** A service the visitor picked (Services page) for the inquiry popup; a listing's inquiry opens in ListingView. */
  const [inquiryService, setInquiryService] = useState<string | undefined>(undefined);

  // Success message toast notification triggers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'career'>('success');

  // Show Toast. It stays TOAST_MS (long enough to read with a screen reader or zoom), paused while the pointer or
  // keyboard focus is on it, and until dismissed.
  const [toastPaused, setToastPaused] = useState(false);
  const triggerToast = (msg: string, type: 'success' | 'career' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
  };
  useEffect(() => {
    if (!toastMessage || toastPaused) return undefined;
    const timer = setTimeout(() => setToastMessage(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toastMessage, toastPaused]);

  // The home hero opens a general inquiry with no title; never toast "undefined".
  const handleSpecificInquire = (serviceTitle?: string) => {
    setInquiryService(serviceTitle || undefined);
    setIsInquireOpen(true);
  };

  const handleInquirySubmitSuccess = () => {
    triggerToast(
      inquiryService 
        ? `Your inquiry for "${inquiryService}" has been sent. An advisor will get back to you within one business day.`
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
      <RealtyBackground />
      
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
              <PropertiesSection
                listingRef={listingRef}
                hubPath={hubPath}
                onOpenListing={onOpenListing}
                onCloseListing={onCloseListing}
                onInquire={() => handleSpecificInquire()}
              />
            )}

            {activeTab === 'services' && (
              <ListingsSection 
                onInquireClick={handleSpecificInquire}
              />
            )}

            {activeTab === 'blogs' && (
              <BlogsSection onInquire={() => handleSpecificInquire()} />
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
        onClose={() => { setIsInquireOpen(false); setInquiryService(undefined); }}
        onSubmitSuccess={handleInquirySubmitSuccess}
        serviceTitle={inquiryService}
      />

      {/* 3. Confirmation after an inquiry or application: above the chat launcher, gold check, dismissable. */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            onMouseEnter={() => setToastPaused(true)}
            onMouseLeave={() => setToastPaused(false)}
            onFocus={() => setToastPaused(true)}
            onBlur={() => setToastPaused(false)}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            className="fixed bottom-24 left-4 right-4 z-50 flex items-start gap-4 rounded-2xl border border-[#c5a85c]/40 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(197,168,92,0.16),transparent_60%),linear-gradient(180deg,#121214,#0b0b0d)] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:left-auto sm:right-6 sm:max-w-md"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#c5a85c]/15 text-[#e6cd86]">
              {toastType === 'success' ? <Check className="size-5" aria-hidden="true" /> : <Briefcase className="size-5" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={SMALL_CAPS}>{toastType === 'success' ? 'Inquiry sent' : 'Application sent'}</p>
              <p className="mt-1.5 text-pretty text-sm leading-relaxed text-white/80">{toastMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              aria-label="Dismiss"
              className={`-mr-1 -mt-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white ${FOCUS}`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
