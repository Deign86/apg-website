import React, { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { EnterprisesGallery } from '../components/EnterprisesGallery';
import { AboutUsSection } from '../components/AboutUsSection';
import { 
  Building2, Building, TrendingUp, Store, Briefcase, Package, 
  ShieldCheck, Film, Sparkles, HardHat, Users, Star, Handshake, 
  Lightbulb, Shield, Columns
} from 'lucide-react';

const enterprises = [
  { id: 'realty', name: 'Alpha Premier Realty', href: '/subsidiaries/realty' },
  { id: 'swift-clear', name: 'Swift Clear', href: '/subsidiaries/swiftclear' },
  { id: 'dynamic-tree', name: 'Dynamic Tree', href: '/subsidiaries/dynamic-tree' },
  { id: 'luxe-prime', name: 'Luxe Prime', href: '/subsidiaries/luxe-prime' },
  { id: 'alta-venture', name: 'AltaVenture', href: '/subsidiaries/alta-venture' },
  { id: 'construction', name: 'Alpha Premier Construction', href: '/subsidiaries/construction' },
  { id: '88-prime', name: '88 Prime', href: '/subsidiaries/88prime' },
];

const PROPERTY_TYPES = [
  { id: 'realty', name: 'Premium Realty', icon: 'Building2', description: 'Exclusive residential & commercial brokerage.' },
  { id: 'condo', name: 'Condominium', icon: 'Building', description: 'High-rise luxury living in CBD locations.' },
  { id: 'investment', name: 'Strategic Investment', icon: 'TrendingUp', description: 'High-yielding real estate portfolios.' },
  { id: 'commercial', name: 'Commercial Space', icon: 'Store', description: 'Retail units, shopping arcades & showrooms.' },
  { id: 'office', name: 'Office Space', icon: 'Briefcase', description: 'Grade A corporate spaces & co-working suites.' },
  { id: 'warehouse', name: 'Warehouse', icon: 'Package', description: 'Industrial parks & logistics hubs.' },
];

const CORE_VALUES = [
  { name: 'EXCELLENCE', icon: 'Star', description: 'Setting industry standards through meticulous quality and unwavering commitment.' },
  { name: 'PARTNERSHIP', icon: 'Handshake', description: 'Forging collaborative relationships built on mutual trust and growth.' },
  { name: 'INNOVATION', icon: 'Lightbulb', description: 'Embracing modern technology and progressive business solutions.' },
  { name: 'INTEGRITY', icon: 'Shield', description: 'Conducting all operations with total transparency and ethical discipline.' },
  { name: 'LEGACY', icon: 'Columns', description: 'Building enduring value for communities, investors, and future generations.' },
];

export default function Home() {
  const { onOpenInquire } = useOutletContext();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    setTimeout(() => document.body.classList.add('loaded'), 100);
  }, []);

  const getIcon = (iconName, sizeClass = "w-5 h-5 text-[#E2B857]") => {
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

  return (
    <>
      <Helmet>
        <title>Alpha Premier | Group of Companies</title>
      </Helmet>

      <div className="bg-black text-neutral-100 font-sans selection:bg-[#E2B857] selection:text-neutral-950 font-sans">
        
        {/* 1. HERO SECTION / LANDING PAGE */}
        <section className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#1C1C20] overflow-hidden">
          
          {/* Background Image Overlay with dark architectural theme */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 opacity-80 animate-hero-bg pointer-events-none"
            style={{
              backgroundImage: `url('/assets/images/landingpage.png')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90 z-0 pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
            
            {/* Company Logo */}
            <div className="flex justify-center items-center pb-1">
              <img 
                src="/assets/images/apgopc.png" 
                alt="Alpha Premier Group of Companies" 
                className="h-40 sm:h-56 md:h-68 lg:h-76 max-w-full w-auto object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)]"
              />
            </div>

            {/* Headline */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight animate-gold-slide drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] uppercase font-display">
              Where Connections Grow Into Success
            </h1>

            {/* Subtext Quote */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-neutral-200 font-normal italic leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] px-4 font-sans">
              "We don't just close deals. We bring visions to life. We don't just offer services. We design solutions that transform opportunities into realities."
            </p>

          </div>

        </section>

        {/* 2. OUR ENTERPRISES - HORIZONTAL GALLERY */}
        <EnterprisesGallery 
          enterprises={enterprises} 
        />

        {/* 3. ABOUT US SECTION */}
        <AboutUsSection
          onOpenInquire={() => onOpenInquire()}
        />

        {/* 4. UNIQUE HOMES, OUTSTANDING DESTINATIONS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
          
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#261E0E] border border-[#E2B857]/40 rounded-full shadow-[0_0_12px_rgba(226,184,87,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2B857] animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#E2B857] uppercase font-michroma">
                YOUR TRUSTED PARTNER
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight font-display">
              Unique Homes, <span className="text-[#E2B857]">Outstanding Destinations</span>
            </h2>

            <div className="w-16 h-0.5 bg-[#E2B857] mx-auto rounded-full shadow-[0_0_10px_#E2B857]" />

            <p className="text-[10px] sm:text-xs lg:text-sm text-neutral-300 font-sans leading-snug sm:leading-relaxed max-w-4xl mx-auto pt-0.5">
              “Welcome to <strong className="text-[#E2B857] font-bold font-sans">ALPHA PREMIER GROUP OF COMPANIES</strong>—your trusted partner in premier real estate, modern virtual workspace solutions, and enterprise innovation. We curate extraordinary opportunities and transform ambitious visions into sustainable, long-term success.”
            </p>
          </div>

          {/* 6 Minimal Asset Badges - Always side-by-side */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3 lg:gap-4 pt-6 border-t border-[#1C1C20]">
            {PROPERTY_TYPES.map((pt) => (
              <Link
                key={pt.id}
                to="/properties"
                className="relative p-2 sm:p-3.5 lg:p-4 bg-[#111116] hover:bg-[#181822] border border-neutral-800 hover:border-[#E2B857]/80 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_6px_24px_rgba(226,184,87,0.25)] transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center rounded-2xl group overflow-hidden space-y-2 sm:space-y-3"
              >
                {/* Subtle Ambient Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#E2B857]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex flex-col items-center space-y-1.5 sm:space-y-2.5 py-0.5 z-10">
                  {/* Circular Glowing Icon Capsule */}
                  <div className="p-2 sm:p-2.5 bg-black/60 border border-neutral-700/80 rounded-full group-hover:border-[#E2B857] group-hover:bg-[#E2B857]/15 group-hover:scale-110 transition-all duration-300 shadow-inner">
                    {getIcon(pt.icon, "w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-neutral-300 group-hover:text-[#E2B857] transition-colors")}
                  </div>

                  {/* Badge Title */}
                  <h3 className="text-[8px] sm:text-[11px] lg:text-xs font-bold tracking-tight sm:tracking-wider text-neutral-200 group-hover:text-[#E2B857] transition-colors font-michroma leading-tight font-display">
                    {pt.name}
                  </h3>
                </div>

                {/* Minimal Dot Indicator on Hover */}
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-[#E2B857] group-hover:scale-125 transition-all duration-300 z-10" />
              </Link>
            ))}
          </div>

        </section>

        {/* 5. MISSION & VISION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#08080A] border-t border-b border-[#1C1C20]">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#261E0E] border border-[#E2B857]/40 rounded-full shadow-[0_0_12px_rgba(226,184,87,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2B857] animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#E2B857] uppercase font-michroma font-display">
                  OUR DIRECTION
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight font-display">
                Mission & Vision
              </h2>

              <div className="w-16 h-0.5 bg-[#E2B857] mx-auto rounded-full shadow-[0_0_10px_#E2B857]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-2">
              
              {/* Mission Narrative Card */}
              <div className="p-6 sm:p-8 bg-[#111116] border border-neutral-800 hover:border-[#E2B857]/50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#E2B857]">
                    <div className="p-2.5 bg-[#E2B857]/10 border border-[#E2B857]/30 rounded-xl">
                      <Lightbulb className="w-5 h-5 text-[#E2B857]" />
                    </div>
                    <h3 className="text-xl font-bold tracking-wider text-white uppercase font-michroma font-display">
                      Mission
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                    Delivering excellence and sustainable growth across our portfolio through five core pillars:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 bg-black/50 border border-neutral-800/80 rounded-xl space-y-1 hover:border-[#E2B857]/40 transition-colors">
                      <div className="flex items-center gap-2 text-[#E2B857]">
                        <span className="w-1.5 h-1.5 bg-[#E2B857] rounded-full shadow-[0_0_6px_#E2B857]" />
                        <h4 className="text-xs font-bold uppercase tracking-wide text-white font-sans">Premier Real Estate</h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug">
                        Leading brokerage in residential, commercial, and industrial markets.
                      </p>
                    </div>

                    <div className="p-3 bg-black/50 border border-neutral-800/80 rounded-xl space-y-1 hover:border-[#E2B857]/40 transition-colors">
                      <div className="flex items-center gap-2 text-[#E2B857]">
                        <span className="w-1.5 h-1.5 bg-[#E2B857] rounded-full shadow-[0_0_6px_#E2B857]" />
                        <h4 className="text-xs font-bold uppercase tracking-wide text-white font-sans">Virtual Workspaces</h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug">
                        Prestigious Ortigas business addresses & flexible workspace solutions.
                      </p>
                    </div>

                    <div className="p-3 bg-black/50 border border-neutral-800/80 rounded-xl space-y-1 hover:border-[#E2B857]/40 transition-colors">
                      <div className="flex items-center gap-2 text-[#E2B857]">
                        <span className="w-1.5 h-1.5 bg-[#E2B857] rounded-full shadow-[0_0_6px_#E2B857]" />
                        <h4 className="text-xs font-bold uppercase tracking-wide text-white font-sans">Diversified Ventures</h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug">
                        Expanding facility services, talent management, and construction.
                      </p>
                    </div>

                    <div className="p-3 bg-black/50 border border-neutral-800/80 rounded-xl space-y-1 hover:border-[#E2B857]/40 transition-colors">
                      <div className="flex items-center gap-2 text-[#E2B857]">
                        <span className="w-1.5 h-1.5 bg-[#E2B857] rounded-full shadow-[0_0_6px_#E2B857]" />
                        <h4 className="text-xs font-bold uppercase tracking-wide text-white font-sans">Strategic Growth</h4>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug">
                        Fostering trusted corporate partnerships and national development.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision Narrative Card */}
              <div className="p-6 sm:p-8 bg-[#111116] border border-neutral-800 hover:border-[#E2B857]/50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#E2B857]">
                    <div className="p-2.5 bg-[#E2B857]/10 border border-[#E2B857]/30 rounded-xl">
                      <Building2 className="w-5 h-5 text-[#E2B857]" />
                    </div>
                    <h3 className="text-xl font-bold tracking-wider text-white uppercase font-michroma font-display">
                      Vision
                    </h3>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-[#1C160C] to-[#0D0B07] border border-[#E2B857]/30 rounded-xl shadow-inner">
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal italic font-sans">
                      “To become a leading and globally recognized Philippine business group, setting the standard in real estate brokerage, business services, and diversified industries by delivering innovative solutions, creating sustainable value, and contributing to the economic growth of the Philippines.”
                    </p>
                  </div>

                  {/* Subtle Pill Tags */}
                  <div className="grid grid-cols-2 gap-3 pt-2 font-sans">
                    <div className="flex items-center gap-2.5 p-3 bg-black/40 border border-neutral-800/80 rounded-xl text-xs text-neutral-300">
                      <span className="text-[#E2B857] text-base">🌐</span>
                      <span className="font-semibold">Global Recognition</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 bg-black/40 border border-neutral-800/80 rounded-xl text-xs text-neutral-300">
                      <span className="text-[#E2B857] text-base">📈</span>
                      <span className="font-semibold">Sustainable Value</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 bg-black/40 border border-neutral-800/80 rounded-xl text-xs text-neutral-300">
                      <span className="text-[#E2B857] text-base">🇵🇭</span>
                      <span className="font-semibold">Philippine Growth</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 bg-black/40 border border-neutral-800/80 rounded-xl text-xs text-neutral-300">
                      <span className="text-[#E2B857] text-base">⚡</span>
                      <span className="font-semibold">Innovative Standard</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 6. OUR CORE VALUES */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold tracking-[0.3em] text-[#E2B857] uppercase font-michroma font-display">
              WHAT WE STAND FOR
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase font-michroma font-display">
              Our Core Values
            </h2>
            <div className="w-16 h-0.5 bg-[#E2B857] mx-auto shadow-[0_0_12px_#E2B857] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 lg:gap-5">
            {CORE_VALUES.map((val, idx) => (
              <div
                key={idx}
                className="relative p-2.5 sm:p-4 lg:p-6 bg-gradient-to-b from-[#1C160C] via-[#110E07] to-[#080603] border border-[#E2B857]/50 hover:border-[#E2B857] shadow-[0_4px_20px_rgba(226,184,87,0.12)] hover:shadow-[0_8px_32px_rgba(226,184,87,0.35)] transition-all duration-300 rounded-xl group flex flex-col justify-between items-center text-center space-y-2 sm:space-y-4 overflow-hidden"
              >
                {/* Gold Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E2B857]/30 via-[#E2B857] to-[#E2B857]/30" />
                
                <div className="space-y-1.5 sm:space-y-3 flex flex-col items-center">
                  {/* Gold Icon Badge */}
                  <div className="p-2 sm:p-3.5 bg-gradient-to-br from-[#332814] to-[#181208] border border-[#E2B857]/70 rounded-xl shadow-[0_0_15px_rgba(226,184,87,0.25)] group-hover:scale-110 transition-transform duration-300 my-0.5 sm:my-1">
                    {getIcon(val.icon)}
                  </div>

                  <h3 className="text-[10px] sm:text-xs lg:text-sm font-extrabold tracking-tight sm:tracking-wider text-white group-hover:text-[#E2B857] transition-colors uppercase font-michroma pt-0.5 font-display">
                    {val.name}
                  </h3>

                  <p className="text-[9px] sm:text-[11px] lg:text-xs text-neutral-300 leading-tight sm:leading-relaxed font-sans pt-0.5">
                    {val.description}
                  </p>
                </div>

                <div className="w-4 sm:w-8 h-0.5 bg-[#E2B857]/40 group-hover:w-8 sm:group-hover:w-16 group-hover:bg-[#E2B857] transition-all duration-300 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        {/* 7. Inquire CTA */}
        <section className="py-20 px-4 text-center bg-[#07090D] border-t border-neutral-900">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl sm:text-3xl font-black text-white uppercase font-display">Ready to Get Started?</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Contact our advisory board today to schedule a secure portfolio presentation or virtual office consultation.
            </p>
            <button 
              onClick={() => onOpenInquire()} 
              className="inline-block px-8 py-3.5 bg-[#E2B857] hover:bg-[#cfa543] text-neutral-950 font-extrabold text-xs tracking-widest uppercase transition-colors shadow-lg cursor-pointer"
            >
              Inquire Now!
            </button>
          </div>
        </section>

      </div>
    </>
  );
}
