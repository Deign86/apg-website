import React from 'react';
import { 
  ShieldCheck, 
  Trophy, 
  Users, 
  Globe, 
  Star, 
  ArrowRight, 
  Percent, 
  Building2, 
  Briefcase, 
  Warehouse, 
  Sparkles, 
  Gift,
  HeartHandshake,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Home,
  Monitor,
  CheckCircle2,
  Mail,
  Phone,
  Wifi,
  Tv
} from 'lucide-react';
import AlphaPremierLogo from './AlphaPremierLogo';

// Interactive Spaces Showcase Data
const SPACES_DATA = [
  {
    id: 'weekly-deals',
    tabLabel: 'Weekly Deals',
    badge: 'Limited Spotlight',
    title: 'Weekly Deals',
    description: 'Save up to 42% on our select eco-friendly properties, FREE consultation available. Plus, flexible payment terms.',
    bonusText: 'Earn special bonuses with every lease signed — whether for warehouses, or commercial units.',
    image: '/images/weekly-deals.jpg',
    icon: 'Percent'
  },
  {
    id: 'warehouse',
    tabLabel: 'Warehouse',
    badge: 'Logistics Storage',
    title: 'Warehouse',
    description: 'Spacious warehouses ideal for storage, inventory, and efficient logistics operations.',
    bonusText: 'Earn special bonuses with every lease signed — whether for warehouses, or commercial units.',
    image: '/images/ware.jpg',
    icon: 'Warehouse'
  },
  {
    id: 'condominium',
    tabLabel: 'Condominium',
    badge: 'Premium Living',
    title: 'Condominium',
    description: 'Luxurious condominiums offering comfort and convenience in premium locations.',
    bonusText: 'Earn special bonuses with every lease signed — whether for virtual offices, warehouses, or commercial units.',
    image: '/images/condo.jpg',
    icon: 'Building2'
  },
  {
    id: 'office-spaces',
    tabLabel: 'Office Spaces',
    badge: 'Collaboration Hub',
    title: 'Office Spaces',
    description: 'Modern office spaces designed to boost productivity and collaboration for all team sizes.',
    bonusText: 'Earn special bonuses with every lease signed — whether for virtual offices, warehouses, or commercial units.',
    image: '/images/office.jpg',
    icon: 'Sparkles'
  },
  {
    id: 'commercial-space',
    tabLabel: 'Commercial Space',
    badge: 'Retail Growth',
    title: 'Commercial Space',
    description: 'Commercial spaces tailored for retail or service-based businesses looking to expand visibility and reach.',
    bonusText: 'Earn special bonuses with every lease signed — whether for virtual offices, warehouses, or commercial units.',
    image: '/images/commercial.jpg',
    icon: 'Building2'
  }
];

interface HomeSectionProps {
  onLearnStory: () => void;
  onExploreExpertise: () => void;
  onInquireClick?: (propertyTitle?: string, propertyId?: string) => void;
}

