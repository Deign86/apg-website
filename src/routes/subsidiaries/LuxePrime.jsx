import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import FigmaApp from './luxe-prime/app/App';
import { useEnterpriseNav } from '../../context/EnterpriseNavContext';
import './luxe-prime/styles/index.css';

export default function LuxePrime() {
  const [page, setPage] = useState('home');
  const routerNavigate = useNavigate();
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

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
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [routerNavigate]);

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
