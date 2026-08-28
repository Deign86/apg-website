import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab } from '../types';
import { ENTERPRISES, CORE_VALUES, PROPERTY_TYPES } from '../data/companyData';
const landingPageImg = '/assets/images/landingpage.png';
const heroVideoSrc = '/assets/videos/alpha-premier-group.mp4';
const apgLogo = '/assets/images/apgopc.png';
import { EnterprisesGallery } from '../components/redesign/EnterprisesGallery';
import { AboutUsSection } from '../components/redesign/AboutUsSection';
import { SeamlessHeroVideo } from '../components/redesign/SeamlessHeroVideo';
import { 
  Building2, Building, TrendingUp, Store, Briefcase, Package, 
  ShieldCheck, Film, Sparkles, HardHat, Users, Star, Handshake, 
  Lightbulb, Shield, Columns, ArrowRight, ChevronRight, CheckCircle2,
  DollarSign, Award, Target, HelpCircle, Plus, Minus, Quote, Crown, Compass,
  Eye, Rocket, Globe, Zap, Check, ChevronDown
} from 'lucide-react';

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
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hoveredMissionCard, setHoveredMissionCard] = useState<string | null>(null);
  const [hoveredCoreValue, setHoveredCoreValue] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<number>(0);

  const getIcon = (iconName: string, sizeClass = "w-5 h-5 text-[#D4AF37]") => {
    switch (iconName) {
      case 'Building2': return <Building2 className={sizeClass} />;
      case 'Building': return <Building className={sizeClass} />;
      case 'TrendingUp': return <TrendingUp className={sizeClass} />;
      case 'Store': return <Store className={sizeClass} />;
      case 'Briefcase': return <Briefcase className={sizeClass} />;
      case 'Package': return <Package className={sizeClass} />;
      case 'ShieldCheck': return <ShieldCheck className={sizeClass} />;
      case 'Film': return <Film className={sizeClass} />;
      case 'Sparkles': return <Sparkles className={sizeClass} />;
      case 'HardHat': return <HardHat className={sizeClass} />;
      case 'Users': return <Users className={sizeClass} />;
      case 'Star': return <Star className={sizeClass} />;
      case 'Handshake': return <Handshake className={sizeClass} />;
      case 'Lightbulb': return <Lightbulb className={sizeClass} />;
      case 'Shield': return <Shield className={sizeClass} />;
      case 'Columns': return <Columns className={sizeClass} />;
      default: return <Building className={sizeClass} />;
    }
  };

  const faqItems = [
    {
      q: "How can businesses or investors partner with Alpha Premier Group?",
      a: "Alpha Premier Group OPC operates as a parent holding enterprise across real estate, corporate workspaces, facility management, and creative media. You can partner with us through commercial property leasing, joint venture development, virtual office subscriptions, or custom enterprise solutions by clicking 'Inquire Now'."
    },
    {
      q: "What specialized services does Alpha Premier Realty offer?",
      a: "Our flagship brokerage specializes in high-end commercial, industrial, residential, and agricultural real estate transactions nationwide—providing end-to-end site acquisition, tenant representation, and investment portfolio advisory."
    },
    {
      q: "What is included in the Ortigas Virtual Office solution?",
      a: "Ortigas Virtual Office offers prestigious corporate business addresses, mail handling, administrative support, local telephone line forwarding, and fully equipped meeting room access tailored for modern agile enterprises."
    },
    {
      q: "How can candidates apply for careers across APG enterprises?",
      a: "Visit our dedicated Careers section to view active openings across real estate, corporate administration, virtual management, creative design, and technical engineering. Applications can be submitted directly through our digital portal."
    }
  ];

  return (
    <div className="bg-transparent text-neutral-100 font-sans selection:bg-[#D4AF37] selection:text-neutral-950">
      
      {/* 1. HERO SECTION / LANDING PAGE */}
      <section className="relative min-h-[75vh] sm:min-h-[80vh] flex flex-col justify-start pt-6 sm:pt-10 pb-10 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30 overflow-hidden">
        
        {/* Seamless Video Background with luxury overlay */}
        <SeamlessHeroVideo
          src={heroVideoSrc}
          poster={landingPageImg}
          crossfadeDuration={1.2}
          overlayClassName="bg-gradient-to-b from-[#181207]/75 via-[#120E05]/55 to-[#1C1509]/92"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 pt-2 my-0">
          
          {/* Company Logo */}
          <div className="flex justify-center items-center pb-1">
            <img 
              src={apgLogo} 
              alt="Alpha Premier Group of Companies" 
              className="h-40 sm:h-56 md:h-68 lg:h-76 max-w-full w-auto object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* Main Tagline Headline */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight animate-gold-slide drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] uppercase">
            Where Connections Grow Into Success
          </h1>

          {/* Subtext Quote */}
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-neutral-200 font-normal italic leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] px-4">
            "We don't just close deals. We bring visions to life. We don't just offer services. We design solutions that transform opportunities into realities."
          </p>

        </div>

      </section>

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

      {/* 4. SECTOR & PROPERTY PORTFOLIO */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
        {/* Animated Background Ambience */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated Floating Gold Glow Orb 1 */}
          <motion.div
            animate={{
              x: [0, 40, -40, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.15, 0.95, 1],
              opacity: [0.25, 0.45, 0.25]
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 -left-20 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.3)_0%,_transparent_70%)] blur-3xl rounded-full"
          />

          {/* Animated Floating Gold Glow Orb 2 */}
          <motion.div
            animate={{
              x: [0, -50, 50, 0],
              y: [0, 35, -35, 0],
              scale: [1, 0.9, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-10 -right-20 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.25)_0%,_transparent_70%)] blur-3xl rounded-full"
          />

          {/* Floating Gold Sparkle Stars */}
          <motion.div
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-12 left-1/4 text-[#D4AF37]/40 text-xs"
          >
            ✦
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-16 right-1/3 text-[#D4AF37]/40 text-sm"
          >
            ✦
          </motion.div>
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-1/2 right-12 text-[#FFF3D1]/30 text-xs"
          >
            ✧
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Section Header: Strategic Asset Categories (Astrolabe Astrodome Archetype) */}
          <div className="relative flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto py-4">
            {/* Ambient Radial Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.22)_0%,_transparent_75%)] blur-2xl pointer-events-none" />

            {/* Filigree Line Dividers with Star Diamond Nodes */}
            <div className="flex items-center justify-center w-full max-w-lg gap-3 z-10">
              <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs">✦</span>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                <Columns className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>CORE SOLUTIONS // PORTFOLIO</span>
              </div>
              <span className="text-[#D4AF37] text-xs">✦</span>
              <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
            </div>

            {/* Main Title - Multi-tone Gold Gradient Typography */}
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase font-sans z-10 leading-tight">
              Strategic Asset{' '}
              <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                Categories
              </span>
            </h2>
          </div>

          {/* Architectural Accordion Blades Layout (Interactive Expandable Columns on Desktop) */}
          <div className="hidden lg:flex gap-3.5 h-[440px] w-full items-stretch">
            {PROPERTY_TYPES.map((pt, idx) => {
              const isHovered = hoveredCategory === idx;
              const detailsMap: Record<string, { badge: string; tags: string[] }> = {
                realty: { badge: 'Flagship Division', tags: ['PEZA Accredited', 'High-End Residential', 'Strategic Brokerage'] },
                condo: { badge: 'Vertical Living', tags: ['CBD Skylines', 'Penthouse Suites', 'High Rental Yield'] },
                investment: { badge: 'Portfolio Growth', tags: ['Capital Growth', 'Joint Venture', 'Asset Advisory'] },
                commercial: { badge: 'Retail & Showrooms', tags: ['Prime Retail Hubs', 'Commercial Arcades', 'Turnkey Fit-Outs'] },
                office: { badge: 'Corporate Hubs', tags: ['Grade A PEZA', 'Virtual Workspaces', 'Fiber Ready'] },
                warehouse: { badge: 'Industrial Logistics', tags: ['Cold Storage', 'Logistics Parks', 'Heavy Cargo Access'] }
              };
              const detail = detailsMap[pt.id] || { badge: 'Asset Division', tags: [] };

              return (
                <motion.div
                  key={pt.id}
                  onMouseEnter={() => setHoveredCategory(idx)}
                  onClick={() => onNavigate('enterprises')}
                  layout
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className={`relative rounded-2xl border cursor-pointer overflow-hidden backdrop-blur-md flex flex-col justify-between transition-all duration-500 ${
                    isHovered
                      ? 'flex-[3.5] border-[#D4AF37] bg-gradient-to-b from-[#1E170A]/95 via-[#140F06]/95 to-[#0A0803]/95 p-7 shadow-[0_0_35px_rgba(212,175,55,0.35)] ring-1 ring-[#D4AF37]/50'
                      : 'flex-1 border-[#D4AF37]/30 hover:border-[#D4AF37]/70 bg-[#120E05]/90 p-5 hover:bg-[#1A1408]'
                  }`}
                >
                  {/* Filigree Corner Accent Brackets */}
                  <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37]/50 group-hover:border-[#FFF3D1] transition-colors" />
                  <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37]/50 group-hover:border-[#FFF3D1] transition-colors" />
                  <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37]/50 group-hover:border-[#FFF3D1] transition-colors" />
                  <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37]/50 group-hover:border-[#FFF3D1] transition-colors" />

                  {/* Dynamic Shimmer Radial Backglow */}
                  <div className={`absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/20 blur-3xl pointer-events-none rounded-full transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                  {/* Header Row: Division Tag & Number */}
                  <div className="flex items-center justify-between relative z-10 w-full">
                    <div className="flex items-center gap-3">
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[10px] font-mono font-bold tracking-wider text-[#FFF3D1] uppercase whitespace-nowrap"
                        >
                          {detail.badge}
                        </motion.span>
                      )}
                    </div>

                    <span className={`font-mono text-xs font-bold transition-colors ${isHovered ? 'text-[#FFF3D1]' : 'text-[#D4AF37]/60'}`}>
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Content when Expanded vs Collapsed Column */}
                  {isHovered ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="space-y-4 relative z-10 my-auto"
                    >
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-sans tracking-wide">
                        {pt.name}
                      </h3>
                      <p className="text-xs text-neutral-200 leading-relaxed font-sans font-normal line-clamp-4">
                        {pt.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {detail.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-md bg-black/70 border border-[#D4AF37]/35 text-[10px] font-medium text-neutral-100 flex items-center gap-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-4 py-8">
                      <p className="text-xs sm:text-sm font-bold text-neutral-300 uppercase font-sans tracking-widest [writing-mode:vertical-lr] rotate-180 whitespace-nowrap transition-colors group-hover:text-[#D4AF37]">
                        {pt.name}
                      </p>
                    </div>
                  )}

                  {/* Bottom Footer Action Indicator */}
                  <div className="flex items-center justify-between text-xs text-[#D4AF37] font-bold uppercase tracking-wider relative z-10 w-full pt-3 border-t border-neutral-800/80">
                    {isHovered ? (
                      <>
                        <span className="text-[#FFF3D1]">Explore Division</span>
                        <ArrowRight className="w-4 h-4 text-[#FFF3D1] translate-x-1.5 transition-transform" />
                      </>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#D4AF37]/60 mx-auto" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Accordion Ribbon Stack (< lg screens) */}
          <div className="flex lg:hidden flex-col gap-3">
            {PROPERTY_TYPES.map((pt, idx) => {
              const isExpanded = hoveredCategory === idx;
              const detailsMap: Record<string, { badge: string; tags: string[] }> = {
                realty: { badge: 'Flagship Division', tags: ['PEZA Accredited', 'High-End Residential', 'Strategic Advisory'] },
                condo: { badge: 'Vertical Living', tags: ['CBD Skylines', 'Penthouse Suites', 'High Yield'] },
                investment: { badge: 'Portfolio Growth', tags: ['Capital Growth', 'Joint Venture', 'Asset Mgmt'] },
                commercial: { badge: 'Retail & Showrooms', tags: ['Prime Retail', 'Commercial Arcades', 'Fit-Outs'] },
                office: { badge: 'Corporate Hubs', tags: ['Grade A PEZA', 'Virtual Office', 'Fiber Ready'] },
                warehouse: { badge: 'Industrial Logistics', tags: ['Cold Storage', 'Logistics Parks', '24/7 Access'] }
              };
              const detail = detailsMap[pt.id] || { badge: 'Asset Division', tags: [] };

              return (
                <div
                  key={pt.id}
                  onClick={() => setHoveredCategory(isExpanded ? -1 : idx)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md cursor-pointer overflow-hidden ${
                    isExpanded
                      ? 'border-[#D4AF37] bg-gradient-to-b from-[#1C1508] via-[#120E05] to-[#0A0803] shadow-[0_0_25px_rgba(212,175,55,0.25)]'
                      : 'border-[#D4AF37]/30 bg-[#120E05]/90 hover:border-[#D4AF37]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider block">
                          0{idx + 1} &bull; {detail.badge}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white uppercase font-sans">
                          {pt.name}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#FFF3D1]' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden space-y-3 pt-4 border-t border-neutral-800/80 mt-3"
                      >
                        <p className="text-xs text-neutral-200 leading-relaxed">
                          {pt.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {detail.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="px-2.5 py-1 rounded bg-black/70 border border-[#D4AF37]/30 text-[10px] text-neutral-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('enterprises');
                          }}
                          className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-neutral-950 font-extrabold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <span>Explore {pt.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>



      {/* 6. FEATURED CEO QUOTE HIGHLIGHT CARD */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10 max-w-3xl mx-auto">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#18130a]/95 via-[#120e06]/95 to-[#0a0804]/95 border-2 border-[#D4AF37]/60 shadow-[0_12px_40px_rgba(0,0,0,0.9)] text-center space-y-6 backdrop-blur-xl">
          
          {/* Floating Gold Quote Badge */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-b from-[#FFE082] to-[#B8860B] border-2 border-black flex items-center justify-center shadow-lg">
            <Quote className="w-5 h-5 text-black" />
          </div>

          <p className="text-sm sm:text-base md:text-lg text-neutral-100 italic leading-relaxed font-normal pt-2 px-2">
            "No matter where your enterprise stands today, we are prepared to build greater possibilities together and transform ambitious opportunities into enduring realities."
          </p>

          <div className="space-y-1 pt-2">
            <div className="text-xs sm:text-sm font-black text-[#D4AF37] uppercase tracking-widest font-sans">
              MR. MARK ANTHONY ABITO-SANTOS
            </div>
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
              PRESIDENT &amp; CEO — ALPHA PREMIER GROUP OPC
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onOpenInquire()}
              className="px-6 py-2.5 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37] border border-[#D4AF37] text-[#D4AF37] hover:text-black font-extrabold text-[11px] tracking-widest uppercase transition-all duration-300 cursor-pointer"
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
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-sans">
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

                <p className="text-xs sm:text-sm text-neutral-300 group-hover:text-neutral-100 leading-relaxed font-normal transition-colors">
                  Alpha Premier Group of Companies is a diversified Philippine-based business group serving as the parent organization for premier companies across real estate, virtual workspaces, construction, facility services, and corporate support.
                </p>

                <p className="text-xs sm:text-sm text-neutral-300 group-hover:text-neutral-100 leading-relaxed font-normal transition-colors">
                  Through our flagship brokerage <strong className="text-white group-hover:text-[#D4AF37] transition-colors">Alpha Premier Realty</strong>, Ortigas Virtual Office, cleaning solutions, creative media, and talent management—we deliver integrated solutions that transform ambitious opportunities into sustainable, long-term success.
                </p>
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
                  <p className="text-xs sm:text-sm text-neutral-200 group-hover:text-[#FFF3D1] leading-relaxed italic font-normal transition-colors">
                    "To become a leading and globally recognized Philippine business group, setting the benchmark in real estate brokerage, corporate workspace services, and diversified enterprise solutions."
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 group-hover:text-neutral-100 leading-relaxed font-normal transition-colors">
                  Under the leadership of President &amp; CEO <strong className="text-white group-hover:text-[#D4AF37] transition-colors">Mr. Mark Anthony Abito-Santos</strong>, we continue expanding our nationwide network to serve businesses, developers, investors, and communities across the Philippines.
                </p>
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
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-sans">
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
                  <p className="text-[11px] leading-relaxed font-sans font-normal text-neutral-200 pt-1">
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
          <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-xl mx-auto">
            Contact us today to explore commercial property listings, Ortigas virtual office packages, corporate support, or strategic business solutions.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onOpenInquire()}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#FFDF73] text-black font-extrabold text-xs tracking-widest uppercase transition-all duration-300 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Get In Touch With Us</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};


