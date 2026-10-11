import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
import AOS from 'aos';
import 'aos/dist/aos.css';
import FigmaApp from './alpha-realty/app/App';
import { useEnterpriseNav, useEnterpriseSection } from '../../context/EnterpriseNavContext';
import { basePathFor } from '../../lib/enterpriseHost';
import './alpha-realty/styles/index.css';

const PROPERTIES_PATH = `${basePathFor('realty')}/properties`;

// Every section has a real URL (<base>/services, /blogs, /careers, /properties?ref=...), so
// refresh, Back/Forward and shared links land on the same section. "Inquire" opens a modal.
export default function Realty() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [section, goSection] = useEnterpriseSection();
  // Header "Inquire" opens the inquiry modal over the current page; each click bumps the counter.
  const [inquireRequest, setInquireRequest] = useState(0);
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

  const page = /\/properties\/?$/.test(location.pathname) ? 'properties' : section;

  useEffect(() => {
    // Add class to documentElement to scope CSS rules
    document.documentElement.classList.add('alpha-realty-active');

    // Initialize animations
    AOS.init({ duration: 800, once: true });
    AOS.refresh();

    return () => {
      document.documentElement.classList.remove('alpha-realty-active');
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refresh();
  }, [page]);

  const navigate = useCallback((p) => {
    if (p === 'inquire') {
      setInquireRequest((n) => n + 1);
      return;
    }
    if (p === 'properties') {
      routerNavigate(PROPERTIES_PATH);
      window.scrollTo(0, 0);
      return;
    }
    goSection(p);
  }, [routerNavigate, goSection]);

  const openListing = useCallback((ref) => {
    routerNavigate(`${PROPERTIES_PATH}?ref=${encodeURIComponent(ref)}`);
  }, [routerNavigate]);

  useEffect(() => registerNavigator(navigate), [registerNavigator, navigate]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  return (
    <>
      {/* The properties page sets its own metadata (canonical realty…/properties). */}
      {page !== 'properties' && <EnterpriseSeo slug="realty" page={page} />}
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/images/sstcompany-realty.webp" />
      </Helmet>
      <div className="alpha-realty-scope">
        <FigmaApp page={page} setPage={navigate} onOpenListing={openListing} inquireRequest={inquireRequest} />
      </div>
    </>
  );
}
