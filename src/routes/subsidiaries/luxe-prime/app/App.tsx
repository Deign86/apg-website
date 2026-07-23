import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
const luxePrimeLogo = "/assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png";
const alphaPremierLogo = "/assets/luxe-prime/alpha_premier_logo.png";

// ── Types ─────────────────────────────────────────────────────────────────────
type Page = "home" | "services" | "blogs" | "careers" | "inquire";
interface LightboxState { photos: string[]; idx: number; alt: string; }

// ── Data ──────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 0,
    title: "Co-managed Subleasing",
    image: "https://images.unsplash.com/photo-1780257562963-3389a4105371?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1780257562963-3389a4105371?w=1200&q=85",
      "https://images.unsplash.com/photo-1776362355123-ca966d36e29c?w=1200&q=85",
      "https://images.unsplash.com/photo-1780257562941-d9a6923befa1?w=1200&q=85",
    ],
    description: "Luxe Prime Realty offers a modern approach to subleasing that empowers property owners without sacrificing quality. Our co-managed model provides the flexibility of short and mid-term rentals while ensuring your asset is treated with the utmost care and professionalism.",
    detail: "We serve as an active co-manager in your sublease arrangement — screening tenants, overseeing turnovers, managing guest relations, and ensuring regulatory compliance. You retain ownership; we deliver performance.",
  },
  {
    id: 1,
    title: "End-to-End Property Administration",
    image: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1200&q=85",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85",
      "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=1200&q=85",
    ],
    description: "From tenant vetting and lease management to maintenance coordination and financial reporting, we oversee every detail of your property's lifecycle — so you can enjoy ownership without the operational burden.",
    detail: "Our administration team handles onboarding, lease renewals, utility coordination, maintenance dispatch, and monthly reporting. Every touchpoint is documented; every issue resolved with urgency and precision.",
  },
  {
    id: 2,
    title: "Short & Long-Term Leasing Strategies",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85",
      "https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?w=1200&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=85",
    ],
    description: "We craft bespoke leasing strategies tailored to your investment goals — whether maximizing short-term yields or securing stable long-term tenancies, informed by market intelligence and your unique asset profile.",
    detail: "We analyze occupancy trends, comparable rates, and demand cycles to position your property for optimal returns. Whether the goal is premium short stays or anchor long-term leases, our strategy is data-backed and owner-aligned.",
  },
  {
    id: 3,
    title: "Concierge-Level Service and Support",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85",
      "https://images.unsplash.com/photo-1758448756350-3d0eec02ba37?w=1200&q=85",
      "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=1200&q=85",
    ],
    description: "Our white-glove concierge team is available around the clock, offering personalized support to both owners and tenants. We set a new standard in luxury real estate care — attentive, discreet, and always exceptional.",
    detail: "From move-in coordination and lifestyle requests to emergency response and vendor relations, our concierge team handles it all. We don't just manage properties — we curate experiences that keep tenants and owners alike returning.",
  },
];

const ADVANTAGES = [
  { title: "Strategic Partnerships", body: "We maintain strong alliances with top-tier developers and industry leaders, giving our clients master access to the most sought-after properties and off-market listings in the region. This ensures unmatched opportunities for growth and prestige." },
  { title: "Data-Driven Decisions", body: "We harness analytics, real-time trends, and predictive insights to guide our clients toward high-return investments. Every decision is backed by data to ensure smart, confident moves in a fast-paced market." },
  { title: "Innovation & Visions", body: "We embrace the future of real estate through tech-driven tools, virtual consultations, and adaptable leasing solutions. Our forward-thinking approach ensures you stay ahead in a dynamic, evolving property landscape." },
];

const BLOGS = [
  { slug: "curating-luxury", title: "Curating Luxury: Inside Luxe Prime's Private Portfolio", excerpt: "A rare look at the exclusive off-market listings that define our approach to high-prestige property curation — where discretion meets distinction.", body: "At Luxe Prime Realty, every property in our private portfolio represents more than square footage — it embodies a philosophy. We seek assets that offer architectural distinction, exceptional location, and investment resilience. Our curators work directly with developers and legacy owners to surface properties before they ever reach the open market, giving our clients a decisive advantage in a landscape where timing is everything.", image: "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=1200&q=85", date: "June 28, 2026", category: "Portfolio", readTime: "5 min read" },
  { slug: "market-intelligence", title: "Market Intelligence: Strategies for Distressed and Legacy Assets", excerpt: "How data-driven insight and strategic partnerships unlock value in overlooked markets, turning legacy assets into high-yield opportunities.", body: "Distressed and legacy assets often carry the highest upside for informed investors — yet they demand a level of insight and patience that most overlook. Our analysts at Luxe Prime combine macroeconomic indicators, localized vacancy data, and developer pipeline intelligence to identify these windows before they close. The result: high-conviction moves in markets others have yet to discover.", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=85", date: "June 14, 2026", category: "Strategy", readTime: "6 min read" },
  { slug: "prestige-practicality", title: "Prestige & Practicality: Redefining High-End Lease Management", excerpt: "Explore how Luxe Prime's co-managed subleasing model bridges the gap between luxury property ownership and modern rental flexibility.", body: "The modern property owner faces a paradox: the desire for premium passive income and the demand for hands-off management. Luxe Prime's co-managed subleasing model resolves this tension entirely. By acting as a true operational partner — not just a listing agent — we maximize yield while ensuring the property is maintained to standards that protect long-term asset value. Prestige and practicality, finally in one place.", image: "https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?w=1200&q=85", date: "May 30, 2026", category: "Insights", readTime: "4 min read" },
];

const CAREERS = [
  { title: "Associate Partner, Exclusive Listings", location: "Pasig City, Metro Manila", type: "Full-time", description: "Lead the acquisition and presentation of our most prestigious off-market listings. Ideal for experienced real estate professionals with a cultivated network and an eye for exceptional properties.", responsibilities: ["Source and negotiate acquisition of exclusive, off-market residential and commercial listings", "Maintain and grow a network of developers, property owners, and high-net-worth investors", "Present properties to clients with a consultative, trust-first approach", "Collaborate with the administration and concierge teams to ensure seamless handover"], requirements: ["Minimum 3 years experience in luxury real estate sales or brokerage", "Active PRC Real Estate Broker license", "Proven track record with high-value transactions", "Excellent presentation and relationship management skills"] },
  { title: "Lead Analyst, Real Estate Strategy", location: "Pasig City, Metro Manila", type: "Full-time", description: "Drive market analysis and investment intelligence for our high-net-worth client portfolio. You will synthesize data, trends, and forecasts into actionable strategies that power confident decisions.", responsibilities: ["Conduct in-depth market research across Metro Manila and key provincial markets", "Build financial models for acquisition, leasing yield, and asset repositioning scenarios", "Prepare investment briefs and executive-level strategy decks for client presentations", "Monitor macroeconomic indicators and translate insights into portfolio recommendations"], requirements: ["Degree in Finance, Economics, Real Estate, or related field", "3+ years in real estate research, investment banking, or property consulting", "Proficiency in Excel financial modeling; experience with PropTech tools preferred", "Strong written communication and analytical reasoning"] },
  { title: "Senior Concierge Coordinator", location: "Pasig City, Metro Manila", type: "Full-time", description: "Orchestrate world-class support experiences for property owners and tenants alike. You will be the standard-bearer of our white-glove service philosophy — attentive, proactive, and uncompromising in quality.", responsibilities: ["Serve as the primary point of contact for tenants and property owners across managed units", "Coordinate move-in/move-out logistics, maintenance requests, and vendor engagements", "Anticipate client needs and resolve issues before they escalate", "Maintain detailed service logs and produce monthly satisfaction reports"], requirements: ["Background in luxury hospitality, property management, or executive assistance", "Exceptional interpersonal and problem-solving skills", "Availability for on-call response during urgent situations", "Proficiency in property management software and communication tools"] },
];

// ═════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═════════════════════════════════════════════════════════════════════════════
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// Stable particle data (not random each render)
const PARTICLES = [
  {x:8,y:15,s:2.2,d:8.4,dur:12},{x:22,y:72,s:1.4,d:2.1,dur:10},{x:35,y:40,s:2.8,d:5.7,dur:14},
  {x:48,y:85,s:1.8,d:0.3,dur:11},{x:60,y:20,s:1.2,d:7.2,dur:9},{x:73,y:55,s:2.5,d:3.8,dur:13},
  {x:85,y:30,s:1.6,d:6.1,dur:12},{x:92,y:68,s:2.0,d:1.5,dur:10},{x:15,y:92,s:1.3,d:4.9,dur:15},
  {x:55,y:10,s:2.4,d:2.8,dur:11},{x:78,y:80,s:1.7,d:8.0,dur:9},{x:42,y:60,s:1.1,d:0.9,dur:13},
  {x:6,y:48,s:2.1,d:5.2,dur:14},{x:68,y:35,s:1.9,d:3.3,dur:10},{x:30,y:25,s:2.6,d:7.6,dur:12},
];

function use3DTilt(maxTilt = 7) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale(1.025)`;
    el.style.transition = "transform 0.1s ease";
  }, [maxTilt]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(700px) rotateX(0) rotateY(0) scale(1)";
    el.style.transition = "transform 0.6s ease";
  }, []);
  return { ref, onMove, onLeave };
}

function useParallax(strength = 0.22) {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            setOffset(-rect.top * strength);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [strength]);
  return { sectionRef, offset };
}

// ═════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═════════════════════════════════════════════════════════════════════════════

function FadeIn({ children, delay = 0, direction = "up", className = "" }: {
  children: ReactNode; delay?: number; direction?: "up" | "left" | "right" | "none"; className?: string;
}) {
  const { ref, visible } = useFadeIn();
  const initial = { up: "translateY(28px)", left: "translateX(-28px)", right: "translateX(28px)", none: "none" }[direction];
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : initial,
      transition: `opacity 0.85s ease ${delay}ms, transform 0.85s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]" style={{ background: "rgba(196,154,42,0.08)" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#7A5810,#C49A2A,#F0D080)", boxShadow: "0 0 10px rgba(196,154,42,0.7)", transition: "width 0.08s linear" }} />
    </div>
  );
}


