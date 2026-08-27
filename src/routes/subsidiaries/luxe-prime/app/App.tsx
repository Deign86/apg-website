import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Key, Building2, TrendingUp, Sparkles, CheckCircle2, ArrowRight, Clock, Target, Compass, Eye, ShieldCheck } from "lucide-react";
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
    icon: Key,
    image: "https://images.unsplash.com/photo-1780257562963-3389a4105371?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1780257562963-3389a4105371?w=1200&q=85",
      "https://images.unsplash.com/photo-1776362355123-ca966d36e29c?w=1200&q=85",
      "https://images.unsplash.com/photo-1780257562941-d9a6923befa1?w=1200&q=85",
    ],
    description: "Flexible short and mid-term leasing that maximizes rental yield while maintaining total owner control.",
    features: [
      "Verified Tenant Vetting",
      "Yield & Rate Optimization",
      "Turnkey Turnover Service",
      "Full HOA & Local Compliance",
    ],
  },
  {
    id: 1,
    title: "End-to-End Property Administration",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1200&q=85",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85",
      "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=1200&q=85",
    ],
    description: "Comprehensive operational oversight — managing tenants, maintenance, and monthly accounting.",
    features: [
      "Lease & Renewal Management",
      "24/7 Urgent Repair Dispatch",
      "Monthly Owner Statements",
      "Automated Rent Collection",
    ],
  },
  {
    id: 2,
    title: "Short & Long-Term Leasing Strategies",
    icon: TrendingUp,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85",
      "https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?w=1200&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=85",
    ],
    description: "Bespoke positioning strategies tailored to your property profile to capture premium occupancy rates.",
    features: [
      "Dynamic Pricing Algorithms",
      "Dual-Market Positioning",
      "Targeted High-End Marketing",
      "Seasonal Yield Forecasting",
    ],
  },
  {
    id: 3,
    title: "Concierge-Level Service and Support",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85",
      "https://images.unsplash.com/photo-1758448756350-3d0eec02ba37?w=1200&q=85",
      "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=1200&q=85",
    ],
    description: "White-glove 24/7 concierge support curating luxury living experiences for occupants and total peace of mind for owners.",
    features: [
      "24/7 Luxury Concierge Desk",
      "VIP Occupant Onboarding",
      "Physical Asset Audits",
      "Custom Owner Fulfillment",
    ],
  },
];

