import { useVirtualOffices } from '@/hooks/useFirestore';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { usePropertyGallery, getTransformedUrl } from '@/hooks/usePropertyGallery';
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

function VirtualOfficeCard({ office }) {
  const { hero: cardHero } = usePropertyGallery(Number(office.id));
  const imgSrc = cardHero
    ? getTransformedUrl(cardHero.asset, { width: 600, resize: 'cover' })
    : '/assets/images/placeholder.svg';
  return (
    <div key={office.id} className="vo-card" data-aos="fade-up">
      <div className="vo-img-box">
        <span className="vo-status-badge">{office.status || ''}</span>
        <img src={imgSrc} alt={office.title || 'Virtual Office'} loading="lazy" />
      </div>
      <div className="vo-card-body">
        <span className="vo-price">{formatPrice(office)}</span>
        <h3 className="vo-title">{office.title || ''}</h3>
        <p className="vo-location">
          <i className="fa-solid fa-location-dot"></i> {office.location || ''}
        </p>
        <div className="vo-specs">
          <span><i className="fa-solid fa-ruler-combined"></i> {office.floor_area || ''} sqm</span>
          <span><i className="fa-solid fa-maximize"></i> {office.lot_area || ''} sqm</span>
        </div>
        <p className="vo-description">
          {(office.description || '').substring(0, 200)}
          {office.description && office.description.length > 200 ? '...' : ''}
        </p>
        <a href="/contact" className="vo-inquire-btn">INQUIRE NOW</a>
      </div>
    </div>
  );
}

  return (
    <>
      <Helmet>
        <title>Virtual Offices | Alpha Premier</title>
      </Helmet>

      <section className="vo-hero">
        <h1>Virtual Office</h1>
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
{offices.map((office) => (
  <VirtualOfficeCard key={office.id} office={office} />
))}
      </main>
    </>
  );
}
