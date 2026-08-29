import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { useListings } from '@/hooks/useListings';
import { InquireModal } from '@/components/redesign/InquireModal';
import './Properties.css';

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Condo', value: 'condominium' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Office', value: 'office' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'House', value: 'house' },
  { label: 'Virtual', value: 'virtual_office' },
];

function PropertyCard({ property, onViewDetails, onInquire }) {
  const primaryImg = property.primary_image ||
    (property.images && property.images.length > 0 ? property.images[0].image_url : '') ||
    '/assets/images/placeholder.svg';

  const priceText = property.price_display ||
    (property.price ? '₱ ' + Number(property.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Contact for Price');

  return (
    <div className="property-card" data-aos="fade-up">
      <div className="img-box">
        <span className="status-badge">{property.status || 'AVAILABLE'}</span>
        {property.featured === 1 && <span className="featured-badge">FEATURED</span>}
        <img
          src={primaryImg}
          alt={property.title || 'Property'}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/assets/images/placeholder.svg';
          }}
        />
      </div>
      <div className="card-body">
        <span className="price-text">{priceText}</span>
        <h3 className="title-text">{property.title}</h3>
        <p className="loc-text">
          <i className="fa-solid fa-location-dot" /> {property.location || property.address || property.city || 'Metro Manila'}
        </p>
        <div className="specs">
          {property.floor_area && (
            <span><i className="fa-solid fa-ruler-combined" /> {Number(property.floor_area).toLocaleString()} sqm</span>
          )}
          {property.lot_area && (
            <span><i className="fa-solid fa-maximize" /> {Number(property.lot_area).toLocaleString()} sqm lot</span>
          )}
          {property.bedrooms && (
            <span><i className="fa-solid fa-bed" /> {property.bedrooms} Beds</span>
          )}
          {property.bathrooms && (
            <span><i className="fa-solid fa-bath" /> {property.bathrooms} Baths</span>
          )}
        </div>
        <button
          type="button"
          className="view-btn"
          onClick={() => onViewDetails(property)}
        >
          VIEW DETAILS
        </button>
      </div>
    </div>
  );
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlType = searchParams.get('type') || 'all';
  const [activeFilter, setActiveFilter] = useState(urlType);
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [inquireTarget, setInquireTarget] = useState(null);

  // Sync state with URL parameter changes
  useEffect(() => {
    const typeFromUrl = searchParams.get('type') || 'all';
    setActiveFilter(typeFromUrl);
    setSelectedProperty(null);
    setCarouselIndex(0);
    setLightboxIndex(null);
  }, [searchParams]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    setTimeout(() => document.body.classList.add('loaded'), 100);
  }, []);

  const handleFilterClick = (filterVal) => {
    setActiveFilter(filterVal);
    setSelectedProperty(null);
    setCarouselIndex(0);
    setLightboxIndex(null);
    if (filterVal === 'all') {
      searchParams.delete('type');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ type: filterVal });
    }
  };

  const { listings, loading, error } = useListings({
    type: activeFilter !== 'all' ? activeFilter : '',
    search: search.trim(),
    limit: 50,
  });

  const propertyImages = useMemo(() => {
    if (!selectedProperty) return [];
    if (Array.isArray(selectedProperty.images) && selectedProperty.images.length > 0) {
      return selectedProperty.images.map(img => typeof img === 'string' ? img : img.image_url);
    }
    if (selectedProperty.primary_image) return [selectedProperty.primary_image];
    return ['/assets/images/placeholder.svg'];
  }, [selectedProperty]);

  const handleOpenModal = (prop) => {
    setSelectedProperty(prop);
    setCarouselIndex(0);
    setLightboxIndex(null);
  };

  const handleCloseModal = () => {
    setSelectedProperty(null);
    setCarouselIndex(0);
    setLightboxIndex(null);
  };

  const handleNextSlide = (e) => {
    e?.stopPropagation();
    setCarouselIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const handlePrevSlide = (e) => {
    e?.stopPropagation();
    setCarouselIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  const handleInquire = (prop) => {
    setInquireTarget(prop);
    setInquireModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Properties & Real Estate Portfolio | Alpha Premier Group</title>
        <meta name="description" content="Explore commercial properties, logistics warehouses, Grade-A office spaces, and luxury condominiums across Metro Manila with Alpha Premier Group." />
      </Helmet>

      {/* Hero */}
      <section className="properties-hero">
        <h1 data-aos="fade-down">The Alpha Premier Collections</h1>
        <div className="hero-search-container" data-aos="zoom-in" data-aos-delay="200">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            id="properties-search-input"
            name="properties-search"
            type="text"
            placeholder="Search name, location, or features..."
            aria-label="Search properties collection"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="filter-container">
        {filters.map((f) => (
          <button
            key={f.value}
            className={`filter-btn ${activeFilter === f.value ? 'active' : ''}`}
            onClick={() => handleFilterClick(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <main className="property-grid">
        {loading && (
          <div className="loading-text">
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} /> Loading collection...
          </div>
        )}

        {error && !loading && (
          <div className="error-text">
            Unable to connect to live properties feed ({error}). Showing available catalog.
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div id="no-results" className="flex flex-col items-center gap-4 py-8">
            <i className="fa-solid fa-building-circle-exclamation" />
            <p>No properties match your current criteria.</p>
            {(activeFilter !== 'all' || search) && (
              <button
                type="button"
                className="filter-btn active cursor-pointer"
                onClick={() => {
                  setSearch('');
                  handleFilterClick('all');
                }}
              >
                VIEW ALL PROPERTIES
              </button>
            )}
          </div>
        )}

        {listings.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            onViewDetails={handleOpenModal}
            onInquire={handleInquire}
          />
        ))}
      </main>

      {/* Modal Dialog */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={handleCloseModal}>&times;</span>

            {/* Carousel / Image Area */}
            <div className="modal-carousel">
              <img
                src={propertyImages[carouselIndex] || '/assets/images/placeholder.svg'}
                alt={selectedProperty.title}
                className="carousel-img"
                onClick={() => setLightboxIndex(carouselIndex)}
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/placeholder.svg';
                }}
              />
              {propertyImages.length > 1 && (
                <div className="carousel-nav">
                  <button type="button" className="nav-btn" onClick={handlePrevSlide}>&#10094;</button>
                  <button type="button" className="nav-btn" onClick={handleNextSlide}>&#10095;</button>
                </div>
              )}
            </div>

            {/* Details Panel */}
            <div className="modal-info">
              <span className="status-badge" style={{ position: 'static', display: 'inline-block', width: 'fit-content' }}>
                {selectedProperty.status || 'AVAILABLE'}
              </span>

              <h2>{selectedProperty.title}</h2>

              <p className="modal-loc">
                <i className="fa-solid fa-location-dot" /> {selectedProperty.location || selectedProperty.address || selectedProperty.city}
              </p>

              <div className="price-text" style={{ fontSize: '1.35rem', marginBottom: 12 }}>
                {selectedProperty.price_display || (selectedProperty.price ? '₱ ' + Number(selectedProperty.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Contact for Price')}
              </div>

              <div className="modal-specs">
                {selectedProperty.floor_area && (
                  <div><strong>Floor Area:</strong> {Number(selectedProperty.floor_area).toLocaleString()} sqm</div>
                )}
                {selectedProperty.lot_area && (
                  <div><strong>Lot Area:</strong> {Number(selectedProperty.lot_area).toLocaleString()} sqm</div>
                )}
                {selectedProperty.bedrooms && (
                  <div><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</div>
                )}
                {selectedProperty.bathrooms && (
                  <div><strong>Bathrooms:</strong> {selectedProperty.bathrooms}</div>
                )}
                <div><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedProperty.property_type}</span></div>
                <div><strong>City:</strong> {selectedProperty.city || 'Metro Manila'}</div>
              </div>

              <div className="modal-desc">
                {selectedProperty.description || 'Premier commercial offering curated by Alpha Premier Group.'}
              </div>

              <button
                type="button"
                className="inquire-btn"
                onClick={() => {
                  const target = selectedProperty;
                  handleCloseModal();
                  handleInquire(target);
                }}
              >
                INQUIRE NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && propertyImages.length > 0 && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <span className="close-lightbox" onClick={() => setLightboxIndex(null)}>&times;</span>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={propertyImages[lightboxIndex]}
              alt="Property Lightbox"
              className="lightbox-img"
            />
            {propertyImages.length > 1 && (
              <div className="lb-nav">
                <button
                  type="button"
                  className="lb-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
                  }}
                >
                  &#10094;
                </button>
                <button
                  type="button"
                  className="lb-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev + 1) % propertyImages.length);
                  }}
                >
                  &#10095;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Integrated Inquire Modal */}
      <InquireModal
        isOpen={inquireModalOpen}
        onClose={() => {
          setInquireModalOpen(false);
          setInquireTarget(null);
        }}
        defaultEnterprise={inquireTarget?.title ? `Alpha Premier Realty — ${inquireTarget.title}` : 'Alpha Premier Realty'}
      />
    </>
  );
}
