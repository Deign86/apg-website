import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
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
 * Per-page <title>/description/canonical come from <EnterpriseSeo> in the page exports below.
 */
export default function AltaVenture() {
  useEffect(() => {
    document.documentElement.classList.add('alta-venture-active');
    return () => document.documentElement.classList.remove('alta-venture-active');
  }, []);

  return (
    <div className="alta-venture-scope">
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/images/3. Alta Venture - Logo.png" />
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
export function AltaVentureHome() { return <><EnterpriseSeo slug="alta-venture" page="home" /><HomePage /></>; }
export function AltaVentureServices() { return <><EnterpriseSeo slug="alta-venture" page="services" /><ServicesPage /></>; }
export function AltaVentureBlogs() { return <><EnterpriseSeo slug="alta-venture" page="blogs" /><BlogsPage /></>; }
export function AltaVentureCareers() { return <><EnterpriseSeo slug="alta-venture" page="careers" /><CareersPage /></>; }
export function AltaVentureInquire() { return <><EnterpriseSeo slug="alta-venture" page="inquire" /><InquirePage /></>; }
