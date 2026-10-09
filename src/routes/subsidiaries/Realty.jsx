import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
import AOS from 'aos';
import FigmaApp from './alpha-realty/app/App';
import { useEnterpriseNav } from '../../context/EnterpriseNavContext';
import './alpha-realty/styles/index.css';

export default function Realty() {
  const [page, setPage] = useState('home');
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

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
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    AOS.refresh();
  }, [page]);

  const navigate = useCallback((p) => {
    setPage(p);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => registerNavigator(navigate), [registerNavigator, navigate]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  return (
    <>
      <EnterpriseSeo slug="realty" page={page} />
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/images/sstcompany-realty.png" />
      </Helmet>
      <div className="alpha-realty-scope">
        <FigmaApp page={page} setPage={navigate} />
      </div>
    </>
  );
}
