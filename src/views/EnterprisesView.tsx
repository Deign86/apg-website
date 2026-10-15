import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../hooks/useContent';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight, Crown, Sparkles, ShieldCheck, Layers, ExternalLink } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { VO_FALLBACK_PACKAGES, voInquirePath } from '../data/virtualOffice';
import { INQUIRY_VO_NAME } from '../data/companyData';

// Realty Assets
const realtyBg = '/assets/images/main-realty/download (22).jpg';
const buildingPhoto1 = '/assets/images/main-realty/1 (2).jpg';
const buildingPhoto2 = '/assets/images/main-realty/2 (2).jpg';
const buildingPhoto3 = '/assets/images/main-realty/3 (2).jpg';
const alphaRealtyTower = '/assets/images/main-alta-venture/6. Alpha Realty.webp';
const realtyWarehouse = '/assets/images/main-realty/warehouse.webp';
const realtyHandshake = '/assets/images/main-realty/realty-handshake.webp';
// Virtual Office plan tiles: each plan's own photo (service_items.image_url); these by-position
// photos only cover a plan without one. Names and prices come from the same rows as /virtual-office.
const VO_TILE_IMAGES = ['/assets/images/2,899.webp', '/assets/images/3,499.webp', '/assets/images/4,999.webp'];
// Seeded rows carry placeholder.svg until api/migrate.php gives them their photo.
const voTileImage = (url: string | null | undefined, i: number) =>
  (url && !url.endsWith('/placeholder.svg') ? url : VO_TILE_IMAGES[i]);

// Swift Clear Assets
const scMisting = '/assets/images/main-swiftclear/sc-mistingBuster.jpg';
const scUv = '/assets/images/main-swiftclear/sc-uvlight.jpg';
const scServices = '/assets/images/main-swiftclear/swiftclear-services-img.webp';
const scAbout = '/assets/images/main-swiftclear/swiftclear-about-img.webp';
const scMission = '/assets/images/main-swiftclear/swiftclear-mission-img.png';

// Dynamic Tree Assets
const dtBgFront = '/assets/images/main-dynamic-tree/Background_Front.webp';
const dtModel1 = '/assets/images/main-dynamic-tree/model1.webp';
const dtModel2 = '/assets/images/main-dynamic-tree/model2.webp';
const dtModel3 = '/assets/images/main-dynamic-tree/model3.jpg';
const dtModel4 = '/assets/images/main-dynamic-tree/model4.jpg';

// Luxe Prime Assets
const luxeBg = '/assets/images/main-luxe-prime/newsletterimage.webp';
const luxeVision = '/assets/images/main-luxe-prime/InnovationVision.webp';
const luxePartner = '/assets/images/main-luxe-prime/StrategicPartnership.webp';

// Alta Venture Assets
const altaCover = '/assets/images/main-alta-venture/cover.webp';
const altaBg = '/assets/images/main-alta-venture/background5.webp';
const altaImg1 = '/assets/images/main-alta-venture/image1.webp';
const altaImg2 = '/assets/images/main-alta-venture/image2.webp';
const altaImg3 = '/assets/images/main-alta-venture/image3.webp';
const sstCompany = '/assets/images/main-alta-venture/sstcompany-altaventure.png';

// Construction Assets
const constructionServicesImg = '/assets/images/main-construction/construction-services-img.webp';
const constructionMission = '/assets/images/main-construction/mission.webp';
const constructionVision = '/assets/images/main-construction/vision.jpg';
const constructionCore = '/assets/images/main-construction/core.jpg';

// HVAC Logos
const carrierLogo = '/assets/images/main-construction/addt-carrier-logo.png';
const daikinLogo = '/assets/images/main-construction/addt-daikin-logo.png';
const greeLogo = '/assets/images/main-construction/addt-gree-logo.png';
const lgLogo = '/assets/images/main-construction/addt-lg-logo.png';
const mideaLogo = '/assets/images/main-construction/addt-midea-logo.png';
const mitsubishiLogo = '/assets/images/main-construction/addt-mitsubishi-logo.png';
const samsungLogo = '/assets/images/main-construction/addt-samsung-logo.png';
const tosotLogo = '/assets/images/main-construction/addt-tosot-logo.png';
const koppelLogo = '/assets/images/main-construction/addt-koppel-logo.png';

