import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';

export default function DynamicTree() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>Dynamic Tree</title></Helmet>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 5%' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>Dynamic Tree</h1>
          <p style={{ color: '#999', maxWidth: '600px', margin: '20px auto' }}>Modeling and talent management services. Coming soon.</p>
        </div>
      </div>
    </>
  );
}
