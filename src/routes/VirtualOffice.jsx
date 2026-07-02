import { useVirtualOffices } from '@/hooks/useFirestore';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import './VirtualOffice.css';

export default function VirtualOffice() {
  const { offices, loading, error } = useVirtualOffices();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const formatPrice = (d) => {
    if (!d.price || d.price <= 0) return 'Contact for Price';
    return (d.price_unit || '₱') + ' ' + Number(d.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  return (
    <>
      <Helmet>
        <title>Virtual Offices | Alpha Premier</title>
      </Helmet>

      <section className="vo-hero">
        <h1>Virtual Offices</h1>
        <p>Premium business addresses and flexible workspaces at Ortigas</p>
      </section>

      <main className="vo-grid" id="vo-list">
        {loading && <p className="loading-text">Loading virtual offices...</p>}
        {error && <p className="error-text">Failed to load virtual offices.</p>}
        {!loading && !error && offices.length === 0 && (
          <div className="vo-no-results">
            <i className="fa-solid fa-building-circle-exclamation"></i>
            <p>No virtual offices available.</p>
          </div>
        )}
        {offices.map((d) => {
          const imgSrc = (d.images && d.images[0]) ? d.images[0] : '/assets/images/placeholder.jpg';
          return (
            <div key={d.id} className="vo-card" data-aos="fade-up">
              <div className="vo-img-box">
                <span className="vo-status-badge">{d.status || ''}</span>
                <img src={imgSrc} alt={d.title || 'Virtual Office'} loading="lazy" />
              </div>
              <div className="vo-card-body">
                <span className="vo-price">{formatPrice(d)}</span>
                <h3 className="vo-title">{d.title || ''}</h3>
                <p className="vo-location">
                  <i className="fa-solid fa-location-dot"></i> {d.location || ''}
                </p>
                <div className="vo-specs">
                  <span><i className="fa-solid fa-ruler-combined"></i> {d.floor_area || ''} sqm</span>
                  <span><i className="fa-solid fa-maximize"></i> {d.lot_area || ''} sqm</span>
                </div>
                <p className="vo-description">
                  {(d.description || '').substring(0, 200)}
                  {d.description && d.description.length > 200 ? '...' : ''}
                </p>
                <a href="/contact" className="vo-inquire-btn">INQUIRE NOW</a>
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}
