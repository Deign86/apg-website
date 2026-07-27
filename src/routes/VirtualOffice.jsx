import { useVirtualOffices } from '@/hooks/useFirestore';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Ruler, Maximize, Building2, Search } from 'lucide-react';
import { usePropertyGallery, getTransformedUrl } from '@/hooks/usePropertyGallery';
import AOS from 'aos';

export default function VirtualOffice() {
  const { onOpenInquire } = useOutletContext();
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
      <div 
        className="bg-[#10141E] border border-[#232938] hover:border-[#E2B857] flex flex-col justify-between transition-all duration-300 group overflow-hidden relative shadow-lg" 
        data-aos="fade-up"
      >
        <div className="relative h-56 w-full overflow-hidden border-b border-[#1F2533]">
          {office.status && (
            <span className="absolute top-3 left-3 bg-[#E2B857] text-neutral-950 font-black text-[9px] px-2.5 py-0.5 tracking-wider uppercase z-10 font-display">
              {office.status}
            </span>
          )}
          <img 
            src={imgSrc} 
            alt={office.title} 
            loading="lazy" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-transparent to-transparent opacity-85 pointer-events-none" />
        </div>

        <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[14px] font-extrabold text-[#E2B857] block font-sans">
              {formatPrice(office)}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#E2B857] transition-colors line-clamp-2 leading-snug font-display">
              {office.title}
            </h3>
            <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-normal">
              <MapPin className="w-3.5 h-3.5 text-[#E2B857] shrink-0" />
              <span className="truncate">{office.location}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-neutral-400 border-t border-[#1F2533] pt-3">
            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-[#E2B857]" />
              {office.floor_area || 0} sqm Floor
            </span>
            {office.lot_area > 0 && (
              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-[#E2B857]" />
                {office.lot_area} sqm Lot
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 font-sans leading-relaxed line-clamp-3">
            {office.description}
          </p>

          <div className="pt-2">
            <button 
              type="button" 
              onClick={() => onOpenInquire(office.title)}
              className="w-full py-2.5 bg-[#E2B857]/10 border border-[#E2B857]/40 hover:bg-[#E2B857] hover:text-neutral-950 text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-200 cursor-pointer font-display"
            >
              INQUIRE NOW
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Virtual Offices | Alpha Premier</title>
      </Helmet>

      <div className="bg-black text-neutral-100 font-sans min-h-screen pb-20 pt-24">
        
        {/* Hero */}
        <section className="bg-[#08080A] border-b border-[#1C1C22] py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#E2B857] uppercase font-display">
              VIRTUAL OFFICE SOLUTONS
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-display">
              Virtual Office & Coworking
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Premium Ortigas business address, flexible desks, call forwarding, and SEC business registration support.
            </p>
          </div>
        </section>

        {/* Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-aos="fade-up">
          {loading && <p className="text-center text-xs text-neutral-400 py-10">Loading virtual workspaces...</p>}
          {error && <p className="text-center text-xs text-rose-400 py-10">Failed to load workspaces. Please reload.</p>}
          
          {!loading && !error && offices.length === 0 && (
            <div className="text-center py-16 bg-[#10141E] border border-[#232938] flex flex-col items-center justify-center gap-3">
              <Building2 className="w-12 h-12 text-neutral-600" />
              <p className="text-xs text-neutral-400 font-medium">No workspaces currently listed.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offices.map((office) => (
              <VirtualOfficeCard key={office.id} office={office} />
            ))}
          </div>
        </main>

      </div>
    </>
  );
}