const CLIENT_JOURNEY = [
  {
    step: "01",
    icon: Compass,
    title: "Portfolio Audit & Discovery",
    description: "We evaluate your asset's architectural profile, market comps, and rental yield potential to establish clear benchmarks.",
  },
  {
    step: "02",
    icon: Target,
    title: "Bespoke Strategy Design",
    description: "We model a custom leasing framework — balancing short-term flexibility with long-term revenue stability.",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "White-Glove Onboarding",
    description: "Our team executes professional photography, property staging, tenant screening, and system integration.",
  },
  {
    step: "04",
    icon: Clock,
    title: "Continuous Yield & Care",
    description: "Enjoy effortless ownership with 24/7 administration, concierge support, and transparent monthly financial reporting.",
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



// ── Gold Flakes & Sparkle Particle Data ───────────────────────────────────────
const GOLD_FLAKES = [
  { x: 4, y: 10, size: 12, type: 'flake', duration: 8, delay: 0.1, rotate: 25 },
  { x: 14, y: 40, size: 10, type: 'star', duration: 6, delay: 1.2, rotate: 12 },
  { x: 22, y: 75, size: 14, type: 'flake', duration: 10, delay: 0.7, rotate: 75 },
  { x: 31, y: 20, size: 7, type: 'dust', duration: 5, delay: 1.9, rotate: 0 },
  { x: 39, y: 85, size: 13, type: 'flake', duration: 9, delay: 0.4, rotate: 40 },
  { x: 47, y: 15, size: 11, type: 'star', duration: 7, delay: 1.0, rotate: 90 },
  { x: 55, y: 60, size: 8, type: 'dust', duration: 6, delay: 2.5, rotate: 0 },
  { x: 63, y: 32, size: 15, type: 'flake', duration: 11, delay: 0.2, rotate: 110 },
  { x: 72, y: 78, size: 10, type: 'star', duration: 5.5, delay: 1.4, rotate: 45 },
  { x: 81, y: 22, size: 13, type: 'flake', duration: 8.5, delay: 2.1, rotate: 15 },
  { x: 89, y: 65, size: 8, type: 'dust', duration: 7.2, delay: 0.8, rotate: 0 },
  { x: 96, y: 12, size: 12, type: 'flake', duration: 9.5, delay: 1.6, rotate: 60 },
  { x: 8, y: 55, size: 11, type: 'star', duration: 6.5, delay: 0.3, rotate: 135 },
  { x: 17, y: 30, size: 14, type: 'flake', duration: 10.2, delay: 1.8, rotate: 80 },
  { x: 27, y: 90, size: 7, type: 'dust', duration: 5.8, delay: 1.0, rotate: 0 },
  { x: 36, y: 48, size: 12, type: 'flake', duration: 8.8, delay: 0.5, rotate: 25 },
  { x: 44, y: 72, size: 9, type: 'star', duration: 7.0, delay: 2.2, rotate: 50 },
  { x: 52, y: 28, size: 15, type: 'flake', duration: 11.5, delay: 1.3, rotate: 105 },
  { x: 60, y: 88, size: 8, type: 'dust', duration: 6.2, delay: 0.6, rotate: 0 },
  { x: 68, y: 18, size: 13, type: 'flake', duration: 9.0, delay: 2.0, rotate: 35 },
  { x: 76, y: 50, size: 10, type: 'star', duration: 6.8, delay: 0.9, rotate: 70 },
  { x: 85, y: 84, size: 14, type: 'flake', duration: 10.0, delay: 1.5, rotate: 150 },
  { x: 91, y: 38, size: 7, type: 'dust', duration: 5.5, delay: 2.4, rotate: 0 },
  { x: 3, y: 82, size: 11, type: 'flake', duration: 8.4, delay: 0.7, rotate: 65 },
  { x: 12, y: 25, size: 9, type: 'star', duration: 6.3, delay: 1.7, rotate: 15 },
  { x: 20, y: 62, size: 13, type: 'flake', duration: 9.7, delay: 1.1, rotate: 95 },
  { x: 29, y: 12, size: 8, type: 'dust', duration: 6.7, delay: 0.2, rotate: 0 },
  { x: 38, y: 70, size: 12, type: 'flake', duration: 8.2, delay: 1.9, rotate: 40 },
  { x: 46, y: 35, size: 11, type: 'star', duration: 7.2, delay: 0.8, rotate: 120 },
  { x: 54, y: 92, size: 14, type: 'flake', duration: 10.8, delay: 2.3, rotate: 160 },
  { x: 62, y: 44, size: 7, type: 'dust', duration: 5.9, delay: 1.4, rotate: 0 },
  { x: 70, y: 76, size: 13, type: 'flake', duration: 9.2, delay: 0.1, rotate: 30 },
  { x: 79, y: 15, size: 10, type: 'star', duration: 6.6, delay: 1.6, rotate: 85 },
  { x: 87, y: 46, size: 12, type: 'flake', duration: 8.6, delay: 2.1, rotate: 110 },
  { x: 95, y: 78, size: 8, type: 'dust', duration: 6.4, delay: 0.9, rotate: 0 },
  { x: 7, y: 38, size: 14, type: 'flake', duration: 10.4, delay: 1.3, rotate: 50 },
  { x: 16, y: 88, size: 9, type: 'star', duration: 6.9, delay: 0.4, rotate: 140 },
  { x: 25, y: 42, size: 12, type: 'flake', duration: 8.9, delay: 2.0, rotate: 20 },
  { x: 34, y: 80, size: 7, type: 'dust', duration: 5.7, delay: 1.1, rotate: 0 },
  { x: 43, y: 18, size: 15, type: 'flake', duration: 11.0, delay: 0.6, rotate: 90 },
  { x: 51, y: 64, size: 10, type: 'star', duration: 7.4, delay: 1.8, rotate: 60 },
  { x: 59, y: 22, size: 13, type: 'flake', duration: 9.4, delay: 1.2, rotate: 130 },
  { x: 67, y: 95, size: 8, type: 'dust', duration: 6.1, delay: 2.5, rotate: 0 },
  { x: 75, y: 40, size: 12, type: 'flake', duration: 8.7, delay: 0.3, rotate: 75 },
  { x: 83, y: 90, size: 11, type: 'star', duration: 7.1, delay: 1.7, rotate: 30 },
];

function GoldFlakes({ className = "", count = 6 }: { className?: string; count?: number }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {GOLD_FLAKES.slice(0, count).map((f, i) => {
        if (f.type === "star") {
          return (
            <svg
              key={i}
              width={f.size * 0.65}
              height={f.size * 0.65}
              viewBox="0 0 12 12"
              className="absolute text-[#F0D080]"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                opacity: 0.18,
                animation: `sparkleTwinkle ${f.duration * 1.5}s ease-in-out ${f.delay}s infinite`,
                willChange: "transform, opacity",
              }}
            >
              <polygon points="6,0 7.5,4.5 12,6 7.5,7.5 6,12 4.5,7.5 0,6 4.5,4.5" fill="currentColor" />
            </svg>
          );
        }

        if (f.type === "flake") {
          return (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                width: `${f.size * 0.3}px`,
                height: `${f.size * 0.5}px`,
                background: "linear-gradient(135deg, #F0D080 0%, #C49A2A 100%)",
                opacity: 0.15,
                transform: `rotate(${f.rotate}deg)`,
                animation: `goldFlakeFloat ${f.duration * 1.5}s ease-in-out ${f.delay}s infinite`,
                willChange: "transform, opacity",
              }}
            />
          );
        }

        return (
          <div
            key={i}
            className="absolute rounded-full bg-[#F0D080]"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: `${f.size * 0.4}px`,
              height: `${f.size * 0.4}px`,
              opacity: 0.12,
              animation: `particleRise ${f.duration * 1.5}s ease-in-out ${f.delay}s infinite`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
}

function FloatingParticles() {
  return <GoldFlakes count={5} />;
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
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = origOverflow;
    };
  }, [onClose, prev, next]);

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "pageFadeIn 0.25s ease",
      }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 z-[100000] w-12 h-12 flex items-center justify-center text-white/70 hover:text-[#C49A2A] bg-black/80 hover:bg-black rounded-full border border-[#C49A2A]/40 transition-all duration-300 cursor-pointer shadow-2xl"
      >
        <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="2" y1="2" x2="12" y2="12" /><line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>

      {/* Perfectly Centered Image Container */}
      <div
        className="relative flex flex-col items-center justify-center max-w-[90vw] max-h-[85vh] m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photos[idx]}
          alt={`${alt} ${idx + 1}`}
          className="max-w-[90vw] max-h-[78vh] object-contain rounded-xl border border-[#C49A2A]/40 shadow-[0_0_90px_rgba(196,154,42,0.25)]"
        />
        <div className="mt-4 text-center">
          <span className="text-[#C49A2A] font-['Cinzel'] text-xs md:text-sm tracking-[0.25em] uppercase font-bold drop-shadow">
            {alt} &mdash; Photo {idx + 1} of {photos.length}
          </span>
        </div>
      </div>

      {/* Prev / Next buttons */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-[100000] w-12 h-12 rounded-full bg-black/80 hover:bg-[#C49A2A] text-[#C49A2A] hover:text-black border border-[#C49A2A]/50 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl"
          >
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 2L4 7l5 5"/></svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-[100000] w-12 h-12 rounded-full bg-black/80 hover:bg-[#C49A2A] text-[#C49A2A] hover:text-black border border-[#C49A2A]/50 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl"
          >
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 2l5 5-5 5"/></svg>
          </button>
        </>
      )}

      {/* Navigation dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[100000]">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${i === idx ? 'w-9 bg-[#C49A2A]' : 'w-3 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

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
      <div className="absolute inset-0 bg-black/68" />
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
        <p className="text-base sm:text-lg md:text-2xl tracking-[0.15em] font-['Cormorant_Garamond'] font-semibold mt-2" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)", animation: "heroEnter 1.6s ease both" }}>
          <span className="shimmer-gold">Where Prestige</span>{" "}
          <span className="text-white">Meets Practicality</span>
        </p>
        <RippleButton
          onClick={() => {
            const el = document.getElementById("philosophy");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-8 border border-[#C49A2A]/60 text-[#C49A2A] px-7 py-3 text-xs tracking-[0.35em] uppercase font-['Montserrat'] transition-all duration-300 active:scale-95"
          style={{ animation: "heroEnter 1.8s ease both" } as React.CSSProperties}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget; el.style.background = "#C49A2A"; el.style.color = "black"; el.style.boxShadow = "0 0 30px rgba(196,154,42,0.45)"; }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { const el = e.currentTarget; el.style.background = "transparent"; el.style.color = "#C49A2A"; el.style.boxShadow = "none"; }}
        >
          Discover More
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
    <section id="philosophy" ref={sectionRef} className="relative min-h-screen flex items-center justify-center py-20 px-5 md:px-10 overflow-hidden">
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
                      <p className="text-white font-['Cinzel'] font-bold text-[12px] md:text-[13px] tracking-[0.25em] uppercase text-center leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                        style={active !== null ? { writingMode: "vertical-rl", transform: "rotate(180deg)" } : {}}>
                        {svc.title}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8" style={{ opacity: isActive ? 1 : 0, transform: isActive ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.45s ease 0.15s, transform 0.45s ease 0.15s", pointerEvents: isActive ? "auto" : "none" }}>
                      <div className="w-8 h-px bg-[#C49A2A] mb-3" />
                      <h3 className="text-[#C49A2A] font-['Cinzel'] font-bold text-base lg:text-xl uppercase tracking-wider mb-2 leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{svc.title}</h3>
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
                        <h3 className="text-[#C49A2A] font-['Cinzel'] font-bold text-sm tracking-wide leading-snug">{svc.title}</h3>
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
// ═════════════════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════════════════
// SERVICES PAGE — REDESIGNED EDITORIAL SPREAD
// ═════════════════════════════════════════════════════════════════════════════
function ServicesPage({ setPage }: { setPage: (p: Page) => void }) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const { sectionRef, offset } = useParallax(0.25);

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-[#060504]">
      {lightbox && <Lightbox state={lightbox} onClose={() => setLightbox(null)} />}

      {/* Hero Banner with Parallax */}
      <section ref={sectionRef} className="relative py-20 md:py-28 px-5 md:px-10 overflow-hidden">
        <div
          className="absolute inset-[-15%]"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1776362355123-ca966d36e29c?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${offset}px)`,
            willChange: "transform",
          }}
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#060504]" />
        
        <GoldFlakes count={6} />
        {/* Ambient gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#C49A2A]/10 rounded-full blur-[120px] pointer-events-none" />

        <FadeIn className="relative z-10 max-w-5xl mx-auto text-center py-8 md:py-12">
          <div className="inline-flex items-center gap-2 border border-[#C49A2A]/30 bg-[#C49A2A]/10 px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={13} className="text-[#C49A2A]" />
            <span className="text-[10px] md:text-[11px] tracking-[0.4em] text-[#C49A2A] uppercase font-['Montserrat'] font-semibold">
              Luxe Prime Realty — Master Services
            </span>
          </div>
          <h1
            className="font-['Cinzel'] text-white font-bold tracking-wider mb-5"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)" }}
          >
            Signature Real Estate <span className="italic text-[#C49A2A]">Solutions</span>
          </h1>
          <GoldDivider />
          <p className="text-white/70 font-['Cormorant_Garamond'] text-lg md:text-2xl italic max-w-2xl mx-auto mt-6 leading-relaxed">
            Precision-crafted property management, subleasing, and asset strategy for owners who demand distinction.
          </p>
        </FadeIn>
      </section>

      {/* Alternating Services Grid (Zig-Zag Layout) */}
      <section
        className="relative px-5 md:px-10 py-16 md:py-24"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, rgba(196,154,42,0.02) 0px, rgba(196,154,42,0.02) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, rgba(196,154,42,0.02) 0px, rgba(196,154,42,0.02) 1px, transparent 1px, transparent 64px)`,
        }}
      >
                <div className="max-w-7xl mx-auto space-y-20 md:space-y-32 relative z-10">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            const isEven = i % 2 === 0;
            return (
              <div
                key={svc.id}
                className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                  isEven ? "" : "lg:grid-flow-dense"
                }`}
              >
                {/* Media Column */}
                <div className={`lg:col-span-6 ${isEven ? "lg:col-start-1" : "lg:col-start-7"}`}>
                  <FadeIn direction={isEven ? "left" : "right"} delay={100}>
                    <Tilt3D maxTilt={4}>
                      <div className="relative rounded-2xl overflow-hidden border border-[#C49A2A]/30 bg-[#0c0904] shadow-[0_10px_40px_rgba(0,0,0,0.8)] group">
                        {/* Main Service Image */}
                        <div
                          className="aspect-[4/3] overflow-hidden relative cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightbox({ photos: svc.photos, idx: 0, alt: svc.title });
                          }}
                        >
                          <img
                            src={svc.image}
                            alt={svc.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#060504] via-black/20 to-transparent" />
                          
                          {/* Photo Count / Lightbox Trigger Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setLightbox({ photos: svc.photos, idx: 0, alt: svc.title });
                            }}
                            className="absolute bottom-4 right-4 z-30 bg-black/90 hover:bg-[#C49A2A] text-white hover:text-black border border-[#C49A2A]/50 px-4 py-2.5 rounded-lg text-xs font-['Montserrat'] tracking-wider uppercase flex items-center gap-2 backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer pointer-events-auto"
                          >
                            <Eye size={15} />
                            <span>View Gallery ({svc.photos.length})</span>
                          </button>

                          {/* Index Badge */}
                          <div className="absolute top-4 left-4 font-['Cinzel'] text-xs font-bold text-[#C49A2A] bg-black/80 border border-[#C49A2A]/30 px-3 py-1 rounded">
                            0{i + 1}
                          </div>
                        </div>

                        {/* Secondary Photo Strip Preview */}
                        <div className="p-3 bg-[#0a0703] border-t border-[#C49A2A]/15 grid grid-cols-3 gap-2">
                          {svc.photos.map((photo, pi) => (
                            <div
                              key={pi}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightbox({ photos: svc.photos, idx: pi, alt: svc.title });
                              }}
                              className="h-16 overflow-hidden rounded cursor-pointer relative group/sub border border-[#C49A2A]/20 hover:border-[#C49A2A]/80 transition-colors"
                            >
                              <img
                                src={photo}
                                alt={`${svc.title} preview ${pi + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/sub:scale-110"
                              />
                              <div className="absolute inset-0 bg-[#C49A2A]/25 opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </Tilt3D>
                  </FadeIn>
                </div>

                {/* Content Column */}
                <div className={`lg:col-span-6 ${isEven ? "lg:col-start-7" : "lg:col-start-1"}`}>
                  <FadeIn direction={isEven ? "right" : "left"} delay={150}>
                    {/* Gold Icon Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C49A2A] to-[#7A5810] flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(196,154,42,0.3)]">
                      <Icon size={26} className="text-black" />
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-px bg-[#C49A2A]" />
                      <span className="text-xs font-['Montserrat'] tracking-[0.35em] text-[#C49A2A] uppercase font-semibold">
                        Service 0{i + 1}
                      </span>
                    </div>

                    <h2 className="font-['Cinzel'] font-bold text-2xl md:text-3xl lg:text-4xl text-white mb-3 leading-tight">
                      {svc.title}
                    </h2>

                    <p className="font-['Cormorant_Garamond'] text-white/80 text-lg md:text-xl leading-relaxed mb-6">
                      {svc.description}
                    </p>

                    {/* Features Checklist Grid */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-8">
                      {svc.features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0d0904]/80 border border-[#C49A2A]/15">
                          <CheckCircle2 size={16} className="text-[#C49A2A] shrink-0" />
                          <span className="text-xs text-white/90 font-['Montserrat'] font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Actions */}
                    <div className="flex flex-wrap items-center gap-4">
                      <RippleButton
                        onClick={() => {
                          setPage("inquire");
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-gradient-to-r from-[#C49A2A] to-[#99741D] hover:from-[#d4aa3a] hover:to-[#a98124] text-black font-['Montserrat'] text-xs uppercase tracking-[0.25em] font-semibold px-7 py-3.5 rounded transition-all duration-300 shadow-[0_4px_25px_rgba(196,154,42,0.3)] hover:shadow-[0_6px_30px_rgba(196,154,42,0.5)] flex items-center gap-2 cursor-pointer"
                      >
                        <span>Inquire About This Service</span>
                        <ArrowRight size={15} />
                      </RippleButton>
                    </div>
                  </FadeIn>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process / Client Journey Section */}
      <section className="relative py-20 md:py-28 px-5 md:px-10 bg-gradient-to-b from-[#060504] via-[#0b0804] to-[#060504] border-t border-b border-[#C49A2A]/15">
                <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16" direction="up">
            <div className="inline-flex items-center gap-2 border border-[#C49A2A]/30 bg-[#C49A2A]/10 px-4 py-1.5 rounded-full mb-4">
              <Compass size={13} className="text-[#C49A2A]" />
              <span className="text-[10px] tracking-[0.35em] text-[#C49A2A] uppercase font-['Montserrat'] font-semibold">
                Our Operational Blueprint
              </span>
            </div>
            <h2 className="font-['Cinzel'] font-bold text-3xl md:text-5xl text-white mt-2 leading-tight">
              The Client <span className="italic text-[#C49A2A]">Journey</span>
            </h2>
            <p className="font-['Cormorant_Garamond'] text-white/60 text-lg md:text-xl italic max-w-xl mx-auto mt-3">
              How Luxe Prime Realty transforms property ownership into a seamless, high-yield experience.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {CLIENT_JOURNEY.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <FadeIn key={idx} delay={idx * 120} direction="up">
                  <div className="h-full bg-[#0d0904]/90 border border-[#C49A2A]/20 hover:border-[#C49A2A]/60 p-6 md:p-8 rounded-2xl transition-all duration-400 hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 font-['Cinzel'] text-3xl font-bold text-[#C49A2A]/10 group-hover:text-[#C49A2A]/20 transition-colors">
                      {step.step}
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-[#C49A2A]/10 border border-[#C49A2A]/30 flex items-center justify-center mb-6 text-[#C49A2A] group-hover:bg-[#C49A2A] group-hover:text-black transition-all duration-300">
                      <StepIcon size={22} />
                    </div>

                    <span className="text-[10px] tracking-[0.3em] uppercase text-[#C49A2A] font-['Montserrat'] font-semibold block mb-2">
                      Step {step.step}
                    </span>

                    <h3 className="font-['Cinzel'] font-bold text-lg text-white mb-3 leading-snug group-hover:text-[#C49A2A] transition-colors">
                      {step.title}
                    </h3>

                    <p className="font-['Cormorant_Garamond'] text-white/65 text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Bottom CTA Section */}
      <section className="relative py-20 md:py-28 px-5 md:px-10 overflow-hidden bg-[#060504]">
        <div className="max-w-4xl mx-auto">
          <FadeIn direction="up">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#120d05] to-[#080602] border border-[#C49A2A]/30 p-8 md:p-14 text-center overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.9)]">
              {/* Radial grid overlay */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #C49A2A 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C49A2A]/5 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[#C49A2A] font-['Montserrat'] font-semibold mb-4 inline-block">
                  Elevate Your Portfolio
                </span>
                <h2 className="font-['Cinzel'] font-bold text-3xl md:text-5xl text-white mb-4 leading-tight">
                  Ready to Experience <span className="italic text-[#C49A2A]">Luxe Prime?</span>
                </h2>
                <p className="font-['Cormorant_Garamond'] text-white/70 text-lg md:text-xl italic max-w-xl mx-auto mb-8 leading-relaxed">
                  Connect with our asset management specialists to design a co-managed subleasing or property administration strategy tailored to your estate.
                </p>
                <RippleButton
                  onClick={() => {
                    setPage("inquire");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-[#C49A2A] to-[#99741D] hover:from-[#d4aa3a] hover:to-[#a98124] text-black font-['Montserrat'] text-xs uppercase tracking-[0.3em] font-semibold px-9 py-4 rounded transition-all duration-300 shadow-[0_4px_30px_rgba(196,154,42,0.4)] hover:shadow-[0_6px_35px_rgba(196,154,42,0.6)] inline-flex items-center gap-3 cursor-pointer"
                >
                  <span>Schedule Private Consultation</span>
                  <ArrowRight size={16} />
                </RippleButton>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

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
// CAREERS PAGE & APPLICATION FORM (SWIFTCLEAR REFERENCE LAYOUT)
// ═════════════════════════════════════════════════════════════════════════════
const LUXE_POSITIONS = [
  {
    id: "luxury-property-broker",
    title: "Senior Luxury Property Broker / Advisory Partner",
    location: "Ortigas Center, Pasig City / BGC, Taguig",
    type: "Full-Time / Hybrid",
    description: "Lead commercial office leasing deals, high-end residential acquisitions, and estate advisory for high-net-worth clients across Metro Manila.",
    responsibilities: [
      "Manage transactions for commercial leasing, office acquisitions, and high-value residential estates.",
      "Represent high-net-worth individuals, corporate tenants, and property developers.",
      "Formulate strategic property valuation, market trends analysis, and investment deal structures.",
      "Maintain client discretion and high standards of service excellence."
    ],
    requirements: [
      "Licensed Real Estate Broker (PRC / DHSUD registration preferred).",
      "Minimum 3+ years of experience in commercial office leasing or luxury residential brokerage.",
      "Proven track record in closing high-value corporate or residential transactions.",
      "Exceptional negotiation, communication, and executive presentation skills."
    ]
  },
  {
    id: "commercial-leasing-specialist",
    title: "Commercial Office Leasing & Corporate Specialist",
    location: "Ortigas Business District / Makati CBD",
    type: "Full-Time",
    description: "Specialize in prime commercial office spaces, SEC business center registration, and corporate relocation advisory for expanding enterprises.",
    responsibilities: [
      "Assist corporate clients in sourcing prime office spaces across Ortigas CBD, Makati, and BGC.",
      "Conduct site inspections, space planning assessments, and lease term negotiations.",
      "Collaborate with building administration and legal teams for SEC & lease compliance.",
      "Expand corporate tenant networks and maintain landlord relationships."
    ],
    requirements: [
      "Bachelor's Degree in Business Administration, Marketing, Real Estate Management, or related field.",
      "2+ years experience in commercial real estate or corporate leasing.",
      "Strong background in contract negotiation and corporate client management.",
      "Familiarity with Metro Manila CBD office towers and commercial developments."
    ]
  },
  {
    id: "luxury-marketing-director",
    title: "Real Estate Digital Marketing & Portfolio Director",
    location: "Ortigas Headquarters / Hybrid",
    type: "Full-Time",
    description: "Direct luxury real estate digital campaigns, high-end property showcase media, and corporate brand positioning for Luxe Prime Realty.",
    responsibilities: [
      "Develop and execute high-impact digital marketing strategies for luxury properties.",
      "Oversee property photography, 3D virtual walkthroughs, and executive listing presentations.",
      "Manage targeted social media advertising, SEO, and lead generation funnels.",
      "Analyze campaign analytics and optimize conversion rates for estate inquiries."
    ],
    requirements: [
      "3+ years experience in real estate digital marketing, agency account management, or luxury branding.",
      "Proficiency in digital ad platforms (Meta Ads, Google Ads), analytics, and creative tools.",
      "Strong visual design aesthetic and luxury copywriting capabilities.",
      "Proven track record of generating qualified leads for high-ticket properties."
    ]
  }
];

function CareersPage({ setPage }: { setPage: (p: Page) => void }) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const activePosition = LUXE_POSITIONS.find((p) => p.id === selectedJobId);

  if (activePosition) {
    return <CareersFormPage position={activePosition} onBack={() => setSelectedJobId(null)} setPage={setPage} />;
  }

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-black text-white">
      {/* Header Banner */}
      <div className="relative py-16 md:py-20 px-5 md:px-10 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(196,154,42,0.08) 0%, transparent 65%)" }} />
        <FadeIn className="relative z-10">
          <p className="text-[9px] sm:text-[10px] tracking-[0.5em] text-[#C49A2A]/80 uppercase font-['Montserrat'] mb-3">Join Luxe Prime Realty</p>
          <h1 className="font-['Cinzel'] shimmer-gold tracking-wider mb-4" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>Career Opportunities</h1>
          <GoldDivider />
          <p className="text-white/60 font-['Cormorant_Garamond'] text-base md:text-xl italic max-w-2xl mx-auto mt-4 leading-relaxed">
            Build a prestigious career with the Philippines&apos; premier luxury real estate advisory. Partner with high-net-worth investors, corporate leaders, and property developers.
          </p>
        </FadeIn>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-10 pb-20">
        {/* Culture & Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {[
            { title: "Uncapped Commission", desc: "Top-tier commission structures & performance bonuses for luxury property deals." },
            { title: "High-Net-Worth Network", desc: "Direct access to corporate buyers, property developers, and institutional tenants." },
            { title: "Real Estate Masterclasses", desc: "Continuous training in contract negotiation, legal compliance, and luxury marketing." },
            { title: "Ortigas CBD Workspaces", desc: "Executive office suite at Tektite East Tower, Ortigas Center, Pasig City." },
          ].map((b) => (
            <div key={b.title} className="bg-[#080602]/80 border border-[#C49A2A]/25 rounded-2xl p-6 backdrop-blur-md hover:border-[#C49A2A]/60 hover:shadow-[0_10px_30px_rgba(196,154,42,0.12)] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#C49A2A]/15 border border-[#C49A2A]/40 text-[#C49A2A] flex items-center justify-center mb-4 font-bold text-sm">✓</div>
              <h4 className="font-['Cinzel'] font-bold text-[#C49A2A] text-base mb-2">{b.title}</h4>
              <p className="font-['Cormorant_Garamond'] text-white/70 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {LUXE_POSITIONS.map((pos, idx) => (
            <FadeIn key={pos.id} delay={idx * 100}>
              <div className="bg-[#080602]/90 border border-[#C49A2A]/30 hover:border-[#C49A2A]/70 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md shadow-xl hover:shadow-[0_12px_40px_rgba(196,154,42,0.15)] transition-all duration-300">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-['Cinzel'] font-bold text-white text-lg md:text-xl tracking-wide">{pos.title}</h3>
                    <span className="px-3.5 py-1 rounded-full bg-[#C49A2A]/15 border border-[#C49A2A]/40 text-[#C49A2A] font-['Montserrat'] text-[10px] tracking-wider uppercase font-semibold">
                      {pos.type}
                    </span>
                  </div>
                  <p className="font-['Cormorant_Garamond'] text-white/75 text-base md:text-lg leading-relaxed">{pos.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-['Montserrat'] text-[#C49A2A]/80 pt-1">
                    <span>📍 {pos.location}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJobId(pos.id);
                    if (typeof window !== 'undefined') window.scrollTo(0, 0);
                  }}
                  className="shrink-0 bg-[#C49A2A] hover:bg-[#FFDF73] text-black font-['Montserrat'] font-extrabold text-xs tracking-[0.25em] uppercase rounded-full px-8 py-3.5 shadow-[0_8px_20px_rgba(196,154,42,0.3)] hover:shadow-[0_12px_28px_rgba(196,154,42,0.45)] transition-all cursor-pointer"
                >
                  APPLY NOW
                </button>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* General Application Callout */}
        <div className="mt-16 bg-[#080602]/90 border border-[#C49A2A]/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-md shadow-xl">
          <h3 className="font-['Cinzel'] font-bold text-xl md:text-2xl text-[#C49A2A] mb-3">Don&apos;t See Your Target Position?</h3>
          <p className="font-['Cormorant_Garamond'] text-white/70 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-6">
            We are always seeking exceptional real estate advisors, leasing specialists, and corporate partners. Send your CV directly to our executive recruitment board:
          </p>
          <a
            href="mailto:careers@alphapremier.com"
            className="inline-block border border-[#C49A2A] text-[#C49A2A] hover:bg-[#C49A2A] hover:text-black font-['Montserrat'] font-bold text-xs tracking-[0.25em] uppercase rounded-full px-9 py-4 shadow-md transition-all duration-300"
          >
            SUBMIT GENERAL CV
          </a>
        </div>
      </div>
    </div>
  );
}

function CareersFormPage({ position: propPosition, onBack, setPage }: { position?: typeof LUXE_POSITIONS[0]; onBack?: () => void; setPage?: (p: Page) => void }) {
  const initialPosition = propPosition ?? LUXE_POSITIONS[0];
  const [activePosId, setActivePosId] = useState(initialPosition.id);
  const position = LUXE_POSITIONS.find((p) => p.id === activePosId) ?? initialPosition;

  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", email: "", contact: "", exp: "", license: "", notes: "" });
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid Business Email is required";
    if (!form.contact.trim()) e.contact = "Contact Number is required";
    if (!fileName) e.resume = "Please attach your Resume / CV";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
  };

  const inputClass = "w-full bg-[#111008] border border-[#C49A2A]/30 text-white placeholder-white/30 font-['Montserrat'] text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#C49A2A] transition-all duration-300";
  const labelClass = "block text-[10px] tracking-[0.25em] text-[#C49A2A] uppercase font-['Montserrat'] font-bold mb-2";

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-black text-white">
      {/* Header Banner */}
      <div className="relative py-12 md:py-16 px-5 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(196,154,42,0.08) 0%, transparent 65%)" }} />
        <FadeIn className="relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#C49A2A]/15 border border-[#C49A2A]/40 text-[#C49A2A] font-['Montserrat'] font-bold text-xs tracking-[0.25em] uppercase mb-4">
            JOB APPLICATION
          </span>
          <h1 className="font-['Cinzel'] shimmer-gold tracking-wider mb-3 text-3xl md:text-5xl">{position.title}</h1>
          <p className="font-['Cormorant_Garamond'] text-white/70 text-base md:text-lg italic max-w-xl mx-auto">
            Please fill out the details below to submit your application to our executive recruitment board.
          </p>
        </FadeIn>
      </div>

      {/* Two-Column Form Container (SwiftClear Reference Layout) */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 pb-20">
        <div className="bg-[#080602]/90 border border-[#C49A2A]/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#C49A2A]/20">
            
            {/* Left Column: Position Selector & Role Summary */}
            <div className="lg:col-span-5 p-6 md:p-10 space-y-6 flex flex-col justify-between bg-[#0c0903]/90">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] tracking-[0.25em] text-[#C49A2A] uppercase font-['Montserrat'] font-bold mb-2">
                    APPLYING FOR POSITION:
                  </label>
                  <div className="relative">
                    <select
                      value={activePosId}
                      onChange={(e) => { setActivePosId(e.target.value); setSubmitted(false); setErrors({}); }}
                      className="w-full bg-[#111008] border-2 border-[#C49A2A]/40 focus:border-[#C49A2A] text-[#C49A2A] font-['Montserrat'] font-extrabold text-sm rounded-2xl px-4 py-3.5 outline-none transition-all cursor-pointer shadow-sm appearance-none pr-10"
                    >
                      {LUXE_POSITIONS.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#111008] text-white">
                          {p.title} ({p.type})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C49A2A]">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] tracking-[0.25em] text-[#C49A2A]/80 uppercase font-['Montserrat'] font-bold mb-1">
                    ROLE SUMMARY
                  </p>
                  <h3 className="font-['Cinzel'] font-bold text-xl text-white mb-2">{position.title}</h3>
                  <p className="font-['Cormorant_Garamond'] text-white/75 text-sm md:text-base leading-relaxed">{position.description}</p>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.25em] text-[#C49A2A]/80 uppercase font-['Montserrat'] font-bold mb-3">
                    POSITION HIGHLIGHTS
                  </p>
                  <ul className="space-y-2.5">
                    {position.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-white/75 font-['Cormorant_Garamond'] text-sm md:text-base">
                        <span className="w-5 h-5 rounded-full bg-[#C49A2A]/20 border border-[#C49A2A]/50 text-[#C49A2A] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (onBack) onBack();
                    else if (setPage) setPage("careers");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 border border-[#C49A2A]/50 text-[#C49A2A] hover:bg-[#C49A2A] hover:text-black font-['Montserrat'] font-extrabold text-xs tracking-[0.2em] uppercase rounded-full px-6 py-3.5 transition-all duration-300 cursor-pointer shadow-md"
                >
                  ← BACK TO ALL POSITIONS
                </button>
              </div>
            </div>

            {/* Right Column: Candidate Details Form */}
            <div className="lg:col-span-7 p-6 md:p-10">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#C49A2A] text-black flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_rgba(196,154,42,0.4)]">
                    ✓
                  </div>
                  <h2 className="font-['Cinzel'] font-bold text-2xl md:text-3xl text-white">Application Received!</h2>
                  <p className="font-['Cormorant_Garamond'] text-white/80 text-lg max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-[#C49A2A]">{form.name}</strong>. Your resume for <strong className="text-white">{position.title}</strong> has been logged with our executive recruitment committee.
                  </p>
                  <div className="p-3.5 bg-[#111008] border border-[#C49A2A]/30 rounded-xl text-xs font-['Montserrat'] text-[#C49A2A]">
                    CONFIRMATION REF: <span className="text-white font-mono font-bold">LP-APP-{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div className="pt-4 flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", contact: "", exp: "", license: "", notes: "" }); setFileName(""); }}
                      className="px-6 py-3 border border-[#C49A2A] text-[#C49A2A] hover:bg-[#C49A2A] hover:text-black font-['Montserrat'] font-bold text-xs tracking-wider uppercase rounded-full transition-all"
                    >
                      Submit Another
                    </button>
                    <button
                      onClick={() => { if (onBack) onBack(); else if (setPage) setPage("careers"); }}
                      className="px-6 py-3 bg-[#C49A2A] text-black font-['Montserrat'] font-extrabold text-xs tracking-wider uppercase rounded-full transition-all hover:bg-[#FFDF73]"
                    >
                      Back to Careers
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-['Cinzel'] font-bold text-2xl text-white mb-1">Candidate Details</h2>
                    <p className="font-['Cormorant_Garamond'] text-white/60 text-base">Submit your information and resume file below.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className={labelClass}>FULL NAME *</label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan dela Cruz" className={inputClass} />
                      {errors.name && <p className="text-red-400 text-xs mt-1 font-['Montserrat']">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>BUSINESS EMAIL *</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@company.com" className={inputClass} />
                        {errors.email && <p className="text-red-400 text-xs mt-1 font-['Montserrat']">{errors.email}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>CONTACT NUMBER *</label>
                        <input type="tel" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+63 9XX XXX XXXX" className={inputClass} />
                        {errors.contact && <p className="text-red-400 text-xs mt-1 font-['Montserrat']">{errors.contact}</p>}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>ATTACH RESUME (PDF/DOC) *</label>
                      <input type="file" ref={fileRef} accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
                      <div className="flex items-center gap-3 bg-[#111008] border border-[#C49A2A]/30 rounded-xl p-2.5">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="bg-[#C49A2A] hover:bg-[#FFDF73] text-black font-['Montserrat'] font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          ⬆ BROWSE
                        </button>
                        <span className="font-['Montserrat'] text-xs text-white/60 truncate flex-1">
                          {fileName || "No file selected"}
                        </span>
                      </div>
                      {errors.resume && <p className="text-red-400 text-xs mt-1 font-['Montserrat']">{errors.resume}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>COVER NOTE / ADDITIONAL SUMMARY</label>
                      <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Briefly summarize your real estate experience or key transaction achievements..." className={inputClass} />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#C49A2A] hover:bg-[#FFDF73] text-black font-['Montserrat'] font-extrabold text-xs tracking-[0.25em] uppercase rounded-full py-4 shadow-[0_8px_25px_rgba(196,154,42,0.35)] hover:shadow-[0_12px_30px_rgba(196,154,42,0.5)] transition-all cursor-pointer mt-2"
                    >
                      SUBMIT APPLICATION
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
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
                      className="w-full border border-[#C49A2A] text-[#C49A2A] bg-transparent px-3 py-3.5 text-[9px] md:text-[10px] tracking-[0.25em] uppercase font-['Montserrat'] transition-all duration-300 active:scale-95"
                      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#C49A2A"; el.style.color = "black"; el.style.boxShadow = "0 0 20px rgba(196,154,42,0.3)"; }}
                      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#C49A2A"; el.style.boxShadow = "none"; }}
                    >
                      Send Message via Email
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
        
        @keyframes goldFlakeFloat {
          0%   { transform: translateY(0) rotate(0deg) scale(0.9); opacity: 0; }
          25%  { opacity: 0.22; }
          50%  { transform: translateY(-40px) translateX(8px) rotate(180deg) scale(1.0); opacity: 0.3; }
          75%  { opacity: 0.2; }
          100% { transform: translateY(-80px) translateX(-6px) rotate(360deg) scale(0.8); opacity: 0; }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.15; }
          50%       { transform: scale(1.1) rotate(45deg); opacity: 0.35; }
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