// ── Floating particles ────────────────────────────────────────────────────────
function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p, i) => (
        <div key={i} className="absolute rounded-full bg-[#C49A2A]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.s}px`, height: `${p.s}px`, opacity: 0.25, animation: `particleRise ${p.dur}s ease-in-out ${p.d}s infinite` }} />
      ))}
    </div>
  );
}

// ── 3D tilt card wrapper ──────────────────────────────────────────────────────
function Tilt3D({ children, className = "", maxTilt = 7 }: { children: ReactNode; className?: string; maxTilt?: number }) {
  const { ref, onMove, onLeave } = use3DTilt(maxTilt);
  return (
    <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
      {children}
    </div>
  );
}

// ── Ripple button ─────────────────────────────────────────────────────────────
function RippleButton({ children, onClick, className = "", style: s, onMouseEnter, onMouseLeave }: {
  children: ReactNode; onClick?: () => void; className?: string; style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((rp) => rp.id !== id)), 700);
    onClick?.();
  };
  return (
    <button ref={btnRef} onClick={handleClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={`relative overflow-hidden ${className}`} style={s}>
      {children}
      {ripples.map((rp) => (
        <span key={rp.id} className="absolute pointer-events-none rounded-full"
          style={{ left: rp.x - 40, top: rp.y - 40, width: 80, height: 80, background: "rgba(196,154,42,0.35)", animation: "rippleOut 0.7s ease-out forwards" }} />
      ))}
    </button>
  );
}

function Diamond({ size = 48, dark = false, float = false, className = "" }: {
  size?: number; dark?: boolean; float?: boolean; className?: string;
}) {
  const outer = dark ? "#7A5810" : "#C49A2A";
  const mid = dark ? "#8B6914" : "#B8892A";
  const inner = dark ? "#C49A2A" : "#F0D080";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}
      style={{ flexShrink: 0, animation: float ? "diamondFloat 3.5s ease-in-out infinite" : undefined }}>
      <polygon points="24,2 46,24 24,46 2,24" fill="none" stroke={outer} strokeWidth="1.2" />
      <polygon points="24,8 40,24 24,40 8,24" fill={mid} />
      <polygon points="24,14 34,24 24,34 14,24" fill={inner} opacity="0.65" />
    </svg>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex-1 max-w-[80px] h-px bg-gradient-to-r from-transparent to-[#C49A2A]/40" />
      <Diamond size={18} float />
      <div className="flex-1 max-w-[80px] h-px bg-gradient-to-l from-transparent to-[#C49A2A]/40" />
    </div>
  );
}

