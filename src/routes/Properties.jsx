import { useProperties } from '@/hooks/useFirestore';
import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { usePropertyGallery, getTransformedUrl } from '@/hooks/usePropertyGallery';
import './Properties.css';

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Commercial', value: 'commercial_spaces' },
  { label: 'Office', value: 'office_spaces' },
  { label: 'Condo', value: 'condominium' },
  { label: 'House', value: 'house' },
  { label: 'Virtual', value: 'virtual_office' },
];

function PropertyCard({ property }) {
  const { hero: cardHero } = usePropertyGallery(Number(property.id));
  const imgSrc = cardHero
    ? getTransformedUrl(cardHero.asset, { width: 600, resize: 'cover' })
    : '/assets/images/placeholder.svg';
  return (
    <div className="property-card" data-aos="fade-up">
      <div className="img-box">
        <span className="status-badge">{property.status || ''}</span>
        <img src={imgSrc} alt={property.title || 'Property'} loading="lazy" />
      </div>
      <div className="card-body">
        <span className="price-text">{property.price ? '₱ ' + Number(property.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Contact for Price'}</span>
        <h3 className="title-text">{property.title || ''}</h3>
        <p className="loc-text">
          <i className="fa-solid fa-location-dot"></i> {property.location || ''}
        </p>
        <div className="specs">
          <span><i className="fa-solid fa-ruler-combined"></i> {property.floor_area || ''} sqm</span>
          <span><i className="fa-solid fa-maximize"></i> {property.lot_area || ''} sqm</span>
        </div>
        <button className="view-btn">VIEW DETAILS</button>
      </div>
    </div>
  );
}

export default function Properties() {
  const { properties, loading, error, offline } = useProperties();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalId, setModalId] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    setTimeout(() => document.body.classList.add('loaded'), 100);
  }, []);

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchSearch = !search ||
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.location || '').toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' ||
        (p.property_type || '').toLowerCase() === filter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [properties, search, filter]);

  // Modal/lightbox data — hook called at top level, keyed on modalId
  const { hero: mHero, gallery: mGallery, loading: modalLoading } =
    usePropertyGallery(Number(modalId));
  const galleryImages = (mGallery && mGallery.length > 0)
    ? mGallery.map(r => getTransformedUrl(r.asset, { width: 1600, resize: 'contain' }))
    : [];
  const heroSrc = mHero
    ? getTransformedUrl(mHero.asset, { width: 1200, resize: 'cover' })
    : '/assets/images/placeholder.svg';
  const modal = modalId ? properties.find(p => p.id === modalId) : null;
  const displaySrc = lightbox !== null && galleryImages.length > 0
    ? galleryImages[lightbox] || heroSrc
    : heroSrc;

  return (
    <>
      <Helmet><title>Properties | Alpha Premier</title></Helmet>

      {/* Hero */}
      <section className="properties-hero">
        <h1>The Alpha Premier Collections</h1>
        <div className="hero-search-container">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search name or location..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>

      {/* Filters */}
      <div className="filter-container">
        {filters.map((f) => (
          <button key={f.value}
            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <main className="property-grid">
        {loading && <p className="loading-text">Loading properties...</p>}
        {offline && <p className="error-text">Listing temporarily unavailable — backend offline.</p>}
        {error && <p className="error-text">Failed to load properties.</p>}
        {!loading && !error && filtered.length === 0 && (
          <div id="no-results">
            <i className="fa-solid fa-building-circle-exclamation"></i>
            <p>No properties found.</p>
          </div>
        )}
        {filtered.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            onViewDetails={() => { setModalId(Number(p.id)); setLightbox(0); }}
          />
        ))}
      </main>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => { setModalId(null); setLightbox(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal"
              onClick={() => { setModalId(null); setLightbox(null); }}>&times;</span>
            <div className="modal-carousel">
              <img
                src={displaySrc}
                alt={modal.title}
                style={{ cursor: 'pointer', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="modal-info">
              <span className="status-badge">{modal.status || ''}</span>
              <h2>{modal.title}</h2>
              <p className="modal-loc">
                <i className="fa-solid fa-location-dot"></i> {modal.location || ''}
              </p>
              <div className="price-text">
                {modal.price ? '₱ ' + Number(modal.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Contact for Price'}
              </div>
              <div className="modal-desc">{modal.description || ''}</div>
              <div className="modal-specs">
                <span>Floor Area: {modal.floor_area || ''} sqm</span>
                <span>Lot Area: {modal.lot_area || ''} sqm</span>
              </div>
              <a href="/contact" className="inquire-btn">INQUIRE NOW</a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && modal && galleryImages.length > 0 && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <span className="close-lightbox" onClick={() => setLightbox(null)}>&times;</span>
          <img src={galleryImages[lightbox]} alt="" className="lightbox-img" />
          <div className="lb-nav">
            <button className="lb-btn" onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox - 1 + galleryImages.length) % galleryImages.length);
            }}>&#10094;</button>
            <button className="lb-btn" onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox + 1) % galleryImages.length);
            }}>&#10095;</button>
          </div>
        </div>
      )}
    </>
  );
}
