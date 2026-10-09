import { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
import AOS from 'aos';
import DynamicTreeApp from './dynamic-tree/app/App';
import { useEnterpriseNav } from '../../context/EnterpriseNavContext';
import './dynamic-tree/styles/index.css';

export default function DynamicTree() {
  const [page, setPage] = useState('home');
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

  // Scopes dynamic-tree/styles/theme.css tokens/base rules; layout effect so the first paint is themed.
  useLayoutEffect(() => {
    document.documentElement.classList.add('dynamic-tree-active');
    return () => document.documentElement.classList.remove('dynamic-tree-active');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    AOS.init({ duration: 800, once: true });
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
      <EnterpriseSeo slug="dynamic-tree" page={page} />
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/images/2. Dynamic Tree.png" />
      </Helmet>
      <DynamicTreeApp page={page} setPage={navigate} />
    </>
  );
}
