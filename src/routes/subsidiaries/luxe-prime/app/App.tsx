import { useState } from 'react';
import BlogsPage from './components/BlogsPage';
import CareersPage from './components/CareersPage';
import HomePage from './components/HomePage';
import InquirePage from './components/InquirePage';
import ServicesPage from './components/ServicesPage';

type Page = 'home' | 'services' | 'blogs' | 'careers' | 'inquire';
/** Go to a page; `interest` (inquire only) is the service the inquiry is about. */
type Navigate = (p: Page, interest?: string) => void;

interface AppProps {
  page: Page;
  setPage: Navigate;
  /** The service an "Inquire about this service" button was clicked on ('' for a general inquiry). */
  interest: string;
}

// Controlled by LuxePrime.jsx, which maps the URL to `page`; each page is its own component in components/.
export default function App({ page, setPage, interest }: AppProps) {
  // Pages fade in when the visitor switches; the page the site opened on paints at once (no hidden first paint).
  const [shownPage, setShownPage] = useState(page);
  const [fadeIn, setFadeIn] = useState(false);
  if (shownPage !== page) {
    setShownPage(page);
    setFadeIn(true);
  }

  const navigate: Navigate = (p, service) => {
    setPage(p, service);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    // Transparent: the fixed pinstripe layer (styles/index.css) shows through.
    <div className="relative flex min-h-screen flex-col text-[#F5F0E8]">
      <div key={page} className={`flex-1 ${fadeIn ? 'animate-in fade-in-0 duration-500 motion-reduce:animate-none' : ''}`}>
        {page === 'home' && <HomePage onNavigate={(p) => navigate(p)} />}
        {page === 'services' && <ServicesPage onInquire={(service) => navigate('inquire', service)} />}
        {page === 'blogs' && <BlogsPage onInquire={() => navigate('inquire')} />}
        {page === 'careers' && <CareersPage />}
        {page === 'inquire' && <InquirePage key={interest} interest={interest} />}
      </div>
    </div>
  );
}
