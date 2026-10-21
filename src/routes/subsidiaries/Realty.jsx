import { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
import FigmaApp from './alpha-realty/app/App';
import { useEnterpriseNav, useEnterpriseSection } from '../../context/EnterpriseNavContext';
import { LISTING_REF } from '../../hooks/useListings';
import { basePathFor } from '../../lib/enterpriseHost';
import './alpha-realty/styles/index.css';

const PROPERTIES_PATH = `${basePathFor('realty')}/properties`;
// The listings page, or one listing's own page (<base>/properties/APR-XXXXXX).
const PROPERTIES_ROUTE = /\/properties(?:\/([^/]+))?\/?$/;

// Every section has a real URL (<base>/services, /blogs, /careers, /properties/APR-XXXXXX), so
// refresh, Back/Forward and shared links land on the same section. "Inquire" opens a modal.
export default function Realty() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [section, goSection] = useEnterpriseSection();
  // Header "Inquire" opens the inquiry modal over the current page; each click bumps the counter.
  const [inquireRequest, setInquireRequest] = useState(0);
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

  const properties = PROPERTIES_ROUTE.exec(location.pathname);
  const page = properties ? 'properties' : section;
  // Links sent before listings had their own page (emails, Viber, admin) open one with ?ref=APR-XXXXXX.
  const legacyRef = properties && new URLSearchParams(location.search).get('ref');

  useEffect(() => {
    // Add class to documentElement to scope CSS rules
    document.documentElement.classList.add('alpha-realty-active');

    return () => {
      document.documentElement.classList.remove('alpha-realty-active');
    };
  }, []);

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

  // The filter query (q/type/deal) stays as a listing opens and closes; closing replaces its entry.
  const openListing = useCallback((ref) => {
    routerNavigate(`${PROPERTIES_PATH}/${encodeURIComponent(ref)}${location.search}`);
  }, [routerNavigate, location.search]);
  const closeListing = useCallback(() => {
    routerNavigate(`${PROPERTIES_PATH}${location.search}`, { replace: true });
  }, [routerNavigate, location.search]);

  useEffect(() => registerNavigator(navigate), [registerNavigator, navigate]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  if (legacyRef && LISTING_REF.test(legacyRef)) {
    const rest = new URLSearchParams(location.search);
    rest.delete('ref');
    const query = rest.toString();
    return <Navigate to={`${PROPERTIES_PATH}/${legacyRef}${query ? `?${query}` : ''}`} replace />;
  }

  return (
    <>
      {/* The properties page sets its own metadata (canonical realty…/properties). */}
      {page !== 'properties' && <EnterpriseSeo slug="realty" page={page} />}
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/images/sstcompany-realty.webp" />
      </Helmet>
      <div className="alpha-realty-scope">
        <FigmaApp
          page={page}
          setPage={navigate}
          listingRef={properties?.[1] ?? ''}
          onOpenListing={openListing}
          onCloseListing={closeListing}
          inquireRequest={inquireRequest}
        />
      </div>
    </>
  );
}
