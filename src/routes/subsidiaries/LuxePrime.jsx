import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import FigmaApp from './luxe-prime/app/App';
import { useEnterpriseNav } from '../../context/EnterpriseNavContext';
import './luxe-prime/styles/index.css';

const VALID_PAGES = ['home', 'services', 'blogs', 'careers'];

function getPageFromPathname(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1]?.toLowerCase();
  if (last && VALID_PAGES.includes(last)) {
    return last;
  }
  return 'home';
}

export default function LuxePrime() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [page, setPage] = useState(() => getPageFromPathname(location.pathname));
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

  useEffect(() => {
    const matchedPage = getPageFromPathname(location.pathname);
    setPage(matchedPage);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    AOS.init({ duration: 800, once: true });
    AOS.refresh();
  }, [page]);

  const navigate = useCallback((p) => {
    if (p === 'inquire') {
      routerNavigate('/subsidiaries/luxe-prime/inquire');
      return;
    }
    setPage(p);
    const basePath = location.pathname.startsWith('/luxe-prime') ? '/luxe-prime' : '/subsidiaries/luxe-prime';
    const newPath = p === 'home' ? basePath : `${basePath}/${p}`;
    if (location.pathname !== newPath) {
      routerNavigate(newPath);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [routerNavigate, location.pathname]);

  useEffect(() => {
    registerNavigator(navigate);
  }, [registerNavigator, navigate]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  return (
    <>
      <Helmet>
        <title>Luxe Prime Realty | Luxury Estates & Residences</title>
        <meta
          name="description"
          content="Luxe Prime Realty — where prestige meets practicality. Co-managed subleasing, end-to-end property administration, and tailored leasing strategies."
        />
        <link rel="icon" type="image/png" href="/assets/images/7. LOGO LUXE PRIME-png.png" />
      </Helmet>
      <FigmaApp page={page} setPage={navigate} />
    </>
  );
}
