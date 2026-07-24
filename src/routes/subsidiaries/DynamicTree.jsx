import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import DynamicTreeApp from './dynamic-tree/app/App';
import './dynamic-tree/styles/index.css';

// DynamicTree — renders the Dynamic Tree export inside the shared <EnterpriseShell> wrapper
// (which provides EnterpriseHeader + EnterpriseFooter + EnterpriseChatbot).
export default function DynamicTree() {
  const [page, setPage] = useState('home');

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const navigate = useCallback((p) => {
    setPage(p);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Expose navigate + current page to EnterpriseHeader/Footer via global side channel
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
        <title>Dynamic Tree | Alpha Premier Group</title>
        <meta
          name="description"
          content="Dynamic Tree — Premier talent management, commercial modeling, brand ambassadorship, and creative event hosting under Alpha Premier Group."
        />
      </Helmet>
      <DynamicTreeApp page={page} setPage={navigate} />
    </>
  );
}
