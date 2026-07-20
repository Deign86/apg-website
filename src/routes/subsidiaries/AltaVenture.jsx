import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import './alta-venture.css';
import AltaVentureHeader from './alta-venture/Header';
import AltaVentureFooter from './alta-venture/Footer';
import AltaVentureChatbot from './alta-venture/Chatbot';

export default function AltaVentureLayout() {
  useEffect(() => {
    document.documentElement.classList.add('alta-venture-active');
    document.body.classList.add('loaded');
    return () => document.documentElement.classList.remove('alta-venture-active');
  }, []);

  return (
    <div className="alta-venture-scope">
      <Helmet>
        <title>Alta Venture | Alpha Premier</title>
        <meta
          name="description"
          content="Alta Venture Outsourcing — premier BPO services, fractional CFO, talent & HR, IT, customer experience, back-office operations, and risk & compliance solutions for growing businesses."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Orbitron:wght@400;500;700&display=swap"
        />
      </Helmet>
      <AltaVentureHeader />
      <main>
        <Outlet />
      </main>
      <AltaVentureFooter />
      <AltaVentureChatbot />
    </div>
  );
}
