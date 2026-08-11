import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router-dom';
import './alta-venture.css';
import AltaVentureHeader from './alta-venture/Header';
import AltaVentureFooter from './alta-venture/Footer';
import AltaVentureChatbot from './alta-venture/Chatbot';
import HomePage from './alta-venture/Home';
import ServicesPage from './alta-venture/Services';
import BlogsPage from './alta-venture/Blogs';
import CareersPage from './alta-venture/Careers';
import InquirePage from './alta-venture/Inquire';

/*
 * AltaVenture layout.
 *
 * Own bespoke chrome (av-header.css / av-footer.css / av-chatbot.css)
 * with a dark-teal (#082636) header and teal-green (#4de8b8) accents.
 * Page components below are mounted alongside named exports so
 * src/App.jsx can put each into its own nested route (index, services,
 * blogs, careers, inquire).
 *
 * The internal <Helmet> sets the AV <title>; deeper <Helmet> blocks in
 * individual page components (currently Inquire) override per-page.
 */
export default function AltaVenture() {
  useEffect(() => {
    document.documentElement.classList.add('alta-venture-active');
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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
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

/* Page component exports (wrapped so they can be safely mounted inside
 * nested routes via <Route element={<AltaVentureServices/>} />). */
export function AltaVentureHome()      { return <HomePage />; }
export function AltaVentureServices()  { return <ServicesPage />; }
export function AltaVentureBlogs()     { return <BlogsPage />; }
export function AltaVentureCareers()   { return <CareersPage />; }
export function AltaVentureInquire()   { return <InquirePage />; }
