import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';
import { InquireModal } from './InquireModal';

export default function Layout() {
  const location = useLocation();
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [inquireEnterprise, setInquireEnterprise] = useState(undefined);

  const handleOpenInquire = (enterpriseName) => {
    setInquireEnterprise(enterpriseName);
    setInquireModalOpen(true);
  };

  const is88Prime = location.pathname.startsWith('/subsidiaries/88prime');
  // Realty subsidiary page is handled separately in Realty.jsx, which manages its own headers/footers
  
  return (
    <>
      {!is88Prime && <Header onOpenInquire={() => handleOpenInquire()} />}
      <main className="min-h-screen flex flex-col justify-between">
        <Outlet context={{ onOpenInquire: handleOpenInquire }} />
      </main>
      {!is88Prime && <Footer onOpenInquire={() => handleOpenInquire()} />}
      <Chatbot onOpenInquire={handleOpenInquire} />

      <InquireModal
        isOpen={inquireModalOpen}
        onClose={() => setInquireModalOpen(false)}
        defaultEnterprise={inquireEnterprise}
      />
    </>
  );
}
