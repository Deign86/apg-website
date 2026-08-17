import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import DynamicTreeApp from './dynamic-tree/app/App';
import { useEnterpriseNav } from '../../context/EnterpriseNavContext';
import './dynamic-tree/styles/index.css';

export default function DynamicTree() {
  const [page, setPage] = useState('home');
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

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

  useEffect(() => {
    registerNavigator(navigate);
  }, [registerNavigator, navigate]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  return (
    <>
      <Helmet>
        <title>Dynamic Tree Multimedia | Creative Media & Broadcasting</title>
        <meta
          name="description"
          content="Dynamic Tree — Premier talent management, commercial modeling, brand ambassadorship, and creative event hosting under Alpha Premier Group."
        />
        <link rel="icon" type="image/png" href="/assets/images/2. Dynamic Tree.png" />
      </Helmet>
      <DynamicTreeApp page={page} setPage={navigate} />
    </>
  );
}