function AlphaLogo({ className = "" }: { className?: string }) {
  return <ImageWithFallback src={alphaPremierLogo} alt="Alpha Premier Group" className={className} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// LIGHTBOX
// ═════════════════════════════════════════════════════════════════════════════
function Lightbox({ state, onClose }: { state: LightboxState; onClose: () => void }) {
  const [idx, setIdx] = useState(state.idx);
  const { photos, alt } = state;

  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(10px)", animation: "pageFadeIn 0.25s ease" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-white/50 hover:text-[#C49A2A] transition-colors duration-300"
        style={{ border: "1px solid rgba(196,154,42,0.3)" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="2" y1="2" x2="12" y2="12" /><line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>

      {/* Image */}
      <div
        className="relative flex items-center justify-center"
        style={{ maxWidth: "92vw", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photos[idx]}
          alt={`${alt} ${idx + 1}`}
          className="max-w-full max-h-[88vh] object-contain"
          style={{ boxShadow: "0 0 80px rgba(196,154,42,0.12)", border: "1px solid rgba(196,154,42,0.25)" }}
        />
        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 text-center pb-2">
          <span className="text-white/30 font-['Montserrat'] text-[10px] tracking-widest">{idx + 1} / {photos.length}</span>
        </div>
      </div>

      {/* Prev / Next */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#C49A2A] hover:bg-[#C49A2A]/15 transition-all duration-300"
            style={{ border: "1px solid rgba(196,154,42,0.4)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2L4 7l5 5"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#C49A2A] hover:bg-[#C49A2A]/15 transition-all duration-300"
            style={{ border: "1px solid rgba(196,154,42,0.4)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2l5 5-5 5"/></svg>
          </button>
        </>
      )}

      {/* Dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i === idx ? "#C49A2A" : "rgba(255,255,255,0.25)", transform: i === idx ? "scale(1.4)" : "scale(1)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PHOTO CAROUSEL (mobile) — with lightbox support
// ═════════════════════════════════════════════════════════════════════════════
function PhotoCarousel({ photos, title, onOpenLightbox }: {
  photos: string[]; title: string;
  onOpenLightbox?: (idx: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div className="relative">
      <div
        className="overflow-hidden h-52 relative cursor-zoom-in"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
        }}
        onClick={() => onOpenLightbox?.(idx)}
      >
        <img src={photos[idx]} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.3)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C49A2A" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
      </div>
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 border border-[#C49A2A]/40 text-[#C49A2A] hover:bg-black/70 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2L4 6l4 4"/></svg>
      </button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 border border-[#C49A2A]/40 text-[#C49A2A] hover:bg-black/70 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2l4 4-4 4"/></svg>
      </button>
      <div className="flex justify-center gap-2 mt-3">
        {photos.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i === idx ? "#C49A2A" : "rgba(255,255,255,0.25)", transform: i === idx ? "scale(1.4)" : "none" }}
          />
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// NAV
// ═════════════════════════════════════════════════════════════════════════════
function Nav({ currentPage, setPage }: { currentPage: Page; setPage: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [currentPage]);

  const links: { label: string; page: Page }[] = [
    { label: "Home", page: "home" }, { label: "Services", page: "services" },
    { label: "Blogs", page: "blogs" }, { label: "Careers", page: "careers" },
  ];
  const isHero = currentPage === "home" && !scrolled && !menuOpen;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 py-3 transition-all duration-500"
        style={{
          background: isHero ? "linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)" : "rgba(0,0,0,0.95)",
          backdropFilter: isHero ? "none" : "blur(14px)",
          borderBottom: isHero ? "none" : "1px solid rgba(196,154,42,0.12)",
        }}
      >
        <button onClick={() => setPage("home")} className="focus:outline-none group" style={{ transition: "transform 0.3s ease" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        >
          <AlphaLogo className="h-9 md:h-12 w-auto object-contain" />
        </button>
        <ul className="hidden md:flex gap-8 items-center">
          {links.map(({ label, page }) => (
            <li key={label}>
              <button onClick={() => setPage(page)}
                className="text-white text-xs tracking-[0.25em] uppercase font-['Montserrat'] relative group transition-colors duration-300 hover:text-[#C49A2A] focus:outline-none"
                style={{ color: currentPage === page ? "#C49A2A" : undefined }}
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-px bg-[#C49A2A] transition-all duration-400 group-hover:w-full"
                  style={{ width: currentPage === page ? "100%" : "0%" }} />
              </button>
            </li>
          ))}
          <li>
            <button onClick={() => setPage("inquire")}
              className="text-[#C49A2A] border border-[#C49A2A]/50 px-4 py-1.5 text-xs tracking-[0.25em] uppercase font-['Montserrat'] relative overflow-hidden group transition-all duration-300 hover:text-black focus:outline-none"
              style={{ transition: "background 0.35s ease, color 0.35s ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#C49A2A"; (e.currentTarget as HTMLElement).style.color = "black"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#C49A2A"; }}
            >
              Inquire
            </button>
          </li>
        </ul>
        {/* Hamburger */}
        <button onClick={() => setMenuOpen((o) => !o)} className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 focus:outline-none">
          <span className="block w-6 h-px bg-[#C49A2A] transition-all duration-300 origin-center" style={{ transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none" }} />
          <span className="block w-6 h-px bg-[#C49A2A] transition-all duration-300" style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-6 h-px bg-[#C49A2A] transition-all duration-300 origin-center" style={{ transform: menuOpen ? "translateY(-4px) rotate(-45deg)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed top-0 left-0 right-0 z-40 md:hidden overflow-hidden transition-all duration-500"
        style={{
          maxHeight: menuOpen ? "100vh" : "0",
          background: "rgba(0,0,0,0.97)",
          paddingTop: menuOpen ? "72px" : "0",
          borderBottom: menuOpen ? "1px solid rgba(196,154,42,0.2)" : "none",
        }}
      >
        <ul className="flex flex-col py-6 px-8 gap-1">
          {links.map(({ label, page }) => (
            <li key={label}>
              <button onClick={() => setPage(page)}
                className="w-full text-left py-4 font-['Cinzel'] text-base tracking-[0.2em] uppercase focus:outline-none border-b border-[#C49A2A]/10 transition-colors duration-200 hover:text-[#C49A2A]"
                style={{ color: currentPage === page ? "#C49A2A" : "white" }}
              >
                {label}
              </button>
            </li>
          ))}
          <li className="pt-4">
            <button onClick={() => setPage("inquire")} className="w-full border border-[#C49A2A] text-[#C49A2A] py-3 text-xs tracking-[0.35em] uppercase font-['Montserrat'] hover:bg-[#C49A2A] hover:text-black transition-all duration-300">
              Inquire Now
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═════════════════════════════════════════════════════════════════════════════
function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer className="bg-black pt-14 pb-8 px-5 md:px-10" style={{ borderTop: "1px solid rgba(196,154,42,0.18)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mb-10">
          <div className="flex flex-col items-start gap-5 sm:col-span-2 md:col-span-1">
            <AlphaLogo className="h-12 md:h-14 w-auto object-contain" />
            <button
              onClick={() => setPage("inquire")}
              className="relative overflow-hidden border border-[#C49A2A] text-[#C49A2A] bg-black px-7 py-3 text-xs tracking-[0.35em] uppercase font-['Montserrat'] transition-all duration-350 group"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#C49A2A"; (e.currentTarget as HTMLElement).style.color = "black"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "black"; (e.currentTarget as HTMLElement).style.color = "#C49A2A"; }}
            >
              Inquire Now
            </button>
          </div>
          <div>
            <h4 className="text-[#C49A2A] font-['Cinzel'] tracking-[0.3em] text-xs uppercase mb-5">Company</h4>
            <ul className="space-y-3">
              {(["home", "services", "blogs", "careers"] as Page[]).map((p) => (
                <li key={p}>
                  <button onClick={() => setPage(p)} className="text-white/50 hover:text-[#C49A2A] transition-colors duration-300 font-['Montserrat'] text-sm tracking-widest capitalize focus:outline-none hover:tracking-[0.2em] transition-all duration-300">
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[#C49A2A] font-['Cinzel'] tracking-[0.3em] text-xs uppercase mb-5">Connect</h4>
            <div className="space-y-3 font-['Montserrat'] text-sm text-white/50">
              <p className="hover:text-[#C49A2A] transition-colors duration-300 cursor-pointer">contact@alphapremier.com</p>
              <p className="hover:text-[#C49A2A] transition-colors duration-300 cursor-pointer">0915 888 9482 / 02 8 650 2540</p>
              <p className="leading-relaxed">Unit 3104, Philippine Stock Exchange Centre,<br />Tektite East Tower, Exchange Road,<br />Ortigas Center, Pasig City</p>
            </div>
            <div className="flex gap-3 mt-6">
              {[
                <path key="fb" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
                <g key="ig"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></g>,
                <path key="tt" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z" />,
              ].map((icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-full border border-[#C49A2A]/60 flex items-center justify-center text-[#C49A2A] transition-all duration-300"
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#C49A2A"; el.style.color = "black"; el.style.transform = "scale(1.1) translateY(-2px)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#C49A2A"; el.style.transform = "none"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={i === 1 ? "none" : "currentColor"}>{icon}</svg>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#C49A2A]/12 pt-6 text-center text-white/25 font-['Montserrat'] text-[11px] tracking-[0.2em] uppercase">
          © 2026 Alpha Premier Group of Companies OPC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HOME — HERO
// ═════════════════════════════════════════════════════════════════════════════
function Hero({ setPage }: { setPage: (p: Page) => void }) {
  const { sectionRef, offset } = useParallax(0.3);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSpotlight({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" onMouseMove={onMouseMove}>
      {/* Parallax background */}
      <div className="absolute inset-[-15%]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611323340350-bdcc0e6cfae5?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center", transform: `translateY(${offset}px)`, willChange: "transform" }} />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
      {/* Cursor spotlight */}
      <div className="absolute inset-0 pointer-events-none hidden md:block" style={{ background: `radial-gradient(circle 420px at ${spotlight.x}% ${spotlight.y}%, rgba(196,154,42,0.1) 0%, transparent 70%)`, transition: "background 0.15s ease" }} />
      {/* Floating particles */}
      <FloatingParticles />

      <div className="relative z-10 flex flex-col items-center text-center px-5" style={{ animation: "heroEnter 1.2s ease both" }}>
        <div className="mb-2 w-48 sm:w-64 md:w-72 lg:w-80" style={{ animation: "heroEnter 1.4s ease both" }}>
          <ImageWithFallback src={luxePrimeLogo} alt="Luxe Prime Realty" className="w-full object-contain" style={{ mixBlendMode: "screen" }} />
        </div>
        <p className="text-base sm:text-lg md:text-2xl tracking-[0.15em] font-['Cormorant_Garamond'] font-light mt-2" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)", animation: "heroEnter 1.6s ease both" }}>
          <span className="shimmer-gold">Where Prestige</span>{" "}
          <span className="text-white">Meets Practicality</span>
        </p>
        <RippleButton
          onClick={() => setPage("inquire")}
          className="mt-8 border border-[#C49A2A]/60 text-[#C49A2A] px-7 py-3 text-xs tracking-[0.35em] uppercase font-['Montserrat'] transition-all duration-300 active:scale-95"
          style={{ animation: "heroEnter 1.8s ease both" } as React.CSSProperties}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget; el.style.background = "#C49A2A"; el.style.color = "black"; el.style.boxShadow = "0 0 30px rgba(196,154,42,0.45)"; }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget; el.style.background = "transparent"; el.style.color = "#C49A2A"; el.style.boxShadow = "none"; }}
        >
          Inquire Now
        </RippleButton>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ animation: "heroEnter 2s ease both" }}>
        <div className="w-6 h-10 rounded-full border border-[#C49A2A]/70 flex items-start justify-center pt-2">
          <div className="w-1 h-2.5 rounded-full bg-[#C49A2A]" style={{ animation: "scrollBob 1.8s ease-in-out infinite" }} />
        </div>
        <span className="text-[#C49A2A]/70 text-[9px] tracking-[0.35em] uppercase font-['Montserrat']">scroll to explore</span>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HOME — PHILOSOPHY
// ═════════════════════════════════════════════════════════════════════════════
function Philosophy() {
  const { sectionRef, offset } = useParallax(0.2);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center py-20 px-5 md:px-10 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent z-10" />
      <div
        className="absolute inset-[-15%]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1527576539890-dfa815648363?w=1920&q=80')",
          backgroundSize: "cover", backgroundPosition: "center",
          transform: `translateY(${offset}px)`,
          willChange: "transform",
        }}
      />
      <div className="absolute inset-0 bg-black/72" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      <FadeIn className="relative z-10 max-w-3xl w-full mx-auto text-center" direction="up">
        <div
          style={{
            border: "1px solid rgba(196,154,42,0.5)",
            background: "linear-gradient(160deg, rgba(5,4,1,0.92) 0%, rgba(15,11,3,0.95) 100%)",
            boxShadow: "0 0 80px rgba(196,154,42,0.08), inset 0 0 60px rgba(196,154,42,0.02)",
            padding: "clamp(1.75rem, 6vw, 5rem)",
            animation: "goldPulseBox 6s ease-in-out infinite alternate",
          }}
        >
          <p className="text-[9px] sm:text-[10px] tracking-[0.45em] text-[#C49A2A]/70 uppercase font-['Montserrat'] mb-4">This Is Real Estate</p>
          <h2 className="font-['Cinzel'] font-normal shimmer-gold tracking-[0.15em] leading-tight mb-4" style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}>ELEVATED</h2>
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C49A2A]/50" />
            <Diamond size={20} float />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C49A2A]/50" />
          </div>
          <p className="text-[#C49A2A]/75 font-['Cormorant_Garamond'] italic text-base sm:text-lg md:text-xl tracking-wide mb-7">
            Redefining the Luxury Property Experience
          </p>
          <div className="text-left space-y-4 text-white/75 font-['Cormorant_Garamond'] text-base md:text-lg leading-[1.85]">
            <p>Luxe Prime Realty combines prestige with practicality to deliver real estate solutions that are both <span className="text-[#C49A2A]">sophisticated</span> and <span className="text-[#C49A2A]">strategic</span>. Our team brings deep industry expertise and a passion for excellence, ensuring precision in every phase of property management.</p>
            <p>From exclusive listings to end-to-end management, our commitment goes beyond transactions. We craft experiences tailored to the discerning few. Whether you&apos;re acquiring a landmark estate, seeking high-yield lease opportunities, or repositioning assets, Luxe Prime ensures every detail is managed with precision and care.</p>
            <p>We don&apos;t just manage real estate. With Luxe Prime Realty, <em className="text-[#C49A2A]">luxury isn&apos;t a standard — it&apos;s a statement.</em></p>
          </div>
          <div className="mt-8 flex justify-center">
            <Diamond size={34} float />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HOME — SERVICES TEASER
// ═════════════════════════════════════════════════════════════════════════════
function ServicesTeaser({ setPage }: { setPage: (p: Page) => void }) {
  const isMobile = useIsMobile();
  const [active, setActive] = useState<number | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);

  return (
    <section className="relative py-16 md:py-20 px-5 md:px-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#060504]" />
      <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(196,154,42,0.04) 0px, rgba(196,154,42,0.04) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, rgba(196,154,42,0.04) 0px, rgba(196,154,42,0.04) 1px, transparent 1px, transparent 64px)` }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <FadeIn className="mb-10 md:mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-1 h-10 md:h-14 bg-gradient-to-b from-[#C49A2A] to-[#7A5810]" />
            <h2 className="font-['Cinzel'] text-[#C49A2A] tracking-[0.1em] uppercase" style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}>
              Signature Services
            </h2>
          </div>
          <p className="text-white/55 font-['Cormorant_Garamond'] text-base md:text-xl italic ml-5">
            Elevating your real estate experience with <strong className="text-white/90 not-italic font-normal">unmatched flexibility</strong>, care, and strategic precision.
          </p>
        </FadeIn>

        {/* Desktop: horizontal expanding strip */}
        {!isMobile && (
          <FadeIn direction="up" delay={150}>
            <div className="flex gap-3 overflow-hidden" style={{ height: "clamp(340px, 46vh, 500px)" }}>
              {SERVICES.map((svc) => {
                const isActive = active === svc.id;
                const isDimmed = active !== null && !isActive;
                return (
                  <div
                    key={svc.id}
                    onMouseEnter={() => setActive(svc.id)}
                    onMouseLeave={() => setActive(null)}
                    className="relative overflow-hidden cursor-pointer"
                    style={{ flex: isActive ? "3.5 1 0%" : "1 1 0%", minWidth: "52px", transition: "flex 0.65s cubic-bezier(0.4,0,0.2,1)" }}
                  >
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${svc.image}')`, filter: isDimmed ? "brightness(0.28) saturate(0.4)" : isActive ? "brightness(0.55)" : "brightness(0.5)", transform: isActive ? "scale(1.04)" : "scale(1)", transition: "filter 0.65s ease, transform 0.65s ease" }} />
                    <div className="absolute inset-0" style={{ background: isActive ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%)", transition: "background 0.5s ease" }} />
                    <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(196,154,42,0.8), transparent)", opacity: isActive ? 1 : 0.4 }} />
                    <div className="absolute inset-0 flex items-end justify-center pb-6 px-3" style={{ opacity: isActive ? 0 : 1, transition: "opacity 0.3s ease" }}>
                      <p className="text-white font-['Cinzel'] text-[11px] tracking-widest uppercase text-center leading-snug"
                        style={active !== null ? { writingMode: "vertical-rl", transform: "rotate(180deg)" } : {}}>
                        {svc.title}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8" style={{ opacity: isActive ? 1 : 0, transform: isActive ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.45s ease 0.15s, transform 0.45s ease 0.15s", pointerEvents: isActive ? "auto" : "none" }}>
                      <div className="w-8 h-px bg-[#C49A2A] mb-3" />
                      <h3 className="text-[#C49A2A] font-['Cinzel'] text-base lg:text-lg uppercase tracking-wider mb-2 leading-tight">{svc.title}</h3>
                      <p className="text-white/80 font-['Cormorant_Garamond'] text-sm lg:text-base leading-relaxed max-w-md">{svc.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        )}

        {/* Mobile: vertical cards */}
        {isMobile && (
          <div className="space-y-3">
            {SERVICES.map((svc, i) => {
              const isOpen = mobileExpanded === i;
              return (
                <FadeIn key={svc.id} delay={i * 80}>
                  <div style={{ border: `1px solid ${isOpen ? "rgba(196,154,42,0.5)" : "rgba(196,154,42,0.18)"}`, background: isOpen ? "rgba(15,11,3,0.95)" : "rgba(8,6,2,0.8)", transition: "all 0.4s ease" }}>
                    <button onClick={() => setMobileExpanded(isOpen ? null : i)} className="w-full flex items-center gap-4 p-4 text-left focus:outline-none">
                      <div className="shrink-0 w-16 h-16 overflow-hidden">
                        <img src={svc.image} alt={svc.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="w-4 h-px bg-[#C49A2A] mb-1.5" />
                        <h3 className="text-[#C49A2A] font-['Cinzel'] text-sm tracking-wide leading-snug">{svc.title}</h3>
                      </div>
                      <div className="shrink-0 w-5 h-5 border border-[#C49A2A]/40 rounded-full flex items-center justify-center text-[#C49A2A] transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "none" }}>
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="1" x2="5" y2="9" /><line x1="1" y1="5" x2="9" y2="5" /></svg>
                      </div>
                    </button>
                    <div style={{ maxHeight: isOpen ? "400px" : "0", overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
                      <div className="px-4 pb-5 pt-1" style={{ borderTop: "1px solid rgba(196,154,42,0.15)" }}>
                        <div className="h-40 overflow-hidden mb-4">
                          <img src={svc.image} alt={svc.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-white/70 font-['Cormorant_Garamond'] text-base leading-relaxed mb-4">{svc.description}</p>
                        <button onClick={() => setPage("services")} className="text-[#C49A2A] text-xs tracking-[0.3em] uppercase font-['Montserrat'] border border-[#C49A2A]/40 px-4 py-2 hover:bg-[#C49A2A]/10 transition-colors">
                          Learn More →
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        <FadeIn delay={200}>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setPage("services")}
              className="text-[#C49A2A] border border-[#C49A2A]/40 px-5 py-2.5 text-xs tracking-[0.3em] uppercase font-['Montserrat'] flex items-center gap-2 transition-all duration-300"
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#C49A2A"; el.style.background = "rgba(196,154,42,0.1)"; el.style.letterSpacing = "0.35em"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(196,154,42,0.4)"; el.style.background = "transparent"; el.style.letterSpacing = "0.3em"; }}
            >
              View All Services <span>→</span>
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HOME — WHAT SETS US APART
// ═════════════════════════════════════════════════════════════════════════════
function WhatSetsUsApart() {
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState<number | null>(null);
  const [tapped, setTapped] = useState<number | null>(null);
  const isActive = (i: number) => isMobile ? tapped === i : hovered === i;

  return (
    <section className="relative py-16 md:py-24 px-5 md:px-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(140deg, #0a0800 0%, #1c1500 45%, #0a0800 70%, #050300 100%)" }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 90% 70% at 15% 60%, rgba(196,154,42,0.22) 0%, transparent 55%), radial-gradient(ellipse 70% 90% at 85% 25%, rgba(196,154,42,0.12) 0%, transparent 55%)`, animation: "goldFlow 10s ease-in-out infinite alternate" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeIn className="text-center mb-10 md:mb-16">
          <h2 className="font-['Cinzel'] shimmer-gold tracking-[0.08em] mb-5 leading-tight" style={{ fontSize: "clamp(1.8rem, 5vw, 3.8rem)" }}>What Sets Us Apart</h2>
          <p className="text-white/65 font-['Cormorant_Garamond'] text-base md:text-xl italic max-w-2xl mx-auto leading-relaxed">
            Discover the distinct advantages that <strong className="text-white not-italic font-normal">elevate our approach</strong> and <strong className="text-white not-italic font-normal">secure your success</strong> in the luxury market.
          </p>
          {isMobile && <p className="text-white/30 font-['Montserrat'] text-[10px] tracking-widest uppercase mt-3">Tap a card to explore</p>}
        </FadeIn>

        <div className="space-y-3 md:space-y-4">
          {ADVANTAGES.map((adv, i) => {
            const active = isActive(i);
            const cardContent = (
              <div
                onMouseEnter={() => !isMobile && setHovered(i)}
                onMouseLeave={() => !isMobile && setHovered(null)}
                onClick={() => isMobile && setTapped(tapped === i ? null : i)}
                className="relative overflow-hidden select-none"
                style={{
                  border: `1px solid ${active ? "rgba(196,154,42,0.55)" : "rgba(196,154,42,0.18)"}`,
                  background: active ? "linear-gradient(135deg, #f8efc0 0%, #e8c85a 45%, #c49a2a 100%)" : "rgba(8,6,2,0.82)",
                  transition: "all 0.9s cubic-bezier(0.4,0,0.2,1)",
                  padding: isMobile ? "1.25rem 1.5rem" : "clamp(1.5rem, 3vw, 2.5rem)",
                  cursor: isMobile ? "pointer" : "default",
                  boxShadow: active ? "0 8px 40px rgba(196,154,42,0.2)" : "none",
                }}
              >
                {!isMobile && (
                  <div className="absolute top-1/2 -translate-y-1/2" style={{ left: active ? "calc(100% - 76px)" : "24px", transition: "left 1.1s cubic-bezier(0.4,0,0.2,1)", zIndex: 0 }}>
                    <Diamond size={50} dark={active} />
                  </div>
                )}
                <div className="relative z-10" style={!isMobile ? { marginLeft: active ? "0" : "84px", marginRight: active ? "84px" : "0", transition: "margin 0.9s cubic-bezier(0.4,0,0.2,1)" } : {}}>
                  <div className="flex items-center gap-3 mb-2">
                    {isMobile && <Diamond size={28} dark={active} />}
                    <h3 className="font-['Cinzel'] tracking-wider uppercase text-sm md:text-base lg:text-lg" style={{ color: active ? "#3d2400" : "#C49A2A", transition: "color 0.9s ease" }}>{adv.title}</h3>
                    {isMobile && (
                      <svg className="ml-auto shrink-0 transition-transform duration-300" style={{ transform: active ? "rotate(180deg)" : "none", color: active ? "#7A5810" : "#C49A2A" }} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l5 5 5-5" /></svg>
                    )}
                  </div>
                  <div style={isMobile ? { maxHeight: active ? "200px" : "0", overflow: "hidden", transition: "max-height 0.5s ease" } : {}}>
                    <p className="font-['Cormorant_Garamond'] text-base md:text-lg leading-relaxed" style={{ color: active ? "rgba(40,20,0,0.85)" : "rgba(255,255,255,0.72)", transition: "color 0.9s ease" }}>
                      {adv.body}
                    </p>
                  </div>
                </div>
              </div>
            );

            return (
              <FadeIn key={adv.title} delay={i * 100} direction="left">
                {!isMobile ? (
                  <Tilt3D maxTilt={6}>
                    {cardContent}
                  </Tilt3D>
                ) : (
                  cardContent
                )}
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <>
      <Hero setPage={setPage} />
      <Philosophy />
      <ServicesTeaser setPage={setPage} />
      <WhatSetsUsApart />
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SERVICES PAGE
// ═════════════════════════════════════════════════════════════════════════════
function ServicesPage({ setPage }: { setPage: (p: Page) => void }) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const { sectionRef, offset } = useParallax(0.25);

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-[#060504]">
      {lightbox && <Lightbox state={lightbox} onClose={() => setLightbox(null)} />}

      {/* Hero banner with parallax */}
      <section ref={sectionRef} className="relative py-16 md:py-20 px-5 md:px-10 overflow-hidden">
        <div className="absolute inset-[-15%]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1776362355123-ca966d36e29c?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center", transform: `translateY(${offset}px)`, willChange: "transform" }} />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#060504]" />
        <FadeIn className="relative z-10 max-w-5xl mx-auto text-center py-6 md:py-10">
          <p className="text-[9px] sm:text-[10px] tracking-[0.5em] text-[#C49A2A]/70 uppercase font-['Montserrat'] mb-3">Luxe Prime Realty</p>
          <h1 className="font-['Cinzel'] shimmer-gold tracking-wider mb-4" style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}>Signature Services</h1>
          <GoldDivider />
          <p className="text-white/55 font-['Cormorant_Garamond'] text-base md:text-xl italic max-w-2xl mx-auto mt-4">
            Precision-crafted real estate solutions for property owners who demand more than the ordinary.
          </p>
        </FadeIn>
      </section>

      {/* Accordion */}
      <div className="relative px-5 md:px-10 py-12 md:py-16" style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(196,154,42,0.03) 0px, rgba(196,154,42,0.03) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, rgba(196,154,42,0.03) 0px, rgba(196,154,42,0.03) 1px, transparent 1px, transparent 64px)` }}>
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
          {SERVICES.map((svc, i) => {
            const isOpen = expanded === i;
            return (
              <FadeIn key={svc.id} delay={i * 80}>
                <div style={{ border: `1px solid ${isOpen ? "rgba(196,154,42,0.5)" : "rgba(196,154,42,0.18)"}`, background: isOpen ? "rgba(15,11,3,0.95)" : "rgba(8,6,2,0.7)", transition: "all 0.4s ease", boxShadow: isOpen ? "0 4px 40px rgba(196,154,42,0.08)" : "none" }}>
                  <button onClick={() => setExpanded(isOpen ? null : i)} className="w-full flex items-center gap-4 md:gap-6 p-4 md:p-8 text-left focus:outline-none group">
                    <div className="shrink-0 w-16 h-16 md:w-24 md:h-24 overflow-hidden transition-transform duration-500 group-hover:scale-105">
                      <img src={svc.image} alt={svc.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 mb-1">
                        <div className="shrink-0 h-px bg-[#C49A2A] transition-all duration-300" style={{ width: isOpen ? "24px" : "14px" }} />
                        <h3 className="text-[#C49A2A] font-['Cinzel'] text-sm md:text-lg tracking-wide group-hover:text-white transition-colors duration-300 leading-snug">{svc.title}</h3>
                      </div>
                      <p className="text-white/40 font-['Cormorant_Garamond'] text-sm md:text-base ml-4 md:ml-7 line-clamp-2 md:line-clamp-none">{svc.description}</p>
                    </div>
                    <div className="shrink-0 w-5 h-5 md:w-6 md:h-6 border border-[#C49A2A]/40 rounded-full flex items-center justify-center text-[#C49A2A] transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "none" }}>
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="1" x2="5" y2="9" /><line x1="1" y1="5" x2="9" y2="5" /></svg>
                    </div>
                  </button>

                  <div style={{ maxHeight: isOpen ? "900px" : "0", overflow: "hidden", transition: "max-height 0.55s cubic-bezier(0.4,0,0.2,1)" }}>
                    <div className="px-4 md:px-8 pb-10 md:pb-14 pt-5" style={{ borderTop: "1px solid rgba(196,154,42,0.15)" }}>
                      <p className="text-[9px] md:text-[10px] tracking-[0.35em] text-[#C49A2A]/70 uppercase font-['Montserrat'] mb-3">How We Deliver</p>
                      <p className="text-white/70 font-['Cormorant_Garamond'] text-base md:text-lg leading-relaxed mb-6 md:mb-8 max-w-2xl">{svc.detail}</p>
                      <button
                        onClick={() => setPage("inquire")}
                        className="border border-[#C49A2A] text-[#C49A2A] px-5 md:px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-['Montserrat'] transition-all duration-300 active:scale-95 mb-6 md:mb-8"
                        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#C49A2A"; el.style.color = "black"; el.style.boxShadow = "0 0 20px rgba(196,154,42,0.3)"; }}
                        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#C49A2A"; el.style.boxShadow = "none"; }}
                      >
                        Inquire About This Service
                      </button>

                      {/* Photo gallery */}
                      {isMobile ? (
                        <PhotoCarousel photos={svc.photos} title={svc.title} onOpenLightbox={(idx) => setLightbox({ photos: svc.photos, idx, alt: svc.title })} />
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {svc.photos.map((src, pi) => (
                            <div
                              key={pi}
                              className="overflow-hidden h-48 lg:h-56 relative cursor-zoom-in group/photo"
                              onClick={() => setLightbox({ photos: svc.photos, idx: pi, alt: svc.title })}
                            >
                              <img src={src} alt={`${svc.title} ${pi + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-108" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.35)" }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C49A2A" strokeWidth="1.5">
                                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                                </svg>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C49A2A]/60 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOGS PAGE
// ═════════════════════════════════════════════════════════════════════════════
function BlogsPage() {
  const [selected, setSelected] = useState<(typeof BLOGS)[0] | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  if (selected) {
    return (
      <div className="pt-20 md:pt-24 min-h-screen bg-[#050505]">
        {lightbox && <Lightbox state={lightbox} onClose={() => setLightbox(null)} />}
        <div className="max-w-3xl mx-auto px-5 md:px-10 py-10 md:py-16">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-[#C49A2A]/60 hover:text-[#C49A2A] font-['Montserrat'] text-xs tracking-[0.3em] uppercase mb-8 transition-all duration-300 hover:gap-3">
            ← Back to Insights
          </button>
          <FadeIn>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-[#C49A2A] text-[10px] tracking-[0.3em] uppercase font-['Montserrat']">{selected.category}</span>
              <span className="text-white/30 text-[10px] font-['Montserrat']">{selected.date}</span>
              <span className="text-white/30 text-[10px] font-['Montserrat']">{selected.readTime}</span>
            </div>
            <h1 className="font-['Cinzel'] text-white mb-5 leading-tight" style={{ fontSize: "clamp(1.4rem, 4vw, 2.5rem)" }}>{selected.title}</h1>
            <div className="w-10 h-px bg-[#C49A2A] mb-7" />
          </FadeIn>
          <FadeIn delay={100}>
            <div
              className="h-52 md:h-72 overflow-hidden mb-8 cursor-zoom-in relative group"
              onClick={() => setLightbox({ photos: [selected.image], idx: 0, alt: selected.title })}
            >
              <img src={selected.image} alt={selected.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.3)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C49A2A" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-white/55 font-['Cormorant_Garamond'] text-lg md:text-xl italic mb-5 leading-relaxed">{selected.excerpt}</p>
            <p className="text-white/70 font-['Cormorant_Garamond'] text-base md:text-lg leading-[1.9]">{selected.body}</p>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-[#050505]">
      <div className="relative py-16 md:py-20 px-5 md:px-10 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(196,154,42,0.08) 0%, transparent 70%)" }} />
        <FadeIn className="relative z-10">
          <p className="text-[9px] sm:text-[10px] tracking-[0.5em] text-[#C49A2A]/70 uppercase font-['Montserrat'] mb-3">Knowledge &amp; Perspective</p>
          <h1 className="font-['Cinzel'] shimmer-gold tracking-wider mb-4" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>Insights</h1>
          <GoldDivider />
          <p className="text-white/50 font-['Cormorant_Garamond'] text-base md:text-xl italic max-w-xl mx-auto mt-4">Expert perspectives on the luxury property market, investment strategies, and the future of real estate.</p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 pb-16 md:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {BLOGS.map((blog, i) => (
            <FadeIn key={blog.slug} delay={i * 100}>
              <Tilt3D maxTilt={5}>
              <article
                onClick={() => setSelected(blog)}
                className="group cursor-pointer h-full"
                style={{ border: "1px solid rgba(196,154,42,0.18)", background: "rgba(8,6,2,0.6)", transition: "border-color 0.4s ease, box-shadow 0.4s ease" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(196,154,42,0.5)"; el.style.boxShadow = "0 12px 40px rgba(196,154,42,0.12)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(196,154,42,0.18)"; el.style.boxShadow = "none"; }}
              >
                <div className="overflow-hidden h-48 sm:h-52">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#C49A2A] text-[10px] tracking-[0.3em] uppercase font-['Montserrat']">{blog.category}</span>
                    <span className="text-white/30 text-[10px] font-['Montserrat']">{blog.date}</span>
                  </div>
                  <h3 className="text-white font-['Cinzel'] text-sm leading-snug mb-2 group-hover:text-[#C49A2A] transition-colors duration-300">{blog.title}</h3>
                  <p className="text-white/45 font-['Cormorant_Garamond'] text-sm md:text-base leading-relaxed mb-4 line-clamp-3">{blog.excerpt}</p>
                  <div className="flex items-center gap-2 text-[#C49A2A]/70 text-[10px] tracking-[0.3em] uppercase font-['Montserrat'] group-hover:text-[#C49A2A] transition-all duration-300">
                    <span>Read More</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </article>
              </Tilt3D>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CAREERS PAGE
// ═════════════════════════════════════════════════════════════════════════════
function CareersPage({ setPage }: { setPage: (p: Page) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-black">
      <div className="relative py-16 md:py-20 px-5 md:px-10 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(196,154,42,0.07) 0%, transparent 65%)" }} />
        <FadeIn className="relative z-10">
          <p className="text-[9px] sm:text-[10px] tracking-[0.5em] text-[#C49A2A]/70 uppercase font-['Montserrat'] mb-3">Join the Team</p>
          <h1 className="font-['Cinzel'] shimmer-gold tracking-wider mb-4" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>Open Positions</h1>
          <GoldDivider />
          <p className="text-white/50 font-['Cormorant_Garamond'] text-base md:text-xl italic max-w-xl mx-auto mt-4">We seek exceptional talent who share our commitment to precision, discretion, and the pursuit of excellence in luxury real estate.</p>
        </FadeIn>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-10 pb-16 md:pb-20 space-y-4 md:space-y-5">
        {CAREERS.map((job, i) => {
          const isOpen = expanded === i;
          return (
            <FadeIn key={job.title} delay={i * 80} direction="right">
              <div style={{ border: `1px solid ${isOpen ? "rgba(196,154,42,0.5)" : "rgba(196,154,42,0.18)"}`, background: isOpen ? "rgba(15,11,3,0.95)" : "rgba(8,6,2,0.5)", transition: "all 0.4s ease", boxShadow: isOpen ? "0 4px 40px rgba(196,154,42,0.08)" : "none" }}>
                <button onClick={() => setExpanded(isOpen ? null : i)} className="w-full flex items-start justify-between gap-3 p-4 md:p-8 text-left focus:outline-none group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-1.5">
                      <div className="shrink-0 h-px bg-[#C49A2A] transition-all duration-300" style={{ width: isOpen ? "24px" : "14px" }} />
                      <h3 className="text-[#C49A2A] font-['Cinzel'] text-sm md:text-base tracking-wide group-hover:text-white transition-colors duration-300 leading-snug">{job.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-4 md:ml-7">
                      <span className="text-white/35 text-[10px] md:text-[11px] font-['Montserrat'] tracking-wider">{job.location}</span>
                      <span className="text-[#C49A2A]/60 text-[10px] md:text-[11px] font-['Montserrat'] tracking-wider">· {job.type}</span>
                    </div>
                  </div>
                  <div className="shrink-0 mt-0.5 w-5 h-5 md:w-6 md:h-6 border border-[#C49A2A]/40 rounded-full flex items-center justify-center text-[#C49A2A] transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "none" }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="1" x2="5" y2="9" /><line x1="1" y1="5" x2="9" y2="5" /></svg>
                  </div>
                </button>
                <div style={{ maxHeight: isOpen ? "700px" : "0", overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
                  <div className="px-4 md:px-8 pb-7 md:pb-8 pt-4 md:pt-5" style={{ borderTop: "1px solid rgba(196,154,42,0.15)" }}>
                    <p className="text-white/65 font-['Cormorant_Garamond'] text-base md:text-lg leading-relaxed mb-5 md:mb-6">{job.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
                      {[{ label: "Key Responsibilities", items: job.responsibilities }, { label: "Requirements", items: job.requirements }].map(({ label, items }) => (
                        <div key={label}>
                          <p className="text-[9px] md:text-[10px] tracking-[0.35em] text-[#C49A2A]/70 uppercase font-['Montserrat'] mb-3">{label}</p>
                          <ul className="space-y-2">
                            {items.map((r, ri) => (
                              <li key={ri} className="flex items-start gap-2 text-white/60 font-['Cormorant_Garamond'] text-sm md:text-base">
                                <span className="text-[#C49A2A] mt-1 shrink-0">·</span>{r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage("inquire")}
                      className="border border-[#C49A2A] text-[#C49A2A] px-5 md:px-6 py-2.5 text-xs tracking-[0.3em] uppercase font-['Montserrat'] transition-all duration-300 active:scale-95"
                      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#C49A2A"; el.style.color = "black"; }}
                      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#C49A2A"; }}
                    >
                      Apply for This Role
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// INQUIRE PAGE
// ═════════════════════════════════════════════════════════════════════════════
function InquirePage({ setPage: _setPage }: { setPage: (p: Page) => void }) {
  const [form, setForm] = useState({ fullName: "", propertyType: "", business: "", preferredSqm: "", preferredLocation: "", contactNumber: "", note: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputClass = "w-full bg-[#111008] border border-[#C49A2A]/25 text-white placeholder-white/25 font-['Montserrat'] text-sm px-4 py-3 focus:outline-none focus:border-[#C49A2A]/60 transition-all duration-300 focus:bg-[#181208]";
  const labelClass = "block text-[9px] md:text-[10px] tracking-[0.3em] text-[#C49A2A]/80 uppercase font-['Montserrat'] mb-2";

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-black">
      {/* Header */}
      <FadeIn>
        <div className="text-center py-10 md:py-14 px-5 border-b border-[#C49A2A]/10 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 100%, rgba(196,154,42,0.07) 0%, transparent 70%)" }} />
          <div className="relative z-10">
            <p className="text-[9px] sm:text-[10px] tracking-[0.55em] text-[#C49A2A]/80 uppercase font-['Montserrat'] mb-5">Begin Your Journey</p>
            <div className="flex justify-center mb-4">
              <ImageWithFallback src={luxePrimeLogo} alt="Luxe Prime Realty" className="w-36 sm:w-48 md:w-56 object-contain" style={{ mixBlendMode: "screen" }} />
            </div>
            <h1 className="font-['Cinzel'] shimmer-gold tracking-[0.18em] leading-tight" style={{ fontSize: "clamp(1.6rem, 5vw, 3.5rem)" }}>Let&apos;s Connect</h1>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex-1 max-w-[80px] h-px bg-gradient-to-r from-transparent to-[#C49A2A]/40" />
              <Diamond size={16} float />
              <div className="flex-1 max-w-[80px] h-px bg-gradient-to-l from-transparent to-[#C49A2A]/40" />
            </div>
            <p className="text-white/40 font-['Cormorant_Garamond'] italic text-base md:text-lg mt-3 max-w-md mx-auto">Tell us about your property goals — our team will reach out within 24 hours.</p>
          </div>
        </div>
      </FadeIn>

      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12">
        <FadeIn delay={100}>
          <div style={{ border: "1px solid rgba(196,154,42,0.2)", background: "rgba(10,8,3,0.95)", boxShadow: "0 0 60px rgba(196,154,42,0.05)" }}>
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#C49A2A]/15">
              {/* Left */}
              <div className="md:col-span-2 p-6 md:p-10" style={{ background: "rgba(8,5,1,0.5)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-px h-8 bg-gradient-to-b from-[#C49A2A] to-transparent" />
                  <h2 className="text-[#C49A2A] font-['Cinzel'] text-base md:text-lg tracking-wider">Contact Details</h2>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.56 3.36 2 2 0 0 1 3.53 1H6.5a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.86-.87a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16a2 2 0 0 1 .5.92z" />, text: "0915 888 9482 / 02 8 650 2540" },
                    { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>, text: "contact@alphapremier.com" },
                    { icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>, text: "Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City" },
                  ].map(({ icon, text }, ii) => (
                    <div key={ii} className="flex items-start gap-3 group cursor-default">
                      <svg className="text-[#C49A2A] shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{icon}</svg>
                      <p className="text-white/65 font-['Montserrat'] text-xs md:text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 md:p-5" style={{ border: "1px solid rgba(196,154,42,0.2)", background: "rgba(5,4,1,0.8)" }}>
                  <p className="text-[#C49A2A] text-[8px] md:text-[9px] tracking-[0.35em] uppercase font-['Montserrat'] text-center mb-4">Connect With Us on Facebook</p>
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 md:w-28 md:h-28 p-2 bg-white hover:scale-105 transition-transform duration-300 cursor-pointer">
                      <svg viewBox="0 0 21 21" className="w-full h-full" fill="black">
                        <rect x="0" y="0" width="7" height="7" fill="none" stroke="black" strokeWidth="1" /><rect x="1" y="1" width="5" height="5" fill="black" /><rect x="2" y="2" width="3" height="3" fill="white" />
                        <rect x="14" y="0" width="7" height="7" fill="none" stroke="black" strokeWidth="1" /><rect x="15" y="1" width="5" height="5" fill="black" /><rect x="16" y="2" width="3" height="3" fill="white" />
                        <rect x="0" y="14" width="7" height="7" fill="none" stroke="black" strokeWidth="1" /><rect x="1" y="15" width="5" height="5" fill="black" /><rect x="2" y="16" width="3" height="3" fill="white" />
                        <rect x="9" y="1" width="1" height="1" /><rect x="11" y="1" width="1" height="1" /><rect x="9" y="3" width="2" height="1" /><rect x="12" y="3" width="1" height="1" />
                        <rect x="10" y="5" width="3" height="1" /><rect x="8" y="8" width="1" height="5" /><rect x="10" y="8" width="3" height="1" /><rect x="10" y="10" width="2" height="2" />
                        <rect x="13" y="9" width="1" height="3" /><rect x="15" y="8" width="4" height="1" /><rect x="15" y="10" width="2" height="1" /><rect x="18" y="10" width="2" height="2" />
                        <rect x="9" y="14" width="2" height="2" /><rect x="12" y="14" width="3" height="1" /><rect x="9" y="17" width="1" height="3" /><rect x="11" y="16" width="3" height="2" />
                        <rect x="15" y="15" width="5" height="5" fill="black" /><rect x="16" y="16" width="3" height="3" fill="white" /><rect x="17" y="17" width="1" height="1" fill="black" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="md:col-span-3 p-6 md:p-10">
                <div className="space-y-4 md:space-y-5">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input className={inputClass} placeholder="Juan Dela Cruz" value={form.fullName} onChange={set("fullName")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className={labelClass}>Type of Property</label>
                      <select className={`${inputClass} cursor-pointer`} value={form.propertyType} onChange={set("propertyType")} style={{ appearance: "none" }}>
                        <option value="">Select Type</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="office">Office Space</option>
                        <option value="industrial">Industrial</option>
                        <option value="mixed">Mixed Use</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Business</label>
                      <input className={inputClass} placeholder="Business Name" value={form.business} onChange={set("business")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className={labelClass}>Preferred SQM</label>
                      <input className={inputClass} placeholder="e.g. 500 sqm" value={form.preferredSqm} onChange={set("preferredSqm")} />
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Location</label>
                      <input className={inputClass} placeholder="e.g. Makati City" value={form.preferredLocation} onChange={set("preferredLocation")} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Viber or Contact Number</label>
                    <input className={inputClass} placeholder="0917 XXX XXXX" value={form.contactNumber} onChange={set("contactNumber")} />
                  </div>
                  <div>
                    <label className={labelClass}>Note:</label>
                    <textarea className={`${inputClass} resize-none`} placeholder="Tell us more about your requirements..." rows={4} value={form.note} onChange={set("note")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => { const body = `Name: ${form.fullName}\nProperty Type: ${form.propertyType}\nBusiness: ${form.business}\nPreferred SQM: ${form.preferredSqm}\nPreferred Location: ${form.preferredLocation}\nContact: ${form.contactNumber}\n\nNote:\n${form.note}`; window.location.href = `mailto:contact@alphapremier.com?subject=Inquiry from ${form.fullName}&body=${encodeURIComponent(body)}`; }}
                      className="border border-[#C49A2A] text-[#C49A2A] bg-transparent px-3 py-3.5 text-[9px] md:text-[10px] tracking-[0.25em] uppercase font-['Montserrat'] transition-all duration-300 active:scale-95"
                      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#C49A2A"; el.style.color = "black"; el.style.boxShadow = "0 0 20px rgba(196,154,42,0.3)"; }}
                      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#C49A2A"; el.style.boxShadow = "none"; }}
                    >
                      Send Message via Email
                    </button>
                    <button
                      onClick={() => window.open("https://m.me/alphapremiergroup", "_blank")}
                      className="border border-[#C49A2A]/40 text-white/80 bg-transparent px-3 py-3.5 text-[9px] md:text-[10px] tracking-[0.25em] uppercase font-['Montserrat'] transition-all duration-300 active:scale-95"
                      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#C49A2A"; el.style.color = "white"; }}
                      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(196,154,42,0.4)"; el.style.color = "rgba(255,255,255,0.8)"; }}
                    >
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Map */}
        <FadeIn delay={200}>
          <div className="mt-12 md:mt-16 text-center mb-6 md:mb-8">
            <h2 className="font-['Cinzel'] text-[#C49A2A] tracking-wider text-xl md:text-3xl mb-4">Visit Our Office</h2>
            <GoldDivider />
          </div>
          <div className="overflow-hidden mb-4" style={{ border: "1px solid rgba(196,154,42,0.2)", height: "280px" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.419283474938!2d121.05679431484!3d14.584773389801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8f9c1c9d9e1%3A0x6f1f7c9c1c9d9e1!2sPhilippine%20Stock%20Exchange%20Centre%2C%20Exchange%20Rd%2C%20Ortigas%20Center%2C%20Pasig%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1720000000000!5m2!1sen!2sph"
              width="100%" height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.85) saturate(0.8)" }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Alpha Premier Group Office"
            />
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═════════════════════════════════════════════════════════════════════════════
interface AppProps {
  page?: Page;
  setPage?: (p: Page) => void;
}

export default function App(props: AppProps = {}) {
  // Controlled mode: if a parent passes page + setPage, use them. Otherwise self-contained.
  const [internalPage, internalSetPage] = useState<Page>("home");
  const page = props.page ?? internalPage;
  const setPage = props.setPage ?? internalSetPage;

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <style>{`
        @keyframes scrollBob {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.4; }
        }
        @keyframes goldFlow {
          0% { transform: scale(1) translate(0%, 0%); }
          100% { transform: scale(1.12) translate(3%, -4%); }
        }
        @keyframes diamondFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes heroEnter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldPulseBox {
          0% { box-shadow: 0 0 80px rgba(196,154,42,0.06); }
          100% { box-shadow: 0 0 80px rgba(196,154,42,0.14), inset 0 0 40px rgba(196,154,42,0.04); }
        }
        @keyframes particleRise {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; }
          50%  { transform: translateY(-40px) translateX(12px) scale(1.3); opacity: 0.5; }
          100% { transform: translateY(-90px) translateX(-6px) scale(0.6); opacity: 0; }
        }
        @keyframes rippleOut {
          0%   { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes goldShimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(196,154,42,0.3); }
          50%       { border-color: rgba(196,154,42,0.7); }
        }
        /* Gold shimmer text */
        .shimmer-gold {
          background: linear-gradient(90deg, #8B6914 0%, #C49A2A 30%, #F0D080 50%, #E8C85A 65%, #C49A2A 80%, #8B6914 100%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmerSweep 5s linear infinite;
        }
        /* System cursor allowed everywhere; explicitly set native cursor styles per element kind. */
        button, [role="button"], a, summary, label { cursor: pointer; }
        input, textarea, select { cursor: text; }
        button:disabled, [aria-disabled="true"], input:disabled { cursor: not-allowed; }
        html { scroll-behavior: smooth; }
        select option { background: #111008; color: white; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .group-hover\/photo\:scale-108:hover { transform: scale(1.08); }
      `}</style>

      <ScrollProgress />
      {/* <Nav/> removed — using APG shared Header via Layout */}

      <main className="flex-1" key={page} style={{ animation: "pageFadeIn 0.45s ease both" }}>
        {page === "home" && <HomePage setPage={navigate} />}
        {page === "services" && <ServicesPage setPage={navigate} />}
        {page === "blogs" && <BlogsPage />}
        {page === "careers" && <CareersPage setPage={navigate} />}
        {page === "inquire" && <InquirePage setPage={navigate} />}
      </main>

      {/* <Footer/> removed — using APG shared Footer via Layout */}
    </div>
  );
}
