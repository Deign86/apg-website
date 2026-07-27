import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import FigmaApp from './alpha-realty/app/App';
import './alpha-realty/styles/index.css';

export default function Realty() {
  const [page, setPage] = useState('home');

  // Immediately assign side-channel globals during render to prevent state lag
  if (typeof window !== 'undefined') {
    window.enterpriseCurrentPage = page;
  }

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

  // Expose navigate + current page to EnterpriseHeader/Footer via a global side channel
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.enterpriseNavigate = navigate;
      window.enterpriseCurrentPage = page;
    }
    return () => {
      if (typeof window !== 'undefined') {
        if (window.enterpriseNavigate === navigate) window.enterpriseNavigate = undefined;
        if (window.enterpriseCurrentPage === page) window.enterpriseCurrentPage = undefined;
      }
    };
  }, [navigate, page]);

  return (
    <>
      <Helmet>
        <title>Alpha Premier Realty | Alpha Premier</title>
        <meta 
          name="description" 
          content="Alpha Premier Realty is a leading brokerage and advisory firm in the Philippines, specializing in premium commercial spaces, warehouse logistics, and upscale residential properties." 
        />
      </Helmet>
      <div className="alpha-realty-scope">
        <FigmaApp page={page} setPage={navigate} />
      </div>
    </>
  );
}