export default function HomeSection({ onLearnStory, onExploreExpertise, onInquireClick }: HomeSectionProps) {
  const [activeSpaceIndex, setActiveSpaceIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [spotlight, setSpotlight] = React.useState({ x: -1000, y: -1000 });

  // Window-level Mouse Spotlight tracking in viewport pixels
  React.useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      setSpotlight({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, []);

  // Auto-rotation with robust timestamp tracking
  React.useEffect(() => {
    setProgress(0);
    const duration = 3000; // 3 seconds duration per space
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(calculatedProgress);

      if (elapsed >= duration) {
        setActiveSpaceIndex((curr) => (curr + 1) % SPACES_DATA.length);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [activeSpaceIndex]);

  const activeSpace = SPACES_DATA[activeSpaceIndex];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Percent': return <Percent className="w-4 h-4 text-[#c5a85c]" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-[#c5a85c]" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4 text-[#c5a85c]" />;
      case 'Warehouse': return <Warehouse className="w-4 h-4 text-[#c5a85c]" />;
      default: return <Sparkles className="w-4 h-4 text-[#c5a85c]" />;
    }
  };

  const handleScrollToSecondSection = () => {
    const el = document.getElementById('about-and-spaces-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-transparent relative" id="home-section">
      {/* Dynamic Ambient Gold Cursor Spotlight */}
      <div 
        className="fixed inset-0 pointer-events-none z-30 transition-all duration-75 ease-out hidden md:block" 
        style={{ 
          background: `radial-gradient(circle 380px at ${spotlight.x}px ${spotlight.y}px, rgba(197, 168, 92, 0.14) 0%, rgba(197, 168, 92, 0.04) 45%, transparent 75%)` 
        }} 
      />

      {/* 1. HERO VIEW */}
      <section 
        className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `radial-gradient(ellipse at center, rgba(197, 168, 92, 0.12) 0%, rgba(6,7,10,0.50) 50%, rgba(2,2,3,0.85) 85%, #020203 100%), url('/images/realty-bg-gold.png')`
        }}
      >
        <div className="absolute inset-0 bg-[#06070a]/35 backdrop-brightness-90" />
        <div className="absolute bottom-0 inset-x-0 h-36 md:h-52 bg-gradient-to-b from-transparent via-[#020203]/60 to-[#020203] pointer-events-none z-0" />
        
        <div className="relative z-10 max-w-6xl w-full flex flex-col items-center gap-6 sm:gap-8 animate-fade-in px-2">
          {/* Main Gold Emblem Logo matching user selected element */}
          <div className="flex flex-col items-center transform hover:scale-[1.02] transition-transform duration-500">
            <AlphaPremierLogo className="h-44 sm:h-56 md:h-64 lg:h-72 w-auto drop-shadow-[0_12px_35px_rgba(197,168,92,0.2)]" />
          </div>

          <h2 className="text-sm sm:text-lg md:text-2xl lg:text-3xl text-white font-sans font-light tracking-[0.04em] mt-3 sm:mt-5 text-center leading-relaxed max-w-4xl mx-auto">
            <span>Connecting You to <span className="text-[#c5a85c] font-semibold">Alpha Premier</span>,</span>
            <br />
            <span className="text-white/95 font-normal">Building What Matters.</span>
          </h2>

          {/* Dual Hero CTA Buttons — Minimalist Rectangular Single Line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 sm:mt-8 w-full max-w-lg">
            <button
              onClick={handleScrollToSecondSection}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#c5a85c] hover:bg-[#d4b568] text-[#06070a] font-sans font-bold text-xs tracking-[0.25em] uppercase rounded-none shadow-[0_0_20px_rgba(197,168,92,0.35)] hover:shadow-[0_0_30px_rgba(197,168,92,0.55)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap group shrink-0"
            >
              <span>EXPLORE SPACES</span>
              <ArrowRight className="w-4 h-4 text-[#06070a] group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              onClick={() => onInquireClick ? onInquireClick() : onExploreExpertise()}
              className="w-full sm:w-auto px-7 py-3.5 bg-black/50 backdrop-blur-md border border-[#c5a85c]/60 hover:border-[#c5a85c] text-[#c5a85c] hover:text-white hover:bg-[#c5a85c]/10 font-sans font-semibold text-xs tracking-[0.25em] uppercase rounded-none hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>INQUIRE NOW</span>
            </button>
          </div>

          {/* Elegant Scroll Down Indicator */}
          <button
            onClick={handleScrollToSecondSection}
            className="mt-8 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
            title="Scroll Down"
          >
            <svg className="w-6 h-6 text-[#c5a85c] mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </section>

      {/* 2. ABOUT US & CURATED SPACES SIDE-BY-SIDE SECTION */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto" id="about-and-spaces-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Curated Premium Spaces Portfolio (the styled box) */}
          <div 
            className="bg-black/35 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:-translate-y-1.5 hover:border-[#c5a85c]/40 hover:shadow-[0_20px_45px_rgba(197,168,92,0.2)] transition-all duration-500 flex flex-col justify-between relative overflow-hidden group" 
            id="spaces-folder-body"
          >
            {/* Fine architectural dot background grid overlay inside folder */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#c5a85c_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6 h-full justify-between">
              
              {/* 1. Title at the top */}
              <div className="flex flex-col items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-[#c5a85c] bg-[#c5a85c]/10 border border-[#c5a85c]/25 uppercase">
                  {activeSpace.badge}
                </span>
                <h3 className="text-2xl md:text-3xl font-sans font-medium text-white tracking-wide">
                  {activeSpace.tabLabel}
                </h3>
                {/* Unique Gold Diamond Divider Line */}
                <div className="flex items-center justify-center gap-2.5 my-2">
                  <div className="h-[1.5px] w-8 bg-gradient-to-l from-[#c5a85c] to-transparent" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
                  <div className="h-[1.5px] w-8 bg-gradient-to-r from-[#c5a85c] to-transparent" />
                </div>
              </div>

              {/* 2. Image in the middle - square shape with side margins */}
              <div className="w-full max-w-xs sm:max-w-sm mx-auto border border-white/10 p-1.5 bg-[#06070a] rounded-xl shadow-xl relative overflow-hidden">
                {/* Subtle golden corner decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#c5a85c]/40 z-20" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#c5a85c]/40 z-20" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#c5a85c]/40 z-20" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#c5a85c]/40 z-20" />
                
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                  {SPACES_DATA.map((space, idx) => {
                    const isActive = idx === activeSpaceIndex;
                    return (
                      <img 
                        key={space.id}
                        src={space.image}
                        alt={space.title}
                        className={`absolute inset-0 w-full h-full object-cover rounded-lg filter brightness-95 contrast-105 transition-all duration-700 ease-in-out ${
                          isActive 
                            ? 'opacity-100 scale-100 z-10' 
                            : 'opacity-0 scale-105 z-0 pointer-events-none'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 3. Description below the image */}
              <div className="max-w-2xl flex flex-col items-center gap-4 w-full mt-auto">
                <p className="text-white/90 text-sm md:text-base leading-relaxed font-sans font-medium">
                  {activeSpace.description}
                </p>

                <p className="text-white/60 text-xs md:text-sm leading-relaxed font-sans font-light max-w-xl">
                  {activeSpace.bonusText}
                </p>

                {/* Interactive Circular Progress Dot Controls */}
                <div className="flex justify-center items-center gap-2.5 mt-4" id="spaces-capsule-progress-dots">
                  {SPACES_DATA.map((space, idx) => {
                    const isActive = activeSpaceIndex === idx;
                    return (
                      <button
                        key={space.id}
                        id={`space-dot-${space.id}`}
                        onClick={() => {
                          setActiveSpaceIndex(idx);
                          setProgress(0);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                          isActive 
                            ? 'bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] scale-110' 
                            : 'bg-white/20 hover:bg-white/40'
                        }`}
                        title={space.tabLabel}
                        aria-label={`Go to ${space.tabLabel}`}
                      />
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Alpha Premier Realty / Partner in Property Success */}
          <div 
            className="flex flex-col justify-between text-left h-full py-2"
            id="about-us-container"
          >
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.35em] uppercase mb-2 block">
                  ALPHA PREMIER GROUP
                </span>
                <h2 className="text-2xl md:text-3xl font-sans font-light text-white tracking-wide leading-snug">
                  Your Nationwide Partner in <span className="text-[#c5a85c] font-semibold">Property Success</span>
                </h2>
                <div className="flex items-center gap-2.5 mt-4 mb-4">
                  <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
                  <div className="h-[1.5px] w-20 bg-gradient-to-r from-[#c5a85c] via-[#c5a85c]/50 to-transparent" />
                  <div className="w-1 h-1 rounded-full bg-[#c5a85c]/60" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-white/90 text-sm md:text-base leading-relaxed font-sans font-light">
                  Providing full-spectrum real estate advisory, high-yield asset acquisition, and strategic leasing solutions tailored for investors, developers, and corporate clients nationwide.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c]" />
                    <span>Prime Commercial Lots</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c]" />
                    <span>Logistics & Warehousing</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c]" />
                    <span>Luxury Residences</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c]" />
                    <span>Transparent Brokerage</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shaking Hands Image below the text - square shape with side margins */}
            <div className="w-full max-w-xs sm:max-w-sm mx-auto mt-6 border border-white/10 p-1.5 bg-[#06070a] rounded-xl shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#c5a85c]/40 z-10" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#c5a85c]/40 z-10" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#c5a85c]/40 z-10" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#c5a85c]/40 z-10" />
              
              <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                <img 
                  src="/images/realty-handshake.png" 
                  alt="Alpha Premier Luxury Handshake"
                  className="w-full h-full object-cover object-center rounded-lg filter brightness-105 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2.5. ABOUT US (ALPHA PREMIER REALTY CORNERSTONE) SECTION */}
      <section className="py-12 sm:py-16 md:py-24 bg-black/15 border-t border-b border-white/5 relative overflow-hidden" id="about-us-section">
        {/* Decorative background gradients */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#c5a85c]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[#c5a85c]/3 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Side: Stunning Premium Real Estate Photo */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#c5a85c]/30 to-transparent rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
              
              <div className="relative border border-white/10 p-2 bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Thin elegant gold corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#c5a85c]/60 z-10" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#c5a85c]/60 z-10" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#c5a85c]/60 z-10" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#c5a85c]/60 z-10" />
                
                <img 
                  src="/images/wall2025.png" 
                  alt="Alpha Premier Realty Architectural Excellence"
                  className="w-full h-[320px] md:h-[420px] object-cover rounded-xl filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </div>

              {/* Float decorative brand accent badge */}
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-[#12131a] to-[#08090c] border border-[#c5a85c]/40 px-5 py-4 rounded-xl shadow-2xl hidden md:flex items-center gap-3 backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg bg-[#c5a85c]/10 flex items-center justify-center border border-[#c5a85c]/30">
                  <ShieldCheck className="w-5 h-5 text-[#c5a85c]" />
                </div>
                <div className="text-left">
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Premier Quality</p>
                  <p className="text-white/40 text-[10px] uppercase font-sans">Trusted Property Solutions</p>
                </div>
              </div>
            </div>

            {/* Right Side: Elaborated Content with Premium Features */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div>
                <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.4em] uppercase mb-2 block">
                  ABOUT US
                </span>
                <h2 className="text-3xl md:text-4xl font-sans font-light text-white tracking-wide leading-snug">
                  Alpha Premier <span className="text-[#c5a85c] font-semibold">Realty</span>
                </h2>
                <div className="flex items-center gap-2.5 mt-4">
                  <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
                  <div className="h-[1.5px] w-24 bg-gradient-to-r from-[#c5a85c] via-[#c5a85c]/50 to-transparent" />
                  <div className="w-1 h-1 rounded-full bg-[#c5a85c]/60" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-white/90 text-sm md:text-base leading-relaxed font-sans font-light">
                  Delivering smart, strategic, and client-focused real estate solutions across prime CBDs and economic zones in the Philippines. From Grade A office spaces and logistics hubs to upscale residential estates.
                </p>
              </div>

              {/* High-fidelity nice elements grid */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4 mt-4">
                
                {/* Element 1: Market Expertise */}
                <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-[#c5a85c]/30 hover:bg-white/[0.06] transition-all duration-300 flex flex-col justify-between text-left h-full shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-2">
                      <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-[#c5a85c]" />
                      </div>
                      <h4 className="text-white text-[9px] sm:text-xs md:text-xs lg:text-sm font-semibold uppercase tracking-wider leading-tight">
                        Expertise
                      </h4>
                    </div>
                    <p className="text-white/50 text-[8px] sm:text-[10px] md:text-[11px] leading-tight sm:leading-relaxed font-sans font-light">
                      Advanced analytical tracking and localized real estate insights.
                    </p>
                  </div>
                </div>

                {/* Element 2: Innovation */}
                <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-[#c5a85c]/30 hover:bg-white/[0.06] transition-all duration-300 flex flex-col justify-between text-left h-full shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-2">
                      <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#c5a85c]" />
                      </div>
                      <h4 className="text-white text-[9px] sm:text-xs md:text-xs lg:text-sm font-semibold uppercase tracking-wider leading-tight">
                        Innovation
                      </h4>
                    </div>
                    <p className="text-white/50 text-[8px] sm:text-[10px] md:text-[11px] leading-tight sm:leading-relaxed font-sans font-light">
                      Cutting-edge virtual touring and dynamic listing strategies.
                    </p>
                  </div>
                </div>

                {/* Element 3: Client Focus */}
                <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-[#c5a85c]/30 hover:bg-white/[0.06] transition-all duration-300 flex flex-col justify-between text-left h-full shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-2">
                      <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#c5a85c]" />
                      </div>
                      <h4 className="text-white text-[9px] sm:text-xs md:text-xs lg:text-sm font-semibold uppercase tracking-wider leading-tight">
                        Client-Focused
                      </h4>
                    </div>
                    <p className="text-white/50 text-[8px] sm:text-[10px] md:text-[11px] leading-tight sm:leading-relaxed font-sans font-light">
                      Unwavering commitment and dynamic strategic representation.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SERVICES OFFERED SECTION */}
      <section className="py-16 sm:py-24 md:py-32 bg-transparent border-t border-white/5 relative overflow-hidden animate-fade-in" id="services-offered-section">
        {/* Delicate background blur */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#c5a85c]/3 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="hidden sm:block h-[1px] w-8 sm:w-12 bg-gradient-to-l from-[#c5a85c]/60 to-transparent" />
              <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.4em] uppercase block">
                OUR CAPABILITIES
              </span>
              <div className="hidden sm:block h-[1px] w-8 sm:w-12 bg-gradient-to-r from-[#c5a85c]/60 to-transparent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-sans font-light text-white tracking-wide">
              Services <span className="text-[#c5a85c] font-semibold">Offered</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-[#c5a85c] to-transparent" />
              <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_10px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
              <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-[#c5a85c] to-transparent" />
            </div>
          </div>


          <div 
            className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 md:grid md:grid-cols-4 md:gap-5 w-full pb-2 md:pb-0 scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" 
            id="services-grid"
          >
            
            {/* Service 1: Commercial Lots & Office Buildings */}
            <div className="flex-none w-[80vw] max-w-[320px] sm:w-[280px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/45 hover:bg-black/50 hover:shadow-[0_12px_30px_rgba(197,168,92,0.05)] transition-all duration-500 flex flex-col justify-between group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 mb-2 sm:mb-3 min-h-[52px] sm:min-h-[56px] md:min-h-[64px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center text-[#c5a85c] group-hover:bg-[#c5a85c]/20 transition-all duration-300 shrink-0">
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h3 className="text-[11px] sm:text-xs md:text-sm lg:text-base font-sans font-semibold text-white tracking-wider uppercase leading-tight">
                    Commercial Lots & Office Buildings
                  </h3>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm leading-relaxed font-sans font-light min-h-[72px] sm:min-h-[84px] md:min-h-[96px]">
                  Strategic commercial lots and prime office spaces in key business zones. Selected for accessibility, high growth potential, and prestige to elevate your brand and drive operational growth.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/5">
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium text-white/70 bg-white/[0.02] border border-white/5 group-hover:border-[#c5a85c]/20 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#c5a85c]" />
                  Insider Access
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium text-white/70 bg-white/[0.02] border border-[#c5a85c]/10 group-hover:border-[#c5a85c]/20 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#c5a85c]" />
                  Strategic Expertise
                </span>
              </div>
            </div>

            {/* Service 2: Warehouses & Logistics Hubs */}
            <div className="flex-none w-[80vw] max-w-[320px] sm:w-[280px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/45 hover:bg-black/50 hover:shadow-[0_12px_30px_rgba(197,168,92,0.05)] transition-all duration-500 flex flex-col justify-between group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 mb-2 sm:mb-3 min-h-[52px] sm:min-h-[56px] md:min-h-[64px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center text-[#c5a85c] group-hover:bg-[#c5a85c]/20 transition-all duration-300 shrink-0">
                    <Warehouse className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h3 className="text-[11px] sm:text-xs md:text-sm lg:text-base font-sans font-semibold text-white tracking-wider uppercase leading-tight">
                    Warehouses & Logistics Hubs
                  </h3>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm leading-relaxed font-sans font-light min-h-[72px] sm:min-h-[84px] md:min-h-[96px]">
                  Industrial real estate solutions located in key logistics corridors with direct port and highway access. Scalable facilities engineered for supply chain efficiency and e-commerce fulfillment.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/5">
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium text-white/70 bg-white/[0.02] border border-white/5 group-hover:border-[#c5a85c]/20 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#c5a85c]" />
                  Supply Chain
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium text-white/70 bg-white/[0.02] border border-[#c5a85c]/10 group-hover:border-[#c5a85c]/20 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#c5a85c]" />
                  Logistics Corridors
                </span>
              </div>
            </div>

            {/* Service 3: High-End Residential Units & Condominiums */}
            <div className="flex-none w-[80vw] max-w-[320px] sm:w-[280px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/45 hover:bg-black/50 hover:shadow-[0_12px_30px_rgba(197,168,92,0.05)] transition-all duration-500 flex flex-col justify-between group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 mb-2 sm:mb-3 min-h-[52px] sm:min-h-[56px] md:min-h-[64px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center text-[#c5a85c] group-hover:bg-[#c5a85c]/20 transition-all duration-300 shrink-0">
                    <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h3 className="text-[11px] sm:text-xs md:text-sm lg:text-base font-sans font-semibold text-white tracking-wider uppercase leading-tight">
                    High-End Residential Units & Condominiums
                  </h3>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm leading-relaxed font-sans font-light min-h-[72px] sm:min-h-[84px] md:min-h-[96px]">
                  Refined luxury condominiums and upscale suburban residences in Metro Manila’s premier communities. Curated for elevated living, convenience, and enduring long-term investment value.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/5">
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium text-white/70 bg-white/[0.02] border border-white/5 group-hover:border-[#c5a85c]/20 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#c5a85c]" />
                  Concierge Support
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium text-white/70 bg-white/[0.02] border border-[#c5a85c]/10 group-hover:border-[#c5a85c]/20 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#c5a85c]" />
                  High-Return Guidance
                </span>
              </div>
            </div>

            {/* Service 4: Premier Land Investments */}
            <div className="flex-none w-[80vw] max-w-[320px] sm:w-[280px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/45 hover:bg-black/50 hover:shadow-[0_12px_30px_rgba(197,168,92,0.05)] transition-all duration-500 flex flex-col justify-between group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 mb-2 sm:mb-3 min-h-[52px] sm:min-h-[56px] md:min-h-[64px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center text-[#c5a85c] group-hover:bg-[#c5a85c]/20 transition-all duration-300 shrink-0">
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h3 className="text-[11px] sm:text-xs md:text-sm lg:text-base font-sans font-semibold text-white tracking-wider uppercase leading-tight">
                    Premier Land Investments
                  </h3>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm leading-relaxed font-sans font-light min-h-[72px] sm:min-h-[84px] md:min-h-[96px]">
                  Access to valuable landholdings in fast-growing, strategic locations. Tailored for developers and investors with comprehensive due diligence, zoning compliance, and feasibility analysis.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/5">
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium text-white/70 bg-white/[0.02] border border-white/5 group-hover:border-[#c5a85c]/20 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#c5a85c]" />
                  Due Diligence
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-medium text-white/70 bg-white/[0.02] border border-[#c5a85c]/10 group-hover:border-[#c5a85c]/20 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#c5a85c]" />
                  Land Banking
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE ALPHA REALTY SECTION */}
      <section className="py-12 sm:py-16 md:py-24 bg-black/15 border-t border-b border-white/5 relative overflow-hidden" id="why-choose-alpha-realty">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#c5a85c]/3 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="hidden sm:block h-[1px] w-8 sm:w-12 bg-gradient-to-l from-[#c5a85c]/60 to-transparent" />
              <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.4em] uppercase block">
                PARTNERSHIP ADVANTAGES
              </span>
              <div className="hidden sm:block h-[1px] w-8 sm:w-12 bg-gradient-to-r from-[#c5a85c]/60 to-transparent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-sans font-light text-white tracking-wide">
              Why Choose <span className="text-[#c5a85c] font-semibold">Alpha Realty?</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-4 mb-6">
              <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-[#c5a85c] to-transparent" />
              <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_10px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
              <div className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-[#c5a85c] to-transparent" />
            </div>
            <p className="text-white/70 text-sm md:text-base leading-relaxed font-sans font-light">
              The benefits of partnering with Alpha Premier Realty is their client-focused approach. Whether you're a startup in need of a warehouse, a small business seeking a virtual office, or an individual looking for a condominium, Alpha Premier Realty provides:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
            
            {/* Left 3 columns for the cards */}
            <div className="md:col-span-3 flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 md:grid md:grid-cols-3 md:gap-4 h-full pb-2 md:pb-0 scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              
              {/* 1. Flexible Lease Terms */}
              <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/35 hover:bg-black/45 transition-all duration-300 flex flex-col justify-between text-left group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div>
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 min-h-[36px] sm:min-h-[40px]">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0 group-hover:bg-[#c5a85c]/20 transition-all duration-300">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a85c]" />
                    </div>
                    <h4 className="text-white text-xs sm:text-sm md:text-sm lg:text-base font-semibold tracking-wide leading-tight">
                      Flexible Lease
                    </h4>
                  </div>
                  <p className="text-white/60 text-[10px] sm:text-xs md:text-xs leading-relaxed font-sans font-light">
                    Customizable agreement cycles that adapt dynamically to your scaling timeline.
                  </p>
                </div>
              </div>

              {/* 2. Cost-effective Solution */}
              <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/35 hover:bg-black/45 transition-all duration-300 flex flex-col justify-between text-left group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div>
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 min-h-[36px] sm:min-h-[40px]">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0 group-hover:bg-[#c5a85c]/20 transition-all duration-300">
                      <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a85c]" />
                    </div>
                    <h4 className="text-white text-xs sm:text-sm md:text-sm lg:text-base font-semibold tracking-wide leading-tight">
                      Cost-Effective
                    </h4>
                  </div>
                  <p className="text-white/60 text-[10px] sm:text-xs md:text-xs leading-relaxed font-sans font-light">
                    Budget-optimized layouts with highly transparent and optimized utility rates.
                  </p>
                </div>
              </div>

              {/* 3. Easy Accessibility */}
              <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/35 hover:bg-black/45 transition-all duration-300 flex flex-col justify-between text-left group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div>
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 min-h-[36px] sm:min-h-[40px]">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0 group-hover:bg-[#c5a85c]/20 transition-all duration-300">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a85c]" />
                    </div>
                    <h4 className="text-white text-xs sm:text-sm md:text-sm lg:text-base font-semibold tracking-wide leading-tight">
                      Prime Locations
                    </h4>
                  </div>
                  <p className="text-white/60 text-[10px] sm:text-xs md:text-xs leading-relaxed font-sans font-light">
                    Located near primary transport corridors, highways, and commercial districts.
                  </p>
                </div>
              </div>

              {/* 4. Outstanding Customer Service */}
              <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/35 hover:bg-black/45 transition-all duration-300 flex flex-col justify-between text-left group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div>
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 min-h-[36px] sm:min-h-[40px]">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0 group-hover:bg-[#c5a85c]/20 transition-all duration-300">
                      <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a85c]" />
                    </div>
                    <h4 className="text-white text-xs sm:text-sm md:text-sm lg:text-base font-semibold tracking-wide leading-tight">
                      Elite Service
                    </h4>
                  </div>
                  <p className="text-white/60 text-[10px] sm:text-xs md:text-xs leading-relaxed font-sans font-light">
                    An unwavering commitment placing your priorities at the center of our service.
                  </p>
                </div>
              </div>

              {/* 5. Professional Staff */}
              <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/35 hover:bg-black/45 transition-all duration-300 flex flex-col justify-between text-left group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div>
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 min-h-[36px] sm:min-h-[40px]">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0 group-hover:bg-[#c5a85c]/20 transition-all duration-300">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a85c]" />
                    </div>
                    <h4 className="text-white text-xs sm:text-sm md:text-sm lg:text-base font-semibold tracking-wide leading-tight">
                      Expert Staff
                    </h4>
                  </div>
                  <p className="text-white/60 text-[10px] sm:text-xs md:text-xs leading-relaxed font-sans font-light">
                    Confidently navigate complex decisions with certified real estate advisors.
                  </p>
                </div>
              </div>

              {/* 6. 24/7 Support & Communication */}
              <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] md:w-auto snap-start p-3 sm:p-4 md:p-5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/35 hover:bg-black/45 transition-all duration-300 flex flex-col justify-between text-left group h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div>
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 min-h-[36px] sm:min-h-[40px]">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-md sm:rounded-lg bg-[#c5a85c]/10 border border-[#c5a85c]/20 flex items-center justify-center shrink-0 group-hover:bg-[#c5a85c]/20 transition-all duration-300">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a85c]" />
                    </div>
                    <h4 className="text-white text-xs sm:text-sm md:text-sm lg:text-base font-semibold tracking-wide leading-tight">
                      24/7 Support
                    </h4>
                  </div>
                  <p className="text-white/60 text-[10px] sm:text-xs md:text-xs leading-relaxed font-sans font-light">
                    Round-the-clock coverage for urgent logistical and maintenance matters.
                  </p>
                </div>
              </div>

            </div>

            {/* Right 1 column for the full image */}
            <div className="hidden md:block md:col-span-1 h-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#c5a85c]/20 to-transparent rounded-lg sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse" />
              <div className="relative border border-white/10 bg-black/40 backdrop-blur-md rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden h-full min-h-[260px]">
                {/* Thin elegant gold corners */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#c5a85c]/60 z-10" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#c5a85c]/60 z-10" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#c5a85c]/60 z-10" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#c5a85c]/60 z-10" />
                
                <img 
                  src="/images/wall2content.jpg" 
                  alt="Alpha Premier Realty Client Success"
                  className="w-full h-full object-cover filter brightness-[0.85] contrast-105 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
