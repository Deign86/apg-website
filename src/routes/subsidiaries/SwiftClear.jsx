import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
import SwiftClearApp from './swift-clear/app/App';
import { useEnterpriseNav, useEnterpriseSection } from '../../context/EnterpriseNavContext';

export default function SwiftClear() {
  // The URL (/services, /blogs, …) is the page state: refresh, Back/Forward and sharing work.
  const [page, navigate] = useEnterpriseSection();
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

  useEffect(() => {
    // Add class to documentElement to scope CSS rules
    document.documentElement.classList.add('swiftclear-active');

    return () => {
      document.documentElement.classList.remove('swiftclear-active');
    };
  }, []);

  useEffect(() => registerNavigator(navigate), [registerNavigator, navigate]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  return (
    <>
      <EnterpriseSeo slug="swiftclear" page={page} />
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/images/sstcompany-swiftclear1.png" />
      </Helmet>
      
      <div className="swiftclear-scope">
        <SwiftClearApp page={page} setPage={navigate} />
      </div>
    </>
  );
}
