import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
import AOS from 'aos';
import 'aos/dist/aos.css';
import FigmaApp from './alpha-realty/app/App';
import { useEnterpriseNav } from '../../context/EnterpriseNavContext';
import { basePathFor } from '../../lib/enterpriseHost';
import './alpha-realty/styles/index.css';

const BASE = basePathFor('realty');
const PROPERTIES_PATH = `${BASE}/properties`;

export default function Realty() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [statePage, setStatePage] = useState('home');
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

  // Live listings have a real URL (realty.alphapremiergroup.com/properties?ref=...) so they can be
  // shared and indexed; the other sections stay in-page state like before.
  const onPropertiesPath = /\/properties\/?$/.test(location.pathname);
  const page = onPropertiesPath ? 'properties' : statePage;

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
    if (p === 'properties') {
      routerNavigate(PROPERTIES_PATH);
    } else {
      if (onPropertiesPath) routerNavigate(BASE);
      setStatePage(p);
    }
    window.scrollTo(0, 0);
  }, [routerNavigate, onPropertiesPath]);

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
        <FigmaApp page={page} setPage={navigate} onOpenListing={openListing} />
      </div>
    </>
  );
}
