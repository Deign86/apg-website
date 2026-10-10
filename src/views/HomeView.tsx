import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { NavTab } from '../types';
import { ENTERPRISES, CORE_VALUES } from '../data/companyData';
const landingPageImg = '/assets/images/landingpage.png';
const heroVideoSrc = '/assets/videos/alpha-premier-group.mp4';
const apgLogo = '/assets/images/apgopc.png';
import { EnterprisesGallery } from '../components/redesign/EnterprisesGallery';
import { AboutUsSection } from '../components/redesign/AboutUsSection';
import { ListingCard, ListingCardSkeleton, syncedAgo } from '../components/redesign/ListingCard';
import { useContent } from '../hooks/useContent';
import { useListings } from '../hooks/useListings';
import { SeamlessHeroVideo } from '../components/redesign/SeamlessHeroVideo';
import { Sparkles, ArrowRight, Quote, Search } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenInquire: (enterpriseName?: string) => void;
  onSelectEnterprise?: (enterprise: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenInquire,
  onSelectEnterprise
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { listings, syncedAt, loading } = useListings();
  const [hoveredMissionCard, setHoveredMissionCard] = useState<string | null>(null);
  const [hoveredCoreValue, setHoveredCoreValue] = useState<number | null>(null);

  /** Up to three property types with the most listings, as hero shortcuts. */
  const topTypes = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const l of listings) {
      const entry = counts.get(l.type) ?? { label: l.type_label, count: 0 };
      entry.count += 1;
      counts.set(l.type, entry);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([type, { label }]) => [type, label] as const);
  }, [listings]);

  /* DB-backed corporate copy (page_slug 'home' via /api/content.php?page=home).
     section_keys: mission_p1, mission_p2, vision_quote, vision_note, ceo_quote.
     Empty DB -> hardcoded fallbacks below render unchanged. */
  const { content } = useContent('home', {
    mission_p1: 'Alpha Premier Group of Companies is a diversified Philippine-based business group serving as the parent organization for premier companies across real estate, virtual workspaces, construction, facility services, and corporate support.',
    ceo_quote: '"No matter where your enterprise stands today, we are prepared to build greater possibilities together and transform ambitious opportunities into enduring realities."',
    vision_quote: '"To become a leading and globally recognized Philippine business group, setting the benchmark in real estate brokerage, corporate workspace services, and diversified enterprise solutions."',
  });

  return (
    <div className="bg-transparent text-neutral-100 font-sans selection:bg-[#D4AF37] selection:text-neutral-950">
      
      {/* 1. HERO: SEARCH THE LIVE LISTINGS */}
      <section className="relative overflow-hidden border-b border-[#D4AF37]/30 px-4 pb-14 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <SeamlessHeroVideo
          src={heroVideoSrc}
          poster={landingPageImg}
          crossfadeDuration={1.2}
          overlayClassName="bg-black/70"
        />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <img src={apgLogo} alt="Alpha Premier Group of Companies" className="mx-auto h-20 w-auto object-contain sm:h-28" />
          <h1 className="mt-4 text-balance text-3xl font-black leading-tight text-white sm:text-5xl">
            Office, commercial and warehouse spaces available now
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-neutral-300 sm:text-base">
            Browse Alpha Premier Realty's current listings, updated live from our inventory, and inquire in one tap.
          </p>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(search.trim() ? `/properties?q=${encodeURIComponent(search.trim())}` : '/properties');
            }}
            className="mx-auto mt-6 flex max-w-xl gap-2 rounded-2xl border border-[#D4AF37]/40 bg-black/80 p-1.5"
          >
            <label htmlFor="home-property-search" className="sr-only">Search available properties</label>
            <input
              id="home-property-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="City, size or type (e.g. Makati office)"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder-neutral-500 outline-none"
            />
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#FFDF73] cursor-pointer">
              <Search className="size-4" aria-hidden="true" />
              <span>Search</span>
            </button>
          </form>

          <nav aria-label="Browse properties" className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { to: '/properties?deal=lease', label: 'For Lease' },
              { to: '/properties?deal=sale', label: 'For Sale' },
              ...topTypes.map(([type, label]) => ({ to: `/properties?type=${type}`, label })),
            ].map((chip) => (
              <Link
                key={chip.to}
                to={chip.to}
                className="rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:border-[#D4AF37] hover:text-white"
              >
                {chip.label}
              </Link>
            ))}
          </nav>

          {!loading && listings.length > 0 && (
            <p className="mt-4 text-xs text-neutral-400 tabular-nums">
              {listings.length} {listings.length === 1 ? 'property' : 'properties'} available{syncedAt ? ` · updated ${syncedAgo(syncedAt)}` : ''}
            </p>
          )}
        </div>
      </section>

      {/* 1b. LATEST LISTINGS */}
      {(loading || listings.length > 0) && (
        <section aria-labelledby="latest-listings-heading" aria-busy={loading} className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="latest-listings-heading" className="text-balance text-2xl font-black text-white sm:text-3xl">Latest listings</h2>
              <p className="mt-1 text-pretty text-sm text-neutral-400">Newly added spaces from Alpha Premier Realty.</p>
            </div>
            <Link to="/properties" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#D4AF37] hover:text-[#FFE082]">
              View all{listings.length > 0 ? ` ${listings.length}` : ''} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? [0, 1, 2].map((i) => <ListingCardSkeleton key={i} />)
              : listings.slice(0, 6).map((l) => (
                  <ListingCard key={l.ref} listing={l} onOpen={(item) => navigate(`/properties?ref=${item.ref}`)} />
                ))}
          </div>
        </section>
      )}

      {/* 2. OUR ENTERPRISES - HORIZONTAL GALLERY */}
      <EnterprisesGallery 
        enterprises={ENTERPRISES} 
        onNavigate={onNavigate} 
        onSelectEnterprise={onSelectEnterprise}
      />

      {/* 3. ABOUT US SECTION (INCLUDES GROUP OVERVIEW, CEO MR. MARK ANTHONY ABITO-SANTOS & CORPORATE STATEMENT) */}
      <AboutUsSection 
        onOpenInquire={() => onOpenInquire()}
        onNavigateToEnterprises={() => onNavigate('enterprises')}
      />


      {/* 6. FEATURED CEO QUOTE HIGHLIGHT CARD */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10 max-w-3xl mx-auto">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#18130a]/95 via-[#120e06]/95 to-[#0a0804]/95 border-2 border-[#D4AF37]/60 shadow-[0_12px_40px_rgba(0,0,0,0.9)] text-center space-y-6 backdrop-blur-xl">
          
          {/* Floating Gold Quote Badge */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-b from-[#FFE082] to-[#B8860B] border-2 border-black flex items-center justify-center shadow-lg">
            <Quote className="w-5 h-5 text-black" />
          </div>

          <p className="text-sm sm:text-base md:text-lg text-neutral-100 italic leading-relaxed font-normal pt-2 px-2">
            {content.ceo_quote}
          </p>

          <div className="space-y-1 pt-2">
            <div className="text-xs sm:text-sm font-black text-[#D4AF37] uppercase tracking-widest font-sans">
              MR. MARK ANTHONY ABITO-SANTOS
            </div>
            <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              PRESIDENT &amp; CEO — ALPHA PREMIER GROUP OPC
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onOpenInquire()}
              className="px-6 py-2.5 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37] border border-[#D4AF37] text-[#D4AF37] hover:text-black font-extrabold text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer"
            >
              Partner With Our Leadership
            </button>
          </div>

        </div>
      </section>

      {/* 7. MISSION & VISION NARRATIVES */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#120E05]/80 border-t border-b border-[#D4AF37]/30 backdrop-blur-md overflow-hidden">
        
        {/* Animated Background Layers */}
        {/* 1. Ambient Pulsing Radial Golden Aura */}
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.25)_0%,_transparent_70%)] blur-3xl pointer-events-none" 
        />

        {/* 2. Slow Rotating Filigree Astrolabe Ring in Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full border border-dashed border-[#D4AF37] flex items-center justify-center"
          >
            <div className="w-[380px] h-[380px] sm:w-[520px] sm:h-[520px] rounded-full border border-[#D4AF37]/60 rotate-45 flex items-center justify-center">
              <div className="w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full border border-dashed border-[#D4AF37]/80" />
            </div>
          </motion.div>
        </div>

        {/* 3. Floating Gold Particles / Shimmer Orbs */}
        <motion.div 
          animate={{ y: [-15, 15, -15], x: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 left-10 w-3 h-3 rounded-full bg-[#D4AF37] shadow-[0_0_15px_#D4AF37] pointer-events-none"
        />
        <motion.div 
          animate={{ y: [20, -20, 20], x: [10, -10, 10], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-16 right-12 w-4 h-4 rounded-full bg-[#D4AF37]/80 shadow-[0_0_20px_#D4AF37] pointer-events-none"
        />
        <motion.div 
          animate={{ y: [-12, 12, -12], opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#FFF3D1] shadow-[0_0_10px_#D4AF37] pointer-events-none"
        />
        <motion.div 
          animate={{ y: [15, -15, 15], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-1/3 left-1/4 w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_12px_#D4AF37] pointer-events-none"
        />

        {/* 4. Sweeping Diagonal Golden Light Beam Effect */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
          className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -skew-x-12 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Section Header: Mission & Vision (Radar Beacon Target Heraldry Archetype) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto py-4"
          >
            {/* Ambient Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.22)_0%,_transparent_75%)] blur-2xl pointer-events-none" />

            {/* Filigree Line Dividers with Side Star Nodes */}
            <div className="flex items-center justify-center w-full max-w-lg gap-3 z-10">
              <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs">❖</span>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>STRATEGIC DIRECTION &amp; PURPOSE</span>
              </div>
              <span className="text-[#D4AF37] text-xs">❖</span>
              <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase font-sans z-10 leading-tight">
              Mission{' '}
              <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                &amp; Vision
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Mission Narrative Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredMissionCard('mission')}
              onMouseLeave={() => setHoveredMissionCard(null)}
              onClick={() => setHoveredMissionCard(hoveredMissionCard === 'mission' ? null : 'mission')}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className={`group relative p-6 sm:p-8 border transition-all duration-300 rounded-2xl shadow-xl flex flex-col justify-between backdrop-blur-md overflow-hidden cursor-pointer space-y-6 ${
                hoveredMissionCard === 'mission'
                  ? 'border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.3)] bg-gradient-to-b from-[#1C1508] via-[#120E05] to-[#0A0803]'
                  : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70 bg-[#120E05]/90'
              }`}
            >
              {/* Gold Shimmer Light Sweep Effect */}
              <motion.div
                initial={{ x: '-120%' }}
                animate={{ x: hoveredMissionCard === 'mission' ? '250%' : '-120%' }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent -skew-x-12 pointer-events-none z-10"
              />

              {/* Corner Filigree Brackets with Hover Scale/Glow */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/60 group-hover:border-[#FFF3D1] group-hover:scale-125 transition-all duration-300" />
              <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/60 group-hover:border-[#FFF3D1] group-hover:scale-125 transition-all duration-300" />
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]/60 group-hover:border-[#FFF3D1] group-hover:scale-125 transition-all duration-300" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/60 group-hover:border-[#FFF3D1] group-hover:scale-125 transition-all duration-300" />

              {/* Dynamic Radial Ambient Backglow on Hover */}
              <div className="absolute -top-16 -left-16 w-52 h-52 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/30 blur-3xl pointer-events-none rounded-full transition-all duration-500 group-hover:scale-125" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3 text-[#D4AF37]">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#FFF3D1] uppercase font-sans tracking-wide transition-colors">
                    Our Mission
                  </h3>
                </div>

                <p className="text-sm text-neutral-300 group-hover:text-neutral-100 leading-relaxed font-normal transition-colors">
                  {content.mission_p1}
                </p>

                {content.mission_p2 ? (
                  <p className="text-sm text-neutral-300 group-hover:text-neutral-100 leading-relaxed font-normal transition-colors">
                    {content.mission_p2}
                  </p>
                ) : (
                <p className="text-sm text-neutral-300 group-hover:text-neutral-100 leading-relaxed font-normal transition-colors">
                  Through our flagship brokerage <strong className="text-white group-hover:text-[#D4AF37] transition-colors">Alpha Premier Realty</strong>, Ortigas Virtual Office, cleaning solutions, creative media, and talent management—we deliver integrated solutions that transform ambitious opportunities into sustainable, long-term success.
                </p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-800 group-hover:border-[#D4AF37]/40 flex items-center justify-between text-xs text-[#D4AF37] group-hover:text-[#FFF3D1] font-bold uppercase tracking-wider relative z-10 transition-colors">
                <span>Integrated Solutions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 text-[#D4AF37] group-hover:text-[#FFF3D1] transition-all duration-300" />
              </div>
            </motion.div>

            {/* Vision Narrative Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredMissionCard('vision')}
              onMouseLeave={() => setHoveredMissionCard(null)}
              onClick={() => setHoveredMissionCard(hoveredMissionCard === 'vision' ? null : 'vision')}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.15 }}
              className={`group relative p-6 sm:p-8 border transition-all duration-300 rounded-2xl shadow-xl flex flex-col justify-between backdrop-blur-md overflow-hidden cursor-pointer space-y-6 ${
                hoveredMissionCard === 'vision'
                  ? 'border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.3)] bg-gradient-to-b from-[#1C1508] via-[#120E05] to-[#0A0803]'
                  : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70 bg-[#120E05]/90'
              }`}
            >
              {/* Gold Shimmer Light Sweep Effect */}
              <motion.div
                initial={{ x: '-120%' }}
                animate={{ x: hoveredMissionCard === 'vision' ? '250%' : '-120%' }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent -skew-x-12 pointer-events-none z-10"
              />

              {/* Corner Filigree Brackets with Hover Scale/Glow */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/60 group-hover:border-[#FFF3D1] group-hover:scale-125 transition-all duration-300" />
              <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/60 group-hover:border-[#FFF3D1] group-hover:scale-125 transition-all duration-300" />
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]/60 group-hover:border-[#FFF3D1] group-hover:scale-125 transition-all duration-300" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/60 group-hover:border-[#FFF3D1] group-hover:scale-125 transition-all duration-300" />

              {/* Dynamic Radial Ambient Backglow on Hover */}
              <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/30 blur-3xl pointer-events-none rounded-full transition-all duration-500 group-hover:scale-125" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3 text-[#D4AF37]">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#FFF3D1] uppercase font-sans tracking-wide transition-colors">
                    Our Vision
                  </h3>
                </div>

                <div className="p-4 bg-black/60 border border-[#D4AF37]/30 group-hover:border-[#D4AF37]/80 group-hover:bg-black/80 rounded-xl transition-all duration-300 shadow-inner">
                  <p className="text-sm text-neutral-200 group-hover:text-[#FFF3D1] leading-relaxed italic font-normal transition-colors">
                    {content.vision_quote}
                  </p>
                </div>

                {content.vision_note ? (
                <p className="text-sm text-neutral-300 group-hover:text-neutral-100 leading-relaxed font-normal transition-colors">
                  {content.vision_note}
                </p>
                ) : (
                <p className="text-sm text-neutral-300 group-hover:text-neutral-100 leading-relaxed font-normal transition-colors">
                  Under the leadership of President &amp; CEO <strong className="text-white group-hover:text-[#D4AF37] transition-colors">Mr. Mark Anthony Abito-Santos</strong>, we continue expanding our nationwide network to serve businesses, developers, investors, and communities across the Philippines.
                </p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-800 group-hover:border-[#D4AF37]/40 flex items-center justify-between text-xs text-[#D4AF37] group-hover:text-[#FFF3D1] font-bold uppercase tracking-wider relative z-10 transition-colors">
                <span>Global Benchmark</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 text-[#D4AF37] group-hover:text-[#FFF3D1] transition-all duration-300" />
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 8. CORE VALUES */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Section Header: Core Values (Honor Award Crest Archetype) */}
        <div className="relative flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto py-4">
          {/* Ambient Radial Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.22)_0%,_transparent_75%)] blur-2xl pointer-events-none" />

          {/* Filigree Line Dividers with Gold Diamond Stars */}
          <div className="flex items-center justify-center w-full max-w-lg gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
            <div className="flex gap-1 text-[#D4AF37] text-xs">
              <span>✦</span>
              <span>✦</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-sans">
              <span>CORPORATE ETHOS &amp; VALUES</span>
            </div>
            <div className="flex gap-1 text-[#D4AF37] text-xs">
              <span>✦</span>
              <span>✦</span>
            </div>
            <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase font-sans z-10 leading-tight">
            Core{' '}
            <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              Values
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {CORE_VALUES.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onMouseEnter={() => setHoveredCoreValue(idx)}
              onMouseLeave={() => setHoveredCoreValue(null)}
              onClick={() => setHoveredCoreValue(hoveredCoreValue === idx ? null : idx)}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group relative p-5 border transition-all duration-300 rounded-2xl flex flex-col justify-between items-center text-center overflow-hidden backdrop-blur-md cursor-pointer ${
                hoveredCoreValue === idx
                  ? 'border-[#D4AF37] bg-gradient-to-b from-[#1C1508] via-[#120E05] to-[#0A0803] shadow-[0_12px_35px_rgba(212,175,55,0.35)]'
                  : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/80 bg-[#120E05]/85 shadow-xl'
              }`}
            >
              {/* Gold Sliding Accent Bar on Left Edge (Career Section Style) */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: hoveredCoreValue === idx ? 1 : 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] rounded-l-2xl origin-top shadow-[0_0_12px_#D4AF37] z-20"
              />

              {/* Shimmer Light Reflection Sweep Effect on Hover */}
              <motion.div
                initial={{ x: '-120%' }}
                animate={{ x: hoveredCoreValue === idx ? '250%' : '-120%' }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent -skew-x-12 pointer-events-none z-10"
              />

              {/* Corner Filigree Brackets */}
              <div className={`absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 transition-all duration-300 ${
                hoveredCoreValue === idx ? 'border-[#FFF3D1] scale-125' : 'border-[#D4AF37]/50'
              }`} />
              <div className={`absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 transition-all duration-300 ${
                hoveredCoreValue === idx ? 'border-[#FFF3D1] scale-125' : 'border-[#D4AF37]/50'
              }`} />
              <div className={`absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 transition-all duration-300 ${
                hoveredCoreValue === idx ? 'border-[#FFF3D1] scale-125' : 'border-[#D4AF37]/50'
              }`} />
              <div className={`absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 transition-all duration-300 ${
                hoveredCoreValue === idx ? 'border-[#FFF3D1] scale-125' : 'border-[#D4AF37]/50'
              }`} />

              <div className="space-y-3 flex flex-col items-center relative z-10 w-full py-1">
                <h3 className={`text-xs sm:text-sm font-bold tracking-wider uppercase font-sans transition-colors duration-300 ${
                  hoveredCoreValue === idx ? 'text-[#FFF3D1]' : 'text-white'
                }`}>
                  {val.name}
                </h3>

                {/* Subtitle / Description - Hidden by default, reveals on hover */}
                <motion.div
                  initial={false}
                  animate={{
                    height: hoveredCoreValue === idx ? 'auto' : 0,
                    opacity: hoveredCoreValue === idx ? 1 : 0,
                  }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden w-full"
                >
                  <p className="text-sm leading-relaxed font-sans font-normal text-neutral-200 pt-1">
                    {val.description}
                  </p>
                </motion.div>
              </div>

              <div className={`h-0.5 transition-all duration-300 rounded-full relative z-10 mt-2 ${
                hoveredCoreValue === idx ? 'bg-[#FFF3D1] w-12 shadow-[0_0_10px_#D4AF37]' : 'bg-[#D4AF37]/40 w-8'
              }`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 10. CALL TO ACTION BANNER */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 pb-16">
        <div className="p-8 sm:p-10 bg-[#120E05]/90 border border-[#D4AF37]/40 rounded-2xl shadow-2xl text-center space-y-5 backdrop-blur-md">
          <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
            Ready to Partner With Alpha Premier Group?
          </h2>
          <p className="text-sm text-neutral-300 font-normal leading-relaxed max-w-xl mx-auto">
            Contact us today to explore commercial property listings, Ortigas virtual office packages, corporate support, or strategic business solutions.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onOpenInquire()}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#FFDF73] text-black font-extrabold text-xs tracking-widest uppercase transition-all duration-300 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Inquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};