// 88 Prime Assets
const prime88Trading = '/assets/images/main-88prime/trading.jpg';
const prime88Sourcing = '/assets/images/main-88prime/sourcing.jpg';
const prime88Wpc = '/assets/images/main-88prime/WPC.jpg';
const prime88Pvc = '/assets/images/main-88prime/PVC.webp';
const prime88Partnership = '/assets/images/main-88prime/partnership.webp';
const prime88Pricing = '/assets/images/main-88prime/pricing.JPG';

// Brand Logos (small variants; the home gallery shares the 176px ones)
const apgLogo = '/assets/images/logos/apg-88.webp';
const realtyLogo = '/assets/images/logos/realty-176.webp';
const luxeLogo = '/assets/images/logos/luxe-prime-176.webp';
const constructionLogo = '/assets/images/logos/construction-176.webp';
const altaLogo = '/assets/images/logos/alta-venture-176.webp';
const dynamicTreeLogo = '/assets/images/logos/dynamic-tree-176.webp';
const swiftClearLogo = '/assets/images/logos/swiftclear-176.webp';
const prime88Logo = '/assets/images/logos/88prime-176.webp';

interface EnterprisesViewProps {
  onOpenInquire?: (defaultEnterprise?: string) => void;
}

// Continuous Magazine Block with Scrubbed Scroll Animations
interface EditorialBlockProps {
  id: string;
  imageOnLeft?: boolean;
  bgTone?: string;
  children: (props: {
    imageStyle: { x: MotionValue<number>; opacity: MotionValue<number>; scale: MotionValue<number>; willChange: MotionValue<string> };
    contentStyle: { x: MotionValue<number>; opacity: MotionValue<number>; willChange: MotionValue<string> };
  }) => React.ReactNode;
}

