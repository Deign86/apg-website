import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';

export default function SwiftClear() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>Swift Clear</title></Helmet>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 5%' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>Swift Clear</h1>
          <p style={{ color: '#999', maxWidth: '600px', margin: '20px auto' }}>
            Professional cleaning and facility services. Coming soon.
          </p>
        </div>
      </div>
    </>
  );
}
