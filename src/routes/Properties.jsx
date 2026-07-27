import { useListings } from '@/hooks/useListings';
import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useOutletContext } from 'react-router-dom';
import { Search, MapPin, Ruler, Maximize, Building2, CheckCircle2, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { getTransformedUrl, getPublicUrl } from '@/hooks/usePropertyGallery';
import AOS from 'aos';

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Commercial', value: 'commercial_spaces' },
  { label: 'Office', value: 'office_spaces' },
  { label: 'Condo', value: 'condominium' },
  { label: 'House', value: 'house' },
  { label: 'Virtual', value: 'virtual_office' },
];

function PropertyCard({ property, onViewDetails }) {
  const imageGallery = property.gallery?.filter((row) => row.asset?.mime_type?.startsWith('image/')) || [];
  const cardHero = imageGallery.find((row) => row.is_cover) || imageGallery[0] || null;
  const imgSrc = cardHero
    ? getTransformedUrl(cardHero.asset, { width: 600, resize: 'cover' })
    : '/assets/images/placeholder.svg';

  return (
    <div 
      className="bg-[#10141E] border border-[#232938] hover:border-[#E2B857] flex flex-col justify-between transition-all duration-300 group overflow-hidden relative shadow-lg" 
      data-aos="fade-up"
    >
      <div className="relative h-56 w-full overflow-hidden border-b border-[#1F2533]">
        {property.status && (
          <span className="absolute top-3 left-3 bg-[#E2B857] text-neutral-950 font-black text-[9px] px-2.5 py-0.5 tracking-wider uppercase z-10 font-display">
            {property.status}
          </span>
        )}
        <img 
          src={imgSrc} 
          alt={property.title} 
          loading="lazy" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-transparent to-transparent opacity-85 pointer-events-none" />
      </div>

      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <span className="text-[14px] font-extrabold text-[#E2B857] block font-sans">
            {property.price ? '₱ ' + Number(property.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Contact for Price'}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#E2B857] transition-colors line-clamp-2 leading-snug font-display">
            {property.title}
          </h3>
          <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-normal">
            <MapPin className="w-3.5 h-3.5 text-[#E2B857] shrink-0" />
            <span className="truncate">{property.location}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-neutral-400 border-t border-[#1F2533] pt-3">
          <span className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-[#E2B857]" />
            {property.floor_area || 0} sqm Floor
          </span>
          {property.lot_area > 0 && (
            <span className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-[#E2B857]" />
              {property.lot_area} sqm Lot
            </span>
          )}
        </div>

        <div className="pt-2">
          <button 
            type="button" 
            onClick={onViewDetails}
            className="w-full py-2.5 bg-[#E2B857]/10 border border-[#E2B857]/40 hover:bg-[#E2B857] hover:text-neutral-950 text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-200 cursor-pointer font-display"
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Properties() {
  const { onOpenInquire } = useOutletContext();
  const { properties, loading, error, offline } = useListings();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalId, setModalId] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const timer = setTimeout(() => document.body.classList.add('loaded'), 100);
    return () => clearTimeout(timer);
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

  // Modal data parsing
  const modal = modalId ? properties.find(p => p.id === modalId) : null;
  const mGallery = modal?.gallery?.filter((row) => row.asset?.mime_type?.startsWith('image/')) || [];
  const mHero = mGallery.find((row) => row.is_cover) || mGallery[0] || null;
  const documents = modal?.gallery?.filter((row) => !row.asset?.mime_type?.startsWith('image/')) || [];
  const galleryImages = (mGallery && mGallery.length > 0)
    ? mGallery.map(r => getTransformedUrl(r.asset, { width: 1600, resize: 'contain' }))
    : [];
  const heroSrc = mHero
    ? getTransformedUrl(mHero.asset, { width: 1200, resize: 'cover' })
    : '/assets/images/placeholder.svg';
  const displaySrc = lightbox !== null && galleryImages.length > 0
    ? galleryImages[lightbox] || heroSrc
    : heroSrc;

  return (
    <>
      <Helmet><title>Properties | Alpha Premier</title></Helmet>

      <div className="bg-black text-neutral-100 font-sans min-h-screen pb-20 pt-24">
        
        {/* Hero */}
        <section className="bg-[#08080A] border-b border-[#1C1C22] py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-4 relative z-10">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#E2B857] uppercase font-display">
              REAL ESTATE PORTFOLIO
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-display">
              The Alpha Premier Collections
            </h1>
            
            {/* Search Box */}
            <div className="relative max-w-md mx-auto pt-2">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-5.5 z-10" />
              <input 
                type="text" 
                placeholder="Search by property name or location..."
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full bg-[#10141E] border border-[#232938] focus:border-[#E2B857] pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 outline-none relative"
              />
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-aos="fade-up">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {filters.map((f) => (
              <button 
                type="button" 
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                  filter === f.value 
                    ? 'bg-[#E2B857] text-neutral-950 font-extrabold shadow-md' 
                    : 'bg-[#10141E] text-neutral-400 border border-[#232938] hover:text-white hover:border-[#E2B857]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-aos="fade-up">
          {loading && <p className="text-center text-xs text-neutral-400 py-10">Loading premier properties...</p>}
          {offline && <p className="text-center text-xs text-rose-400 py-10">Listing temporarily offline. Connecting to backup...</p>}
          {error && <p className="text-center text-xs text-rose-400 py-10">Failed to load listings. Please try again.</p>}
          
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 bg-[#10141E] border border-[#232938] flex flex-col items-center justify-center gap-3">
              <Building2 className="w-12 h-12 text-neutral-600" />
              <p className="text-xs text-neutral-400 font-medium">No properties found matching the criteria.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onViewDetails={() => { setModalId(p.id); setLightbox(0); }}
              />
            ))}
          </div>
        </main>

      </div>

      {/* Detail Modal */}
      {modal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => { setModalId(null); setLightbox(null); }}
        >
          <div 
            className="bg-[#0E121B] border border-[#E2B857] w-full max-w-2xl text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col font-sans" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#151A26] px-6 py-4 border-b border-[#2A303F] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black tracking-[0.25em] text-[#E2B857] uppercase block font-display">
                  ALPHA PREMIER REALTY PORTFOLIO
                </span>
                <h2 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase font-display">
                  {modal.title}
                </h2>
              </div>
              <button 
                onClick={() => { setModalId(null); setLightbox(null); }} 
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              <div className="relative h-60 w-full overflow-hidden border border-[#2B3142]">
                <img
                  src={displaySrc}
                  alt={modal.title}
                  className="w-full h-full object-cover"
                />
                {modal.status && (
                  <div className="absolute top-3 left-3 bg-[#E2B857] text-neutral-950 font-extrabold text-[9px] px-3 py-1 uppercase tracking-wider font-display">
                    {modal.status}
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-neutral-950/90 text-[#E2B857] border border-[#E2B857] font-bold text-xs px-3 py-1 font-sans">
                  {modal.price ? '₱ ' + Number(modal.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Contact for Price'}
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <MapPin className="w-4 h-4 text-[#E2B857] shrink-0" />
                  <span className="font-semibold">{modal.location}</span>
                </div>

                <p className="text-neutral-400 leading-relaxed font-sans">
                  {modal.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-neutral-300 bg-[#151A26] p-3 border border-[#232938]">
                  <span><strong>Floor Area:</strong> {modal.floor_area || 0} sqm</span>
                  {modal.lot_area > 0 && <span><strong>Lot Area:</strong> {modal.lot_area} sqm</span>}
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-[#E2B857] uppercase tracking-wider">Associated Documents:</h4>
                    <div className="flex flex-col gap-2">
                      {documents.map((row) => (
                        <a 
                          key={row.asset_id} 
                          href={getPublicUrl(row.asset)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-[#E2B857] hover:underline"
                        >
                          📄 {row.asset?.original_name || 'Property document'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#232938] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-neutral-500">
                  Ref: {(modal.id || '').toUpperCase().substring(0, 8)} · pasig desk
                </span>
                <button
                  onClick={() => {
                    setModalId(null);
                    setLightbox(null);
                    onOpenInquire(modal.title);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#E2B857] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#cfa543] cursor-pointer font-display"
                >
                  SCHEDULE PRIVATE VIEWING
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Lightbox / Gallery Slideshow */}
      {lightbox !== null && modal && galleryImages.length > 1 && (
        <div className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setLightbox(null)} 
            className="absolute top-4 right-4 text-white text-3xl hover:text-[#E2B857] z-10 cursor-pointer"
          >
            &times;
          </button>
          
          <img src={galleryImages[lightbox]} alt="" className="max-w-full max-h-[85vh] object-contain border border-[#2B3142]" />
          
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((lightbox - 1 + galleryImages.length) % galleryImages.length);
              }}
              className="p-3 bg-neutral-950/80 border border-neutral-800 text-white hover:text-[#E2B857] text-xl cursor-pointer"
            >
              &#10094;
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((lightbox + 1) % galleryImages.length);
              }}
              className="p-3 bg-neutral-950/80 border border-neutral-800 text-white hover:text-[#E2B857] text-xl cursor-pointer"
            >
              &#10095;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
