import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';

// Absolute image assets paths
const realtyBg = '/assets/images/main-realty/realty-body-bg.png';
const buildingPhoto2 = '/assets/images/main-realty/1 (2).jpg';
const scMisting = '/assets/images/main-swiftclear/sc-mistingBuster.jpg';
const scUv = '/assets/images/main-swiftclear/sc-uvlight.jpg';
const dtBgFront = '/assets/images/main-dynamic-tree/Background_Front.png';
const dtModel1 = '/assets/images/main-dynamic-tree/model1.jpg';
const dtModel2 = '/assets/images/main-dynamic-tree/model2.jpg';
const dtModel3 = '/assets/images/main-dynamic-tree/model3.jpg';
const dtModel4 = '/assets/images/main-dynamic-tree/model4.jpg';
const luxeBg = '/assets/images/main-luxe-prime/newsletterimage.jpg';
const luxeVision = '/assets/images/main-luxe-prime/InnovationVision.png';
const luxePartner = '/assets/images/main-luxe-prime/StrategicPartnership.png';
const altaCover = '/assets/images/main-alta-venture/cover.png';
const altaBg = '/assets/images/main-alta-venture/background5.jpg';
const altaImg1 = '/assets/images/main-alta-venture/image.jpg';
const constructionServicesImg = '/assets/images/main-construction/construction-services-img.png';
const carrierLogo = '/assets/images/main-construction/addt-carrier-logo.png';
const daikinLogo = '/assets/images/main-construction/addt-daikin-logo.png';
const greeLogo = '/assets/images/main-construction/addt-gree-logo.png';
const lgLogo = '/assets/images/main-construction/addt-lg-logo.png';
const mideaLogo = '/assets/images/main-construction/addt-midea-logo.png';
const mitsubishiLogo = '/assets/images/main-construction/addt-mitsubishi-logo.png';
const samsungLogo = '/assets/images/main-construction/addt-samsung-logo.png';
const tosotLogo = '/assets/images/main-construction/addt-tosot-logo.png';
const koppelLogo = '/assets/images/main-construction/addt-koppel-logo.png';
const prime88Trading = '/assets/images/main-88prime/trading.jpg';
const prime88Sourcing = '/assets/images/main-88prime/sourcing.jpg';
const prime88Wpc = '/assets/images/main-88prime/WPC.jpg';
const prime88Partnership = '/assets/images/main-88prime/partnership.png';

const apgLogo = '/assets/images/apgopc.png';
const realtyLogo = '/assets/images/sstcompany-realty.png';
const luxeLogo = '/assets/images/sstcompany-luxeprime.png';
const constructionLogo = '/assets/images/sstcompany-alphacons1.png';
const altaLogo = '/assets/images/sstcompany-altaventure.png';
const dynamicTreeLogo = '/assets/images/main-dynamic-tree/Dynamic_Tree_Logo.png';
const swiftClearLogo = '/assets/images/sstcompany-swiftclear1.png';
const prime88Logo = '/assets/images/main-88prime/sstcompany-88prime11.png';

