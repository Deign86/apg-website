import { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
import FigmaApp from './luxe-prime/app/App';
import EnterpriseInquire from './EnterpriseInquire';
import { useEnterpriseNav, useEnterpriseSection } from '../../context/EnterpriseNavContext';
import './luxe-prime/styles/index.css';

export default function LuxePrime() {
  // The URL (/services, /blogs, /careers, /inquire) is the page state.
  const [page, goToSection] = useEnterpriseSection();
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();
  // Service an "Inquire About This Service" button was clicked on; prefills the inquiry.
  const [interest, setInterest] = useState('');

  const navigate = useCallback((p, service) => {
    setInterest(typeof service === 'string' ? service : '');
    goToSection(p);
  }, [goToSection]);

  // Scopes luxe-prime/styles/theme.css tokens/base rules; layout effect so the first paint is themed.
  useLayoutEffect(() => {
    document.documentElement.classList.add('luxe-prime-active');
    return () => document.documentElement.classList.remove('luxe-prime-active');
  }, []);

  useEffect(() => registerNavigator(navigate), [registerNavigator, navigate]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  return (
    <>
      {page !== 'inquire' && <EnterpriseSeo slug="luxe-prime" page={page} />}
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/images/7. LOGO LUXE PRIME-png.webp" />
      </Helmet>
      {page === 'inquire'
        ? <EnterpriseInquire key={interest} interest={interest} />
        : <FigmaApp page={page} setPage={navigate} />}
    </>
  );
}