const EditorialBlock: React.FC<EditorialBlockProps> = ({
  id,
  imageOnLeft = true,
  bgTone = "bg-[#120E05]",
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Continuous scroll trigger bound directly to scroll position
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.95", "start 0.45"]
  });

  const imgStartX = imageOnLeft ? -70 : 70;
  const contentStartX = imageOnLeft ? 70 : -70;

  const imageX = useTransform(scrollYProgress, [0, 1], [imgStartX, 0]);
  const contentX = useTransform(scrollYProgress, [0, 1], [contentStartX, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [0.2, 0.9, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);
  // Own compositor layers only while the reveal runs: each scroll frame's x/scale/opacity write then
  // moves the layers instead of repainting the photos, and a settled block repaints crisp at scale 1.
  const willChange = useTransform(scrollYProgress, (p) => (p > 0 && p < 1 ? 'transform, opacity' : 'auto'));

  return (
    <div 
      ref={containerRef} 
      id={id} 
      className={`w-full ${bgTone} text-white m-0 p-0 border-none relative overflow-hidden`}
    >
      <div className="py-10 sm:py-16 md:py-20 my-0 px-4 sm:px-6 md:px-10 lg:px-12 w-full max-w-full">
        {children({ 
          imageStyle: { x: imageX, opacity, scale, willChange },
          contentStyle: { x: contentX, opacity, willChange }
        })}
      </div>
    </div>
  );
};

export const EnterprisesView: React.FC<EnterprisesViewProps> = ({ onOpenInquire }) => {
  const navigate = useNavigate();
  // Admin-editable copy: content page 'enterprises' (src/data/contentSchema.js); defaults = original copy.
  const { content: copy } = useContent('enterprises');
  const { services: voPackages } = useServices('virtual-office', VO_FALLBACK_PACKAGES);
  const voTiles = (voPackages as Array<{ id: number | string; title: string; price?: string | null; image_url?: string | null }>)
    .filter((pkg) => /\d/.test(pkg.price || ''))
    .slice(0, VO_TILE_IMAGES.length);
  return (
    <div className="w-full font-sans overflow-x-hidden bg-[#0F0B04] text-neutral-100 m-0 p-0 flex flex-col gap-0">
      
      {/* =========================================================================
          0. TOP HERO / ENTERPRISES INTRO (Half-Screen Landing Hero Header)
         ========================================================================= */}
      <div className="w-full min-h-[50vh] sm:min-h-[55vh] lg:min-h-[60vh] bg-[#140F06] text-white py-16 sm:py-24 md:py-28 px-4 sm:px-8 md:px-12 lg:px-16 border-b border-[#D4AF37]/20 m-0 relative flex flex-col justify-center items-center overflow-hidden">
        {/* Subtle Background Radial Glow & Decorative Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#d4af3708_1px,transparent_1px),linear-gradient(to_bottom,#d4af3708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full min-w-0 max-w-4xl mx-auto space-y-5 sm:space-y-6 text-center relative z-10 flex flex-col items-center py-6 sm:px-8"
        >
          {/* Radial Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.25)_0%,_transparent_75%)] pointer-events-none" />

          {/* Gold Diamond Heraldic Crest */}
          <div className="relative w-12 h-12 rotate-45 bg-[#1C1508] border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center z-10">
            <Crown className="w-6 h-6 -rotate-45 text-[#D4AF37] drop-shadow-[0_0_8px_#D4AF37]" />
          </div>

          {/* Filigree Line Dividers with Star Diamond Nodes */}
          <div className="flex items-center justify-center w-full max-w-xl gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
            <div className="inline-flex shrink-0 max-w-full min-w-0 items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A1408] border border-[#D4AF37] text-[#FFF3D1] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <img src={apgLogo} alt="APG OPC" className="w-4 h-4 object-contain shrink-0" />
              <span className="text-xs font-mono font-bold text-[#FFF3D1] uppercase tracking-[0.15em] sm:tracking-[0.25em] truncate">
                ALPHA PREMIER GROUP OPC
              </span>
            </div>
            <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
          </div>

          <h1 className="text-3xl min-[360px]:text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight font-sans leading-none z-10">
            OUR <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">ENTERPRISES</span>
          </h1>

          <p className="text-neutral-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal z-10">
            {copy.intro_text as string}
          </p>

          <div className="pt-2 flex items-center gap-3 z-10">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">✦</span>
            <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              {copy.divisions_label as string}
            </span>
            <span className="text-[#D4AF37] text-xs">✦</span>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37] to-[#D4AF37]" />
          </div>
        </motion.div>
      </div>

      {/* SINGLE CONTINUOUS CANVAS CONTAINER - 0 GAPS, 0 SEPARATORS */}
      <div className="w-full flex flex-col gap-0 m-0 p-0 border-none">        {/* =========================================================================
            1. ALPHA PREMIER REALTY (Black and Gold)
           ========================================================================= */}
        <EditorialBlock id="realty" imageOnLeft={true} bgTone="bg-[#120E05]">
          {({ imageStyle, contentStyle }) => (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
              
              {/* Left Image Collage - Asymmetric Trio with Hero Frame & Thumbs */}
              <motion.div style={imageStyle} className="lg:col-span-7 grid grid-cols-12 gap-2.5">
                <div className="col-span-8 h-[280px] sm:h-[380px] md:h-[450px] overflow-hidden rounded-none border border-[#D4AF37]/50 shadow-2xl bg-neutral-950 group relative">
                  <img 
                    src={realtyBg} 
                    alt="Alpha Premier Realty High-Rise Building" 
                    className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-3 left-3 bg-[#D4AF37] text-neutral-950 text-xs font-black px-2.5 py-1 tracking-wider uppercase">
                    Commercial Tower Portfolio
                  </span>
                </div>

                <div className="col-span-4 space-y-2.5">
                  <div className="h-[135px] sm:h-[185px] md:h-[220px] rounded-none overflow-hidden border border-white/20 shadow-lg bg-neutral-900 group relative">
                    <img loading="lazy" decoding="async" src={realtyHandshake} alt="Realty Partnership Handshake" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="h-[135px] sm:h-[185px] md:h-[220px] rounded-none overflow-hidden border border-[#D4AF37]/40 shadow-lg bg-neutral-900 group relative">
                    <img loading="lazy" decoding="async" src={realtyWarehouse} alt="Commercial Warehouse" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>

                {voTiles.map((pkg, i) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => navigate(voInquirePath(pkg))}
                    aria-label={`Inquire about the ${pkg.title} virtual office plan, ${pkg.price}`}
                    className="col-span-4 h-24 sm:h-28 rounded-none overflow-hidden border border-[#D4AF37]/30 group cursor-pointer shadow-md bg-neutral-900 relative text-left"
                  >
                    <img loading="lazy" decoding="async" src={voTileImage(pkg.image_url, i)} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
                    <span className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5 flex flex-col gap-0.5 min-w-0">
                      <span className="text-[#D4AF37] font-black text-sm sm:text-lg leading-none tabular-nums drop-shadow">{pkg.price}</span>
                      <span className="text-white/85 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{pkg.title}</span>
                    </span>
                  </button>
                ))}
              </motion.div>

              {/* Right Text Content */}
              <motion.div style={contentStyle} className="lg:col-span-5 space-y-3.5 sm:space-y-5">
                <div className="flex items-center gap-2.5">
                  <img loading="lazy" decoding="async" src={realtyLogo} alt="Realty Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
                  <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                    01 / REAL ESTATE & BROKERAGE
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-sans text-white leading-none">
                  ALPHA PREMIER <span className="text-[#D4AF37]">REALTY</span>
                </h2>

                <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-normal">
                  {copy.realty_text as string}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquire?.('Alpha Premier Realty')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#FFF3D1] transition-all group cursor-pointer shadow-xl"
                  >
                    <span>INQUIRE ABOUT REALTY</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/subsidiaries/realty')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#D4AF37] text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#D4AF37] hover:text-neutral-950 transition-all group cursor-pointer"
                  >
                    <span>VISIT FULL SITE</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

            </div>
          )}
        </EditorialBlock>

        {/* =========================================================================
            2. SWIFT CLEAR (Light Blue and White)
           ========================================================================= */}
        <EditorialBlock id="swift-clear" imageOnLeft={true} bgTone="bg-slate-50 text-slate-900">
          {({ imageStyle, contentStyle }) => (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
              
              {/* Left Content Column */}
              <motion.div style={contentStyle} className="lg:col-span-5 space-y-3.5 sm:space-y-5 order-2 lg:order-1">
                <div className="flex items-center gap-2.5">
                  <img loading="lazy" decoding="async" src={swiftClearLogo} alt="Swift Clear Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
                  <span className="text-xs font-bold tracking-[0.2em] text-[#0369A1] uppercase">
                    02 / DISINFECTION & HYGIENE
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-sans text-slate-900 leading-none">
                  SWIFT CLEAR <span className="text-[#0369A1]">SANITATION</span>
                </h2>

                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-normal">
                  {copy.swiftclear_text as string}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquire?.('Swift Clear')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#0369A1] text-white font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#075985] transition-all group cursor-pointer shadow-xl"
                  >
                    <span>INQUIRE ABOUT SWIFT CLEAR</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/subsidiaries/swiftclear')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#0369A1] text-[#0369A1] font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#075985] hover:text-white transition-all group cursor-pointer"
                  >
                    <span>VISIT FULL SITE</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Right Image Composition */}
              <motion.div style={imageStyle} className="lg:col-span-7 grid grid-cols-12 gap-2.5 order-1 lg:order-2">
                <div className="col-span-6 space-y-2.5">
                  <div className="h-[220px] sm:h-[300px] md:h-[340px] overflow-hidden rounded-none border border-[#0369A1]/30 shadow-xl bg-white group relative">
                    <img loading="lazy" decoding="async" src={scMisting} alt="Electrostatic Misting Buster" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                  </div>
                  <div className="h-[130px] sm:h-[170px] rounded-none overflow-hidden border border-slate-200 shadow-md bg-white group cursor-pointer">
                    <img loading="lazy" decoding="async" src={scMission} alt="Sanitation Services Mission" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>

                <div className="col-span-6 space-y-2.5 pt-4 sm:pt-6">
                  <div className="h-[130px] sm:h-[170px] rounded-none overflow-hidden border border-[#0369A1]/30 shadow-md bg-white group cursor-pointer">
                    <img loading="lazy" decoding="async" src={scUv} alt="UV Light Sterilization" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="h-[220px] sm:h-[300px] md:h-[340px] overflow-hidden rounded-none border border-slate-200 shadow-xl bg-white group cursor-pointer">
                    <img loading="lazy" decoding="async" src={scAbout} alt="Sanitation Equipment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </motion.div>

            </div>
          )}
        </EditorialBlock>

        {/* =========================================================================
            3. DYNAMIC TREE MULTIMEDIA (Pink and White)
           ========================================================================= */}
        <EditorialBlock id="dynamic-tree" imageOnLeft={true} bgTone="bg-[#FDF2F8] text-slate-900">
          {({ imageStyle, contentStyle }) => (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
              
              {/* Left Media Collage */}
              <motion.div style={imageStyle} className="lg:col-span-7 grid grid-cols-12 gap-2.5">
                <div className="col-span-7 h-[280px] sm:h-[370px] md:h-[440px] overflow-hidden rounded-none border border-[#BE185D]/30 shadow-2xl group bg-white cursor-pointer">
                  <img loading="lazy" decoding="async" src={dtModel1} alt="Broadcasting Talent" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="col-span-5 space-y-2.5">
                  <div className="h-[135px] sm:h-[178px] md:h-[215px] overflow-hidden rounded-none border border-slate-200 shadow-xl group bg-white cursor-pointer">
                    <img loading="lazy" decoding="async" src={dtBgFront} alt="Dynamic Tree Production" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="h-[135px] sm:h-[178px] md:h-[215px] overflow-hidden rounded-none border border-slate-200 shadow-xl group bg-white cursor-pointer">
                    <img loading="lazy" decoding="async" src={dtModel2} alt="Creative Visual Direction" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>

                <div className="col-span-5 h-[130px] sm:h-[160px] overflow-hidden rounded-none border border-slate-200 shadow-xl group bg-white cursor-pointer">
                  <img loading="lazy" decoding="async" src={dtModel3} alt="Cinematic Stage" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="col-span-7 h-[130px] sm:h-[160px] overflow-hidden rounded-none border border-[#BE185D]/30 shadow-xl group bg-white cursor-pointer">
                  <img loading="lazy" decoding="async" src={dtModel4} alt="Media Production" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </motion.div>

              {/* Right Content */}
              <motion.div style={contentStyle} className="lg:col-span-5 space-y-3.5 sm:space-y-5">
                <div className="flex items-center gap-2.5">
                  <img loading="lazy" decoding="async" src={dynamicTreeLogo} alt="Dynamic Tree Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
                  <span className="text-xs font-bold tracking-[0.2em] text-[#BE185D] uppercase">
                    03 / CREATIVE MEDIA & BROADCASTING
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-sans text-slate-900 leading-none">
                  DYNAMIC TREE <span className="text-[#BE185D]">MULTIMEDIA</span>
                </h2>

                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-normal">
                  {copy.dynamic_tree_text as string}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquire?.('Dynamic Tree Multimedia Services')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#BE185D] text-white font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#9D174D] transition-all group cursor-pointer shadow-xl"
                  >
                    <span>EXPLORE MULTIMEDIA SERVICES</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/subsidiaries/dynamic-tree')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#BE185D] text-[#BE185D] font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#9D174D] hover:text-white transition-all group cursor-pointer"
                  >
                    <span>VISIT FULL SITE</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

            </div>
          )}
        </EditorialBlock>

        {/* =========================================================================
            4. LUXE PRIME REALTY (Black and Gold)
           ========================================================================= */}
        <EditorialBlock id="luxe-prime" imageOnLeft={false} bgTone="bg-[#120E05]">
          {({ imageStyle, contentStyle }) => (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
              
              {/* Left Content Column */}
              <motion.div style={contentStyle} className="lg:col-span-5 space-y-3.5 sm:space-y-5 order-2 lg:order-1">
                <div className="flex items-center gap-2.5">
                  <img loading="lazy" decoding="async" src={luxeLogo} alt="Luxe Prime Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
                  <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                    04 / LUXURY ESTATES & RESIDENCES
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-sans text-white leading-none">
                  LUXE PRIME <span className="text-[#D4AF37]">REALTY</span>
                </h2>

                <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-normal">
                  {copy.luxe_prime_text as string}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquire?.('Luxe Prime Realty')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#FFF0B3] transition-all group cursor-pointer shadow-xl"
                  >
                    <span>DISCOVER LUXE PROPERTIES</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/subsidiaries/luxe-prime')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#D4AF37] text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#D4AF37] hover:text-neutral-950 transition-all group cursor-pointer"
                  >
                    <span>VISIT FULL SITE</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Right Luxury Hero Image Showcase - Asymmetric Split Frame */}
              <motion.div style={imageStyle} className="lg:col-span-7 grid grid-cols-12 gap-2.5 order-1 lg:order-2">
                <div className="col-span-7 h-[320px] sm:h-[420px] md:h-[490px] overflow-hidden rounded-none border border-[#D4AF37]/50 shadow-2xl bg-neutral-900 group relative">
                  <img loading="lazy" decoding="async" src={luxeBg} alt="Luxe Prime Estates" className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-[#D4AF37]/90 text-neutral-950 text-xs font-black px-2.5 py-1 tracking-widest uppercase backdrop-blur-sm">
                    High Value Portfolio
                  </div>
                </div>
                
                <div className="col-span-5 flex flex-col justify-between gap-2.5">
                  <div className="h-[155px] sm:h-[205px] md:h-[240px] rounded-none overflow-hidden border border-white/15 shadow-lg bg-neutral-900 group cursor-pointer">
                    <img loading="lazy" decoding="async" src={luxeVision} alt="Innovation Vision" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="h-[155px] sm:h-[205px] md:h-[240px] rounded-none overflow-hidden border border-[#D4AF37]/40 shadow-lg bg-neutral-900 group cursor-pointer">
                    <img loading="lazy" decoding="async" src={luxePartner} alt="Strategic Partnership" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
              </motion.div>

            </div>
          )}
        </EditorialBlock>

        {/* =========================================================================
            5. ALTA VENTURE OUTSOURCE (Green, White and Blue)
           ========================================================================= */}
        <EditorialBlock id="alta-venture" imageOnLeft={true} bgTone="bg-[#ECFDF5] text-slate-900">
          {({ imageStyle, contentStyle }) => (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
              
              {/* Left Collage Composition - BPO Cross Grid */}
              <motion.div style={imageStyle} className="lg:col-span-7 grid grid-cols-12 gap-2.5">
                <div className="col-span-7 h-[210px] sm:h-[270px] md:h-[300px] overflow-hidden rounded-none border border-[#047857]/30 shadow-xl bg-white group cursor-pointer">
                  <img loading="lazy" decoding="async" src={altaImg1} alt="Alta Venture BPO Team" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="col-span-5 h-[210px] sm:h-[270px] md:h-[300px] overflow-hidden rounded-none border border-slate-200 shadow-xl bg-white group cursor-pointer">
                  <img loading="lazy" decoding="async" src={altaBg} alt="Alta Venture Workspace" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>

                <div className="col-span-5 h-[160px] sm:h-[210px] overflow-hidden rounded-none border border-[#0369A1]/30 shadow-md bg-white group cursor-pointer">
                  <img loading="lazy" decoding="async" src={altaImg2} alt="BPO Team Operations" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="col-span-7 h-[160px] sm:h-[210px] overflow-hidden rounded-none border border-[#047857]/30 shadow-md bg-white group cursor-pointer">
                  <img loading="lazy" decoding="async" src={altaImg3} alt="Global Client Support" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </motion.div>

              {/* Right Text */}
              <motion.div style={contentStyle} className="lg:col-span-5 space-y-3.5 sm:space-y-5">
                <div className="flex items-center gap-2.5">
                  <img loading="lazy" decoding="async" src={altaLogo} alt="Alta Venture Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
                  <span className="text-xs font-bold tracking-[0.2em] text-[#047857] uppercase">
                    05 / GLOBAL BPO & OFFSHORING
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-sans text-slate-900 leading-none">
                  ALTA VENTURE <span className="text-[#0369A1]">OUTSOURCE</span>
                </h2>

                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-normal">
                  {copy.alta_venture_text as string}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquire?.('Alta Venture Outsource')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#047857] text-white font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#075985] transition-all group cursor-pointer shadow-xl"
                  >
                    <span>PARTNER WITH ALTA VENTURE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/subsidiaries/alta-venture')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#047857] text-[#047857] font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#047857] hover:text-white transition-all group cursor-pointer"
                  >
                    <span>VISIT FULL SITE</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

            </div>
          )}
        </EditorialBlock>

        {/* =========================================================================
            6. ALPHA PREMIER CONSTRUCTION (Black and Gold)
           ========================================================================= */}
        <EditorialBlock id="construction" imageOnLeft={false} bgTone="bg-[#140F06]">
          {({ imageStyle, contentStyle }) => (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
                
                {/* Left Text */}
                <motion.div style={contentStyle} className="lg:col-span-5 space-y-3.5 sm:space-y-5 order-2 lg:order-1">
                  <div className="flex items-center gap-2.5">
                    <img loading="lazy" decoding="async" src={constructionLogo} alt="Construction Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
                    <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                      06 / COMMERCIAL CONSTRUCTION
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-sans text-white leading-none">
                    ALPHA PREMIER <span className="text-[#D4AF37]">CONSTRUCTION</span>
                  </h2>

                  <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-normal">
                    {copy.construction_text as string}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenInquire?.('Alpha Premier Construction')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#FFF3D1] transition-all group cursor-pointer shadow-xl"
                    >
                      <span>START A CONSTRUCTION PROJECT</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/subsidiaries/construction')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#D4AF37] text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#D4AF37] hover:text-neutral-950 transition-all group cursor-pointer"
                    >
                      <span>VISIT FULL SITE</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Right Hero Image Collage - Industrial Wide Banner & Tri-Panel */}
                <motion.div style={imageStyle} className="lg:col-span-7 space-y-2.5 order-1 lg:order-2">
                  <div className="w-full h-[220px] sm:h-[300px] md:h-[330px] overflow-hidden rounded-none border border-[#D4AF37]/50 shadow-2xl bg-neutral-900 group relative">
                    <img loading="lazy" decoding="async" src={constructionServicesImg} alt="Commercial Construction Infrastructure" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute bottom-3 right-3 bg-[#D4AF37] text-neutral-950 text-xs font-black px-3 py-1 tracking-widest uppercase">
                      Civil & Structural Works
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="h-28 sm:h-40 rounded-none overflow-hidden border border-white/15 shadow-md group cursor-pointer relative">
                      <img loading="lazy" decoding="async" src={constructionMission} alt="Engineering Excellence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 uppercase">Engineering</span>
                    </div>
                    <div className="h-28 sm:h-40 rounded-none overflow-hidden border border-[#D4AF37]/40 shadow-md group cursor-pointer relative">
                      <img loading="lazy" decoding="async" src={constructionVision} alt="Civil & Structural Builds" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <span className="absolute bottom-1 left-1 bg-[#D4AF37] text-neutral-950 text-xs font-extrabold px-1.5 py-0.5 uppercase">Build-Outs</span>
                    </div>
                    <div className="h-28 sm:h-40 rounded-none overflow-hidden border border-white/15 shadow-md group cursor-pointer relative">
                      <img loading="lazy" decoding="async" src={constructionCore} alt="Architectural Fit-outs" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 uppercase">Fit-Outs</span>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Minimal HVAC Partner Logos Bar */}
              <div className="pt-4 text-center">
                <span className="block text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2.5">
                  AUTHORIZED HVAC & ENGINEERING BRAND PARTNERS
                </span>
                <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3.5">
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
                    <div key={idx} className="h-8 sm:h-10 px-3 py-1 bg-white/5 rounded-none border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">
                      <img loading="lazy" decoding="async" src={brand.logo} alt={brand.name} className="h-full object-contain max-w-[60px] sm:max-w-[75px] filter brightness-110" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </EditorialBlock>

        {/* =========================================================================
            7. 88 PRIME TRADING & VIRTUAL SERVICES (Blue and White)
           ========================================================================= */}
        <EditorialBlock id="88-prime" imageOnLeft={true} bgTone="bg-[#EFF6FF] text-slate-900">
          {({ imageStyle, contentStyle }) => (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
              
              {/* Left Image Showcase - Multi-Level Matrix */}
              <motion.div style={imageStyle} className="lg:col-span-7 grid grid-cols-12 gap-2.5">
                <div className="col-span-5 space-y-2.5">
                  <div className="h-[190px] sm:h-[240px] md:h-[270px] overflow-hidden rounded-none border border-[#2563EB]/40 shadow-xl bg-white group cursor-pointer relative">
                    <img loading="lazy" decoding="async" src={prime88Pricing} alt="88 Prime Virtual Address & Services" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute bottom-2 left-2 bg-[#2563EB] text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wider">
                      Virtual Address & Trading
                    </div>
                  </div>
                  <div className="h-[135px] sm:h-[175px] md:h-[190px] overflow-hidden rounded-none border border-[#2563EB]/30 shadow-md bg-white group cursor-pointer relative">
                    <img loading="lazy" decoding="async" src={prime88Partnership} alt="Enterprise Partnership" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>

                <div className="col-span-7 space-y-2.5">
                  <div className="h-[165px] sm:h-[205px] md:h-[220px] overflow-hidden rounded-none border border-slate-200 shadow-md bg-white group cursor-pointer relative">
                    <img loading="lazy" decoding="async" src={prime88Sourcing} alt="Global Sourcing" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-xs font-medium px-2 py-0.5 uppercase tracking-wider">
                      Global Sourcing
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="h-[160px] sm:h-[210px] md:h-[240px] rounded-none overflow-hidden border border-slate-200 shadow-md bg-white group cursor-pointer relative">
                      <img loading="lazy" decoding="async" src={prime88Wpc} alt="WPC Materials" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute bottom-1 left-1 bg-white/90 text-slate-800 text-xs font-bold px-1.5 py-0.5 uppercase">WPC Panels</div>
                    </div>
                    <div className="h-[160px] sm:h-[210px] md:h-[240px] rounded-none overflow-hidden border border-slate-200 shadow-md bg-white group cursor-pointer relative">
                      <img loading="lazy" decoding="async" src={prime88Pvc} alt="PVC Materials" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute bottom-1 left-1 bg-white/90 text-slate-800 text-xs font-bold px-1.5 py-0.5 uppercase">PVC Cladding</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Content */}
              <motion.div style={contentStyle} className="lg:col-span-5 space-y-3.5 sm:space-y-5">
                <div className="flex items-center gap-2.5">
                  <img loading="lazy" decoding="async" src={prime88Logo} alt="88 Prime Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
                  <span className="text-xs font-bold tracking-[0.2em] text-[#2563EB] uppercase">
                    07 / TRADING & VIRTUAL OFFICE
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-sans text-slate-900 leading-none">
                  88 PRIME <span className="text-[#2563EB]">TRADING</span>
                </h2>

                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-normal">
                  {copy.prime88_text as string}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquire?.('88 Prime')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#1D4ED8] transition-all group cursor-pointer shadow-xl"
                  >
                    <span>INQUIRE WITH 88 PRIME</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/subsidiaries/88prime')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#2563EB] text-[#2563EB] font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#2563EB] hover:text-white transition-all group cursor-pointer"
                  >
                    <span>VISIT FULL SITE</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

            </div>
          )}
        </EditorialBlock>

        {/* =========================================================================
            8. VIRTUAL OFFICE (Black and Gold) — plans and prices from service_items
           ========================================================================= */}
        <EditorialBlock id="virtual-office" imageOnLeft={false} bgTone="bg-[#120E05]">
          {({ imageStyle, contentStyle }) => (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">

              {/* Left Text Content */}
              <motion.div style={contentStyle} className="lg:col-span-5 space-y-3.5 sm:space-y-5 order-2 lg:order-1">
                <div className="flex items-center gap-2.5">
                  <img loading="lazy" decoding="async" src={apgLogo} alt="Alpha Premier Group Logo" className="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
                  <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                    08 / VIRTUAL OFFICE
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-sans text-white leading-none">
                  VIRTUAL <span className="text-[#D4AF37]">OFFICE</span>
                </h2>

                <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-normal">
                  {copy.virtual_office_text as string}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenInquire?.(INQUIRY_VO_NAME)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#FFF3D1] transition-all group cursor-pointer shadow-xl"
                  >
                    <span>INQUIRE ABOUT VIRTUAL OFFICE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/virtual-office')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-[#D4AF37] text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#D4AF37] hover:text-neutral-950 transition-all group cursor-pointer"
                  >
                    <span>VIEW ALL PLANS</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Right: plan tiles (same plans and prices as the /virtual-office page) */}
              <motion.div style={imageStyle} className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5 order-1 lg:order-2">
                {voTiles.map((pkg, i) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => navigate(voInquirePath(pkg))}
                    aria-label={`Inquire about the ${pkg.title} virtual office plan, ${pkg.price}`}
                    className="h-40 sm:h-[260px] md:h-[320px] rounded-none overflow-hidden border border-[#D4AF37]/40 group cursor-pointer shadow-xl bg-neutral-900 relative text-left"
                  >
                    <img loading="lazy" decoding="async" src={voTileImage(pkg.image_url, i)} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                    <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col gap-1 min-w-0">
                      <span className="text-[#D4AF37] font-black text-xl sm:text-2xl leading-none tabular-nums drop-shadow">{pkg.price}</span>
                      <span className="text-white/90 text-xs font-bold uppercase tracking-wider">{pkg.title}</span>
                    </span>
                  </button>
                ))}
              </motion.div>

            </div>
          )}
        </EditorialBlock>

      </div>
    </div>
  );
};