export default function Enterprises() {
  const { onOpenInquire } = useOutletContext();

  return (
    <>
      <Helmet>
        <title>Our Enterprises | Alpha Premier</title>
      </Helmet>

      <div className="w-full bg-black text-neutral-100 font-sans overflow-x-hidden pt-20">
        
        {/* =========================================================================
            0. TOP HERO / ENTERPRISES INTRO (Full Width Continuous Header)
           ========================================================================= */}
        <section className="w-full bg-[#07090E] text-white py-12 sm:py-20 md:py-28 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-neutral-800/80">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-neutral-900 border border-[#E2B857]/40 max-w-full">
              <img src={apgLogo} alt="APG OPC" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#E2B857] uppercase tracking-[0.15em] sm:tracking-[0.25em] truncate font-display">
                ALPHA PREMIER GROUP OPC
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight font-display leading-tight sm:leading-none">
              OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2B857] via-[#FFF3D1] to-[#C29B38]">ENTERPRISES</span>
            </h1>

            <p className="text-neutral-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2">
              Discover the market-leading divisions under Alpha Premier Group OPC — spanning Real Estate, Hygiene Sanitation, Creative Media, Luxury Living, Global Offshoring, Commercial Construction, and Consumer Trading.
            </p>

            {/* Minimal Horizontal Navigation */}
            <div className="pt-4 sm:pt-6 flex flex-wrap justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-neutral-300">
              {[
                { name: '01. Realty', href: '#realty' },
                { name: '02. Swift Clear', href: '#swift-clear' },
                { name: '03. Dynamic Tree', href: '#dynamic-tree' },
                { name: '04. Luxe Prime', href: '#luxe-prime' },
                { name: '05. Alta Venture', href: '#alta-venture' },
                { name: '06. Construction', href: '#construction' },
                { name: '07. 88 Prime', href: '#88-prime' },
              ].map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.href}
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-[#E2B857] transition-all"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            1. ALPHA PREMIER REALTY (Gold & Black - Full Width Dark Section)
           ========================================================================= */}
        <section id="realty" className="w-full bg-[#080B10] text-white py-12 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-neutral-800/60">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            
            {/* Left Visual Composition */}
            <div className="lg:col-span-7 relative">
              <div className="w-full h-[240px] sm:h-[360px] md:h-[420px] lg:h-[480px] overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl">
                <img 
                  src={realtyBg} 
                  alt="Alpha Premier Realty High-Rise Building" 
                  className="w-full h-full object-cover filter brightness-95" 
                />
              </div>
              {/* Overlapping Secondary Image */}
              <div className="hidden md:block absolute -bottom-6 -right-4 lg:-bottom-8 lg:-right-6 w-1/2 lg:w-3/5 h-36 lg:h-48 rounded-xl lg:rounded-2xl overflow-hidden border-2 border-[#E2B857]/40 shadow-2xl bg-neutral-900">
                <img src={buildingPhoto2} alt="Modern Tower Architecture" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Right Text Column */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img src={realtyLogo} alt="Realty Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain shrink-0" />
                <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] text-[#E2B857] uppercase font-display">
                  01 / REAL ESTATE & BROKERAGE
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight font-display">
                ALPHA PREMIER <span className="text-[#E2B857]">REALTY</span>
              </h2>

              <p className="text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed">
                Alpha Premier Realty is a premier property brokerage and investment advisory firm in the Philippines. We specialize in prime commercial high-rises, strategic land acquisitions, luxury residential developments, and high-yield real estate portfolios.
              </p>

              <button
                onClick={() => onOpenInquire('Alpha Premier Realty')}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#E2B857] text-neutral-950 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-[#FFF3D1] transition-all group cursor-pointer shadow-lg font-display"
              >
                <span>INQUIRE ABOUT REALTY</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. SWIFT CLEAR (Clean White / Ice Blue Full Width Section)
           ========================================================================= */}
        <section id="swift-clear" className="w-full bg-[#F4F8FC] text-slate-900 py-12 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            
            {/* Left Text Column */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img src={swiftClearLogo} alt="Swift Clear Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain shrink-0" />
                <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] text-[#0082CA] uppercase font-display">
                  02 / SANITATION & DISINFECTION
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-950 leading-tight font-display">
                SWIFT CLEAR <span className="text-[#0082CA]">SANITATION</span>
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
                Swift Clear Sanitation Services provides medical-grade disinfection and hygiene solutions for commercial towers, offices, healthcare facilities, and industrial complexes using advanced electrostatic misting and UV-C technology.
              </p>

              <button
                onClick={() => onOpenInquire('Swift Clear')}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#0082CA] text-white font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-[#006BB0] transition-all group cursor-pointer shadow-lg font-display"
              >
                <span>INQUIRE ABOUT SWIFT CLEAR</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Wide Image Collage */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4 order-1 lg:order-2">
              <div className="w-full h-[220px] sm:h-[320px] md:h-[380px] lg:h-[400px] overflow-hidden rounded-xl sm:rounded-2xl shadow-xl">
                <img src={scMisting} alt="Electrostatic Misting Buster" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="h-28 sm:h-36 md:h-40 rounded-xl overflow-hidden shadow-md">
                  <img src={scUv} alt="UV Light Sterilization" className="w-full h-full object-cover" />
                </div>
                <div className="h-28 sm:h-36 md:h-40 bg-[#0082CA] text-white p-3 sm:p-5 rounded-xl flex flex-col justify-center">
                  <span className="text-xl sm:text-3xl font-black font-sans">99.9%</span>
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider mt-0.5 sm:mt-1 font-display">Sterilization Efficacy</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. DYNAMIC TREE MULTIMEDIA (Vibrant Pink, White, Black & Gold Canvas)
           ========================================================================= */}
        <section id="dynamic-tree" className="w-full bg-gradient-to-br from-[#FF1493] via-[#E6007A] to-[#B30059] text-white py-12 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-pink-400/40 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center relative z-10">
            
            {/* Left Media Collage */}
            <div className="lg:col-span-6 grid grid-cols-12 gap-2.5 sm:gap-3.5">
              <div className="col-span-7 h-[240px] sm:h-[320px] md:h-[380px] overflow-hidden rounded-xl border-2 border-white/80 hover:border-[#FACE63] shadow-2xl group bg-black/40 transition-all duration-300">
                <img src={dtBgFront} alt="Dynamic Tree Production" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="col-span-5 h-[115px] sm:h-[152px] md:h-[182px] overflow-hidden rounded-xl border-2 border-white/80 hover:border-[#FACE63] shadow-xl group bg-black/40 transition-all duration-300">
                <img src={dtModel1} alt="Broadcasting Talent" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="col-span-5 h-[115px] sm:h-[152px] md:h-[182px] overflow-hidden rounded-xl border-2 border-white/80 hover:border-[#FACE63] shadow-xl group bg-black/40 transition-all duration-300">
                <img src={dtModel2} alt="Creative Visual Direction" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="col-span-5 h-[110px] sm:h-[140px] md:h-[160px] overflow-hidden rounded-xl border-2 border-white/80 hover:border-[#FACE63] shadow-xl group bg-black/40 transition-all duration-300">
                <img src={dtModel3} alt="Cinematic Stage" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="col-span-7 h-[110px] sm:h-[140px] md:h-[160px] overflow-hidden rounded-xl border-2 border-white/80 hover:border-[#FACE63] shadow-xl group bg-black/40 transition-all duration-300">
                <img src={dtModel4} alt="Media Production" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2.5 sm:gap-3 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 w-fit">
                <img src={dynamicTreeLogo} alt="Dynamic Tree Logo" className="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0 filter drop-shadow-md brightness-125" />
                <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] text-amber-300 uppercase font-display">
                  03 / CREATIVE MEDIA & BROADCASTING
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight text-white drop-shadow-md font-display">
                DYNAMIC TREE <span className="text-black bg-white px-2 py-0.5 inline-block rounded-md shadow-md">MULTIMEDIA</span>
              </h2>

              <p className="text-pink-50 text-xs sm:text-sm md:text-base leading-relaxed font-medium drop-shadow-sm">
                Dynamic Tree Multimedia Services is the creative storytelling arm of Alpha Premier Group. We produce cinematic commercials, corporate video productions, digital brand strategies, live streams, and high-impact visual media.
              </p>

              <button
                onClick={() => onOpenInquire('Dynamic Tree Multimedia Services')}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 sm:gap-3 px-6 py-3.5 bg-black text-white font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-900 transition-all group cursor-pointer shadow-2xl border border-amber-400/40 hover:border-amber-300 font-display"
              >
                <span>EXPLORE MULTIMEDIA SERVICES</span>
                <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. LUXE PRIME REALTY (Deep Obsidian & Gold Luxury - Full Width Overlay)
           ========================================================================= */}
        <section id="luxe-prime" className="w-full bg-[#0A0906] text-white py-12 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-[#D4AF37]/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            
            {/* Left Text Column */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img src={luxeLogo} alt="Luxe Prime Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain shrink-0" />
                <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] text-[#D4AF37] uppercase font-display">
                  04 / LUXURY ESTATES & RESIDENCES
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight font-display">
                LUXE PRIME <span className="text-[#D4AF37]">REALTY</span>
              </h2>

              <p className="text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed">
                Luxe Prime Realty curates the finest luxury estates, penthouse residences, private villas, and high-yielding commercial acquisitions for high-net-worth individuals and institutional investors worldwide.
              </p>

              <button
                onClick={() => onOpenInquire('Luxe Prime Realty')}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#D4AF37] text-neutral-950 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-[#FFF0B3] transition-all group cursor-pointer shadow-lg font-display"
              >
                <span>DISCOVER LUXE PROPERTIES</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Luxury Hero Image Showcase */}
            <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
              <div className="w-full h-[240px] sm:h-[320px] md:h-[360px] lg:h-[400px] overflow-hidden rounded-xl sm:rounded-2xl border border-[#D4AF37]/30 shadow-2xl">
                <img src={luxeBg} alt="Luxe Prime Estates" className="w-full h-full object-cover filter brightness-90" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="h-28 sm:h-36 rounded-xl overflow-hidden border border-[#D4AF37]/20 shadow-md">
                  <img src={luxeVision} alt="Innovation Vision" className="w-full h-full object-cover" />
                </div>
                <div className="h-28 sm:h-36 rounded-xl overflow-hidden border border-[#D4AF37]/20 shadow-md">
                  <img src={luxePartner} alt="Strategic Partnership" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            5. ALTA VENTURE OUTSOURCE (Soft Light Mint Green Full Width)
           ========================================================================= */}
        <section id="alta-venture" className="w-full bg-[#EBF7F2] text-slate-900 py-12 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-emerald-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            
            {/* Left Team Photo */}
            <div className="lg:col-span-6 space-y-3">
              <div className="w-full h-[220px] sm:h-[320px] md:h-[360px] lg:h-[380px] overflow-hidden rounded-xl sm:rounded-2xl shadow-xl">
                <img src={altaCover} alt="Alta Venture BPO Team" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 sm:h-32 rounded-xl overflow-hidden shadow-sm">
                  <img src={altaBg} alt="Alta Venture Workspace" className="w-full h-full object-cover" />
                </div>
                <div className="h-24 sm:h-32 rounded-xl overflow-hidden shadow-sm">
                  <img src={altaImg1} alt="BPO Operations" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right Text */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img src={altaLogo} alt="Alta Venture Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain shrink-0" />
                <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] text-[#059669] uppercase font-display">
                  05 / GLOBAL BPO & OFFSHORING
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-950 leading-tight font-display">
                ALTA VENTURE <span className="text-[#059669]">OUTSOURCE</span>
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
                Alta Venture Outsource delivers scalable Business Process Outsourcing (BPO) solutions, providing high-performing virtual staff, customer support specialists, IT helpdesk, and administrative professionals for global companies.
              </p>

              <button
                onClick={() => onOpenInquire('Alta Venture Outsource')}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#059669] text-white font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-[#047857] transition-all group cursor-pointer shadow-lg font-display"
              >
                <span>PARTNER WITH ALTA VENTURE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </section>

        {/* =========================================================================
            6. ALPHA PREMIER CONSTRUCTION (Industrial Dark Charcoal & Amber Gold)
           ========================================================================= */}
        <section id="construction" className="w-full bg-[#12100C] text-white py-12 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-amber-900/40">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
              {/* Left Text */}
              <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img src={constructionLogo} alt="Construction Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain shrink-0" />
                  <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] text-[#F59E0B] uppercase font-display">
                    06 / COMMERCIAL CONSTRUCTION
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight font-display">
                  ALPHA PREMIER <span className="text-[#F59E0B]">CONSTRUCTION</span>
                </h2>

                <p className="text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed">
                  Alpha Premier Construction handles general contracting, structural engineering, architectural builds, commercial fit-outs, HVAC installation, and heavy civil works. We combine structural integrity with master engineering.
                </p>

                <button
                  onClick={() => onOpenInquire('Alpha Premier Construction')}
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#F59E0B] text-neutral-950 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-[#FCD34D] transition-all group cursor-pointer shadow-lg font-display"
                >
                  <span>START A CONSTRUCTION PROJECT</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right Wide Panoramic Banner */}
              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="w-full h-[240px] sm:h-[340px] md:h-[400px] lg:h-[440px] overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl border border-amber-500/20">
                  <img src={constructionServicesImg} alt="Commercial Construction Infrastructure" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* HVAC Partners */}
            <div className="pt-6 border-t border-neutral-800/80">
              <span className="block text-center text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4 font-display">
                AUTHORIZED HVAC & ENGINEERING BRAND PARTNERS
              </span>
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-10 opacity-80 hover:opacity-100 transition-opacity">
                {[
                  { name: 'Carrier', logo: carrierLogo },
                  { name: 'Daikin', logo: daikinLogo },
                  { name: 'Gree', logo: greeLogo },
                  { name: 'LG', logo: lgLogo },
                  { name: 'Midea', logo: mideaLogo },
                  { name: 'Mitsubishi', logo: mitsubishiLogo },
                  { name: 'Samsung', logo: samsungLogo },
                  { name: 'Tosot', logo: tosotLogo },
                  { name: 'Koppel', logo: koppelLogo },
                ].map((brand, idx) => (
                  <div key={idx} className="h-8 sm:h-10 px-3 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                    <img src={brand.logo} alt={brand.name} className="h-full object-contain max-w-[80px] sm:max-w-[100px] filter brightness-110" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            7. 88 PRIME TRADING & VIRTUAL SERVICES (Deep Imperial Navy)
           ========================================================================= */}
        <section id="88-prime" className="w-full bg-[#090E1A] text-white py-12 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            
            {/* Left Image Showcase */}
            <div className="lg:col-span-6 space-y-3">
              <div className="w-full h-[220px] sm:h-[300px] md:h-[340px] overflow-hidden rounded-xl sm:rounded-2xl border border-indigo-500/30 shadow-2xl">
                <img src={prime88Trading} alt="88 Prime Global Trading" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="h-20 sm:h-28 rounded-lg overflow-hidden border border-indigo-500/20 shadow-md">
                  <img src={prime88Sourcing} alt="Global Sourcing" className="w-full h-full object-cover" />
                </div>
                <div className="h-20 sm:h-28 rounded-lg overflow-hidden border border-indigo-500/20 shadow-md">
                  <img src={prime88Wpc} alt="WPC Materials" className="w-full h-full object-cover" />
                </div>
                <div className="h-20 sm:h-28 rounded-lg overflow-hidden border border-indigo-500/20 shadow-md">
                  <img src={prime88Partnership} alt="Enterprise Partnership" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img src={prime88Logo} alt="88 Prime Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain shrink-0" />
                <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.25em] text-[#818CF8] uppercase font-display">
                  07 / TRADING & VIRTUAL OFFICE
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight font-display">
                88 PRIME <span className="text-[#818CF8]">TRADING</span>
              </h2>

              <p className="text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed">
                88 Prime integrates global consumer goods trading with flexible virtual office address solutions. We assist emerging enterprises with prestigious business addresses, mail handling, office supplies, WPC/PVC materials, and supply chain distribution.
              </p>

              <button
                onClick={() => onOpenInquire('88 Prime')}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#6366F1] text-white font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-[#4F46E5] transition-all group cursor-pointer shadow-lg font-display"
              >
                <span>INQUIRE WITH 88 PRIME</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </section>

        {/* =========================================================================
            8. FOOTER CALL TO ACTION (Seamless Continuous End)
           ========================================================================= */}
        <section className="w-full bg-[#05070B] text-white py-16 sm:py-24 md:py-28 px-4 sm:px-8 md:px-12 border-t border-neutral-800 text-center">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <span className="text-[10px] sm:text-xs font-bold text-[#E2B857] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-display">
              ONE CONGLOMERATE. INFINITE POSSIBILITIES.
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-display">
              CONNECT WITH OUR ENTERPRISES
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm md:text-base leading-relaxed px-2">
              Partner with Alpha Premier Group OPC and our specialized enterprise divisions to discover tailored solutions for your business.
            </p>
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => onOpenInquire()}
                className="w-full sm:w-auto justify-center px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-[#E2B857] via-[#FFF3D1] to-[#C29B38] text-neutral-950 font-black text-[11px] sm:text-xs md:text-sm tracking-wider uppercase rounded-xl shadow-2xl hover:brightness-110 transition-all flex items-center gap-2.5 sm:gap-3 cursor-pointer font-display"
              >
                <span>SUBMIT AN INQUIRY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
