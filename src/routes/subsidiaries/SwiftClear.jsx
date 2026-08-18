import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import SwiftClearApp from './swift-clear/app/App';
import { useEnterpriseNav } from '../../context/EnterpriseNavContext';

export default function SwiftClear() {
  const [page, setPage] = useState('home');
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

  useEffect(() => {
    // Add class to documentElement to scope CSS rules
    document.documentElement.classList.add('swiftclear-active');
    
    // Initialize animations
    AOS.init({ duration: 800, once: true });
    AOS.refresh();
    
    return () => {
      document.documentElement.classList.remove('swiftclear-active');
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

  useEffect(() => {
    registerNavigator(navigate);
  }, [registerNavigator, navigate]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  return (
    <>
      <Helmet>
        <title>SwiftClear | Facility & Cleaning Services | Alpha Premier</title>
        <meta 
          name="description" 
          content="SwiftClear provides professional-grade facility cleaning, hospital-standard disinfection, pest control management, and aircon maintenance." 
        />
        <link rel="icon" type="image/png" href="/assets/images/sstcompany-swiftclear1.png" />
      </Helmet>
      
      <div className="swiftclear-scope">
        <SwiftClearApp page={page} setPage={navigate} />
      </div>
    </>
  );
}
