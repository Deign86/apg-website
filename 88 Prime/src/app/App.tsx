import { useState, useEffect, useRef } from "react";
import {
  Menu, X, ChevronRight, Briefcase, Layers, Wind, Users, TrendingDown,
  Star, Palette, Zap, Leaf, Phone, Mail, MapPin, Linkedin, Facebook,
  Instagram, ArrowRight, Package, Truck, Thermometer, BarChart2, ChevronDown,
  Calendar, Clock, Send, TrendingUp, ShieldCheck, Heart, GraduationCap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "services" | "blogs" | "careers";

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

// ─── Shared components ────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = "up", className = "" }: {
  children: React.ReactNode; delay?: number; direction?: "up"|"left"|"right"|"none"; className?: string;
}) {
  const { ref, inView } = useInView();
  const t = direction === "up" ? "translateY(28px)" : direction === "left" ? "translateX(-28px)" : direction === "right" ? "translateX(28px)" : "none";
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0, transform: inView ? "none" : t,
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ label, light = false }: { label: string; light?: boolean }) {
  return (
    <div className="flex items-center gap-3 justify-center mb-4">
      <div className="h-px w-8" style={{ background: "#A8832A" }} />
      <span className="text-[11px] font-bold tracking-[0.25em] uppercase"
        style={{ color: light ? "#D4A53A" : "#A8832A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label}
      </span>
      <div className="h-px w-8" style={{ background: "#A8832A" }} />
    </div>
  );
}

function DarkCta({ headline, sub, btnLabel }: { headline: string; sub: string; btnLabel: string }) {
  const [hov, setHov] = useState(false);
  const { ref, inView } = useInView();
  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: "#0C1F3F", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(168,131,42,1) 1px,transparent 1px),linear-gradient(90deg,rgba(168,131,42,1) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {[...Array(4)].map((_,i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          width: `${[140,80,180,60][i]}px`, height: `${[140,80,180,60][i]}px`,
          background: "#A8832A", opacity: 0.05, filter: "blur(40px)",
          top: `${[10,70,30,80][i]}%`, left: `${[5,85,50,20][i]}%`,
          animation: `pulse-slow ${[7,9,6,8][i]}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.9}s`,
        }} />
      ))}
      <div ref={ref} className="relative z-10 max-w-3xl mx-auto text-center" style={{
        opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}>
        <h2 className="font-black text-white leading-tight mb-4" style={{ fontSize: "clamp(1.9rem,4vw,3rem)" }}>{headline}</h2>
        <p className="text-base font-light mb-8 mx-auto" style={{ color: "rgba(255,255,255,0.6)", maxWidth: "420px" }}>{sub}</p>
        <a href="#" className="inline-flex items-center gap-2.5 px-9 py-4 rounded text-[14px] font-bold tracking-wide"
          style={{
            background: hov ? "#A8832A" : "#fff", color: hov ? "#fff" : "#0C1F3F",
            transform: hov ? "translateY(-3px) scale(1.03)" : "none",
            boxShadow: hov ? "0 12px 40px rgba(168,131,42,0.45)" : "0 4px 16px rgba(0,0,0,0.2)",
            transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
          {btnLabel} <ArrowRight size={16} style={{ transform: hov ? "translateX(4px)" : "none", transition: "transform 0.25s" }} />
        </a>
      </div>
    </section>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  const links: { label: string; page: Page }[] = [
    { label: "Home", page: "home" },
    { label: "Services", page: "services" },
    { label: "Careers", page: "careers" },
    { label: "Blogs", page: "blogs" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{
      background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
      boxShadow: scrolled ? "0 2px 32px rgba(12,31,63,0.1)" : "0 1px 0 rgba(12,31,63,0.08)",
      backdropFilter: "blur(16px)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      transition: "box-shadow 0.4s ease, background 0.4s ease",
    }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[70px] flex items-center justify-between">
        <button onClick={() => setPage("home")} className="flex items-center gap-3 cursor-pointer"
          style={{ background: "none", border: "none", padding: 0 }}>
          <div className="w-9 h-9 rounded-sm flex items-center justify-center text-white text-xs font-black"
            style={{ background: "#0C1F3F", transition: "background 0.25s, transform 0.25s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#A8832A"; (e.currentTarget as HTMLElement).style.transform = "rotate(-4deg) scale(1.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0C1F3F"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
            88
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: "#A8832A" }}>ALPHA PREMIER GROUP</div>
            <div className="text-[13px] font-bold tracking-wide leading-tight" style={{ color: "#0C1F3F" }}>88 Prime Consumer Goods</div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <button key={l.label} onClick={() => setPage(l.page)}
              className="relative text-[13px] font-medium tracking-wide pb-0.5"
              style={{
                color: page === l.page ? "#0C1F3F" : hoveredLink === l.label ? "#0C1F3F" : "#4A5568",
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "color 0.2s",
                background: "none", border: "none", cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredLink(l.label)} onMouseLeave={() => setHoveredLink(null)}>
              {l.label}
              <span className="absolute bottom-0 left-0 h-[1.5px] rounded-full" style={{
                background: "#A8832A",
                width: page === l.page || hoveredLink === l.label ? "100%" : "0%",
                transition: "width 0.25s ease",
              }} />
            </button>
          ))}
          <button onClick={() => setPage("home")}
            className="px-5 py-2 rounded text-[13px] font-semibold tracking-wide text-white"
            style={{ background: "#0C1F3F", border: "1.5px solid #0C1F3F", fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.borderColor = "#A8832A"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 6px 20px rgba(12,31,63,0.25)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0C1F3F"; el.style.borderColor = "#0C1F3F"; el.style.transform = "none"; el.style.boxShadow = "none"; }}>
            Inquire Now
          </button>
        </nav>

        <button className="lg:hidden p-2 rounded" style={{ color: "#0C1F3F" }} onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{ display: "block", transition: "transform 0.3s", transform: menuOpen ? "rotate(90deg)" : "none" }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </span>
        </button>
      </div>

      <div style={{
        maxHeight: menuOpen ? "320px" : "0", overflow: "hidden",
        transition: "max-height 0.35s ease", background: "#fff",
        borderTop: menuOpen ? "1px solid rgba(12,31,63,0.08)" : "none",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div className="px-6 py-5 flex flex-col gap-4">
          {links.map(l => (
            <button key={l.label} onClick={() => { setPage(l.page); setMenuOpen(false); }}
              className="text-sm font-medium text-left" style={{ color: "#0C1F3F", background: "none", border: "none", cursor: "pointer" }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView(0.5);
  const count = useCountUp(value, inView);
  return (
    <div ref={ref} className="flex flex-col items-center py-5 px-4" style={{ background: "rgba(12,31,63,0.5)", backdropFilter: "blur(8px)" }}>
      <span className="text-2xl font-black text-white">{count}{suffix}</span>
      <span className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
    </div>
  );
}

function Hero({ setPage }: { setPage: (p: Page) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const anim = (delay: number) => ({
    opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)",
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  });

  return (
    <section className="relative w-full flex items-center justify-center text-center overflow-hidden"
      style={{ minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="absolute inset-0 bg-center bg-cover" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1800&h=1000&fit=crop&auto=format')",
        transform: "scale(1.04)",
      }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(12,31,63,0.82) 0%,rgba(12,31,63,0.68) 60%,rgba(8,18,40,0.88) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,transparent,#A8832A 40%,#D4A53A 60%,transparent)" }} />

      <div className="relative z-10 max-w-4xl px-6">
        <div style={anim(100)}>
          <div className="inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.25em] uppercase mb-8"
            style={{ background: "rgba(168,131,42,0.18)", color: "#D4A53A", border: "1px solid rgba(168,131,42,0.35)" }}>
            A Subsidiary of Alpha Premier Group
          </div>
        </div>
        <div style={anim(250)}>
          <h1 className="text-white font-black tracking-tight leading-none mb-6"
            style={{ fontSize: "clamp(2.4rem,6vw,5rem)", letterSpacing: "-0.01em" }}>
            SUPPLYING SMARTER.<br />
            <span style={{ color: "#D4A53A" }}>DELIVERING BETTER.</span>
          </h1>
        </div>
        <div style={anim(400)}>
          <p className="font-light tracking-wide mb-10 mx-auto"
            style={{ fontSize: "clamp(1rem,2vw,1.25rem)", color: "rgba(255,255,255,0.75)", maxWidth: "480px", marginBottom: "2.5rem" }}>
            Everyday Essentials, Delivered Exceptionally.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center" style={anim(550)}>
          <button onClick={() => setPage("services")}
            className="px-8 py-3.5 rounded text-[14px] font-semibold tracking-wide text-white inline-flex items-center gap-2 justify-center"
            style={{ background: "#0C1F3F", border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.25s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 28px rgba(168,131,42,0.4)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0C1F3F"; el.style.transform = "none"; el.style.boxShadow = "none"; }}>
            Explore Our Divisions <ChevronRight size={16} />
          </button>
          <a href="#"
            className="px-8 py-3.5 rounded text-[14px] font-semibold tracking-wide inline-flex items-center gap-2 justify-center"
            style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.45)", color: "#fff", transition: "all 0.25s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#D4A53A"; el.style.background = "rgba(168,131,42,0.12)"; el.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.45)"; el.style.background = "transparent"; el.style.transform = "none"; }}>
            Request a Quote
          </a>
        </div>
        <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden mx-auto"
          style={{ maxWidth: "520px", background: "rgba(255,255,255,0.1)", marginTop: "4rem", opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 750ms" }}>
          <StatItem value={500} suffix="+" label="Corporate Clients" />
          <StatItem value={12} suffix="+" label="Years of Service" />
          <StatItem value={3} suffix="" label="Core Divisions" />
        </div>
      </div>
    </section>
  );
}

function DivisionCard({ icon, tag, title, desc, cta, badge, bg, delay }: {
  icon: React.ReactNode; tag: string; title: string; desc: string;
  cta: string; badge?: string; bg: string; delay: number;
}) {
  const { ref, inView } = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className="flex flex-col rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${hov ? "rgba(168,131,42,0.45)" : "rgba(12,31,63,0.1)"}`,
        boxShadow: hov ? "0 16px 48px rgba(12,31,63,0.16)" : "0 2px 16px rgba(12,31,63,0.05)",
        transform: hov ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        opacity: inView ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="h-48 relative overflow-hidden bg-slate-200">
        <div className="absolute inset-0 bg-center bg-cover" style={{
          backgroundImage: `url('${bg}')`,
          transform: hov ? "scale(1.08)" : "scale(1)", transition: "transform 0.6s ease",
        }} />
        <div className="absolute inset-0" style={{ background: hov ? "linear-gradient(to bottom,rgba(12,31,63,0.25),rgba(12,31,63,0.65))" : "linear-gradient(to bottom,rgba(12,31,63,0.15),rgba(12,31,63,0.5))", transition: "background 0.4s" }} />
        <div className="absolute top-4 left-4 p-2.5 rounded-md text-white" style={{
          background: hov ? "#A8832A" : "rgba(12,31,63,0.75)", backdropFilter: "blur(8px)",
          transform: hov ? "rotate(-6deg) scale(1.1)" : "none", transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}>{icon}</div>
        {badge && <div className="absolute bottom-3 left-3 right-3 text-center rounded py-1 text-[10px] font-semibold tracking-wide" style={{ background: "rgba(168,131,42,0.88)", color: "#fff" }}>{badge}</div>}
      </div>
      <div className="flex flex-col flex-1 p-7 bg-white">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#A8832A" }}>{tag}</div>
        <h3 className="text-lg font-bold mb-3" style={{ color: "#0C1F3F" }}>{title}</h3>
        <p className="text-sm leading-relaxed flex-1" style={{ color: "#64748B" }}>{desc}</p>
        <a href="#" className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold"
          style={{ color: hov ? "#A8832A" : "#0C1F3F", transition: "color 0.2s" }}>
          {cta} <ArrowRight size={14} style={{ transform: hov ? "translateX(5px)" : "none", transition: "transform 0.25s" }} />
        </a>
      </div>
    </div>
  );
}

function Divisions() {
  const items = [
    { icon: <Briefcase size={28} strokeWidth={1.5} />, tag: "Division 01", title: "Corporate Essentials", desc: "A comprehensive catalog of premium office supplies, consumables, and workplace essentials — sourced directly and delivered in bulk.", cta: "View Products", bg: "https://images.unsplash.com/photo-1781722351700-a80cd87ac1cb?w=600&h=400&fit=crop&auto=format" },
    { icon: <Layers size={28} strokeWidth={1.5} />, tag: "Division 02", title: "Industrial Materials", desc: "High-performance PVC and WPC panels with wide pattern variety, engineered for fast installation and commercial specifications.", cta: "Request Quote", bg: "https://images.unsplash.com/photo-1701422055922-0df2da90946d?w=600&h=400&fit=crop&auto=format" },
    { icon: <Wind size={28} strokeWidth={1.5} />, tag: "Division 03", title: "HVAC Solutions", desc: "In partnership with Golden Dragon — energy-efficient split-type and cassette air-conditioning units engineered for commercial environments.", cta: "Learn More", badge: "In Partnership with Golden Dragon", bg: "https://images.unsplash.com/photo-1718203862467-c33159fdc504?w=600&h=400&fit=crop&auto=format" },
  ];
  return (
    <section id="divisions" className="py-28 px-6" style={{ background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><SectionLabel label="Core Divisions" /></FadeIn>
        <FadeIn delay={80}><h2 className="text-center font-black leading-tight mb-4" style={{ fontSize: "clamp(1.75rem,3.5vw,2.75rem)", color: "#0C1F3F" }}>What We Supply</h2></FadeIn>
        <FadeIn delay={160}><p className="text-center text-base mb-16 max-w-xl mx-auto" style={{ color: "#64748B" }}>Three specialized divisions designed to cover your business from office floor to facility ceiling.</p></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((d, i) => <DivisionCard key={d.title} {...d} delay={i * 120} />)}
        </div>
      </div>
    </section>
  );
}

function BentoCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  const { ref, inView } = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className="rounded-lg p-6"
      style={{
        background: "#fff",
        border: `1px solid ${hov ? "rgba(168,131,42,0.35)" : "rgba(12,31,63,0.07)"}`,
        boxShadow: hov ? "0 8px 32px rgba(12,31,63,0.1)" : "0 1px 8px rgba(12,31,63,0.04)",
        transform: hov ? "translateY(-4px)" : "none",
        opacity: inView ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="w-9 h-9 rounded-md flex items-center justify-center mb-4" style={{
        background: hov ? "#0C1F3F" : "rgba(12,31,63,0.07)",
        color: hov ? "#fff" : "#0C1F3F",
        transform: hov ? "rotate(-8deg) scale(1.12)" : "none",
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      }}>{icon}</div>
      <h4 className="font-bold text-[15px] mb-2" style={{ color: "#0C1F3F" }}>{title}</h4>
      <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{desc}</p>
    </div>
  );
}

function WhyBento() {
  const features = [
    { icon: <Users size={22} strokeWidth={1.5} />, title: "Professional Staff", desc: "Dedicated account managers and logistics coordinators ensure seamless procurement from inquiry to delivery.", col: "A" },
    { icon: <TrendingDown size={22} strokeWidth={1.5} />, title: "Optimized Pricing", desc: "Direct-sourcing relationships allow us to pass real cost efficiencies to your bottom line — no unnecessary margins.", col: "A" },
    { icon: <Star size={22} strokeWidth={1.5} />, title: "High-End Materials", desc: "Our PVC and WPC product lines meet international durability standards for heavy-use commercial environments.", col: "B" },
    { icon: <Palette size={22} strokeWidth={1.5} />, title: "Wide Pattern Variety", desc: "Over 80 surface textures and finishes — from timber grain to stone — to match any interior brief.", col: "B" },
    { icon: <Zap size={22} strokeWidth={1.5} />, title: "Fast Installation", desc: "Click-and-lock systems reduce on-site installation time by up to 60% versus traditional alternatives.", col: "C" },
    { icon: <Leaf size={22} strokeWidth={1.5} />, title: "Eco-Friendly Solutions", desc: "VOC-free finishes, recyclable materials, and energy-efficient HVAC options support your sustainability goals.", col: "C" },
  ];
  const cols = [{ id: "A", label: "Expertise & Cost-Effectiveness" }, { id: "B", label: "Unmatched Quality & Design" }, { id: "C", label: "Efficiency & Sustainability" }];
  return (
    <section className="py-28 px-6" style={{ background: "#F4F6F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><SectionLabel label="Why 88 Prime" /></FadeIn>
        <FadeIn delay={80}><h2 className="text-center font-black leading-tight mb-4" style={{ fontSize: "clamp(1.75rem,3.5vw,2.75rem)", color: "#0C1F3F" }}>The 88 Prime Advantage</h2></FadeIn>
        <FadeIn delay={160}><p className="text-center text-base mb-16 max-w-xl mx-auto" style={{ color: "#64748B" }}>Precision sourcing, premium quality, and operational efficiency — built into every engagement.</p></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cols.map((col, ci) => (
            <div key={col.id} className="flex flex-col gap-4">
              <FadeIn delay={ci * 100}>
                <div className="rounded-lg px-6 py-4 flex items-center gap-3" style={{ background: "#0C1F3F" }}>
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-black" style={{ background: "#A8832A", color: "#fff" }}>{col.id}</div>
                  <span className="text-sm font-bold text-white">{col.label}</span>
                </div>
              </FadeIn>
              {features.filter(f => f.col === col.id).map((f, fi) => (
                <BentoCard key={f.title} {...f} delay={(ci * 100) + (fi * 80) + 120} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ img, cat, name, specs, badge, delay }: { img: string; cat: string; name: string; specs: string; badge: string; delay: number }) {
  const { ref, inView } = useInView();
  const [hov, setHov] = useState(false);
  const [btn, setBtn] = useState(false);
  return (
    <div ref={ref} className="flex flex-col rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${hov ? "rgba(168,131,42,0.35)" : "rgba(12,31,63,0.09)"}`,
        boxShadow: hov ? "0 16px 48px rgba(12,31,63,0.14)" : "0 2px 12px rgba(12,31,63,0.05)",
        transform: hov ? "translateY(-6px) scale(1.015)" : "translateY(0) scale(1)",
        opacity: inView ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img src={img} alt={name} className="w-full h-full object-cover" style={{ transform: hov ? "scale(1.1)" : "scale(1)", transition: "transform 0.6s ease" }} />
        <div className="absolute inset-0" style={{ background: hov ? "linear-gradient(135deg,rgba(168,131,42,0.08),transparent)" : "transparent", transition: "background 0.4s" }} />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold tracking-wide"
          style={{ background: "#A8832A", color: "#fff", transform: hov ? "scale(1.05)" : "none", transition: "transform 0.25s" }}>
          {badge}
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5 bg-white">
        <div className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: "#A8832A" }}>{cat}</div>
        <h4 className="font-bold text-[15px] leading-snug mb-2" style={{ color: "#0C1F3F" }}>{name}</h4>
        <p className="text-[12px] leading-relaxed flex-1" style={{ color: "#94A3B8" }}>{specs}</p>
        <button className="mt-5 w-full py-2.5 rounded text-[13px] font-semibold tracking-wide text-white"
          style={{ background: btn ? "#A8832A" : "#0C1F3F", transform: btn ? "scale(1.02)" : "none", transition: "all 0.25s", cursor: "pointer" }}
          onMouseEnter={() => setBtn(true)} onMouseLeave={() => setBtn(false)}>
          Inquire
        </button>
      </div>
    </div>
  );
}

function Products() {
  const products = [
    { img: "https://images.unsplash.com/photo-1688578735427-994ecdea3ea4?w=500&h=400&fit=crop&auto=format", cat: "Corporate Essentials", name: "Executive Ergonomic Chair", specs: "Mesh back · Lumbar support · Adjustable armrests · 5-year warranty", badge: "Bestseller" },
    { img: "https://images.unsplash.com/photo-1701422055922-0df2da90946d?w=500&h=400&fit=crop&auto=format", cat: "Industrial Materials", name: "WPC Wall Panel – Timber Oak", specs: "2.9m × 0.18m · Click-lock · 8mm thick · VOC-free finish", badge: "New Arrival" },
    { img: "https://images.unsplash.com/photo-1718203862467-c33159fdc504?w=500&h=400&fit=crop&auto=format", cat: "HVAC Solutions", name: "Golden Dragon Split-Type AC", specs: "1.5 HP · Inverter · 5-star energy rating · R32 refrigerant", badge: "Featured" },
    { img: "https://images.unsplash.com/photo-1781722351700-a80cd87ac1cb?w=500&h=400&fit=crop&auto=format", cat: "Corporate Essentials", name: "A4 Copy Paper — Premium Ream", specs: "80 GSM · Acid-free · 500 sheets · Carton pricing available", badge: "High Volume" },
  ];
  return (
    <section className="py-28 px-6" style={{ background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><SectionLabel label="Featured Products" /></FadeIn>
        <FadeIn delay={80}><h2 className="text-center font-black leading-tight mb-4" style={{ fontSize: "clamp(1.75rem,3.5vw,2.75rem)", color: "#0C1F3F" }}>Products Built for Business</h2></FadeIn>
        <FadeIn delay={160}><p className="text-center text-base mb-16 max-w-xl mx-auto" style={{ color: "#64748B" }}>From everyday consumables to bespoke fit-out materials — a unified quality standard across every SKU.</p></FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p, i) => <ProductCard key={p.name} {...p} delay={i * 100} />)}
        </div>
      </div>
    </section>
  );
}

function AllianceBanner() {
  const [hov, setHov] = useState(false);
  const { ref, inView } = useInView();
  return (
    <section className="py-20 px-6" style={{ background: "#F4F6F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div ref={ref} className="max-w-7xl mx-auto" style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "all 0.65s ease" }}>
        <div className="rounded-xl overflow-hidden flex flex-col lg:flex-row items-stretch"
          style={{ border: `1px solid ${hov ? "rgba(168,131,42,0.35)" : "rgba(12,31,63,0.1)"}`, boxShadow: hov ? "0 12px 40px rgba(12,31,63,0.12)" : "0 2px 16px rgba(12,31,63,0.05)", transition: "all 0.35s" }}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
          <div className="hidden lg:block flex-shrink-0 w-[45%] relative overflow-hidden" style={{ minHeight: "280px" }}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?w=900&h=500&fit=crop&auto=format')", transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform 0.6s ease" }} />
            <div className="absolute inset-0" style={{ background: "rgba(12,31,63,0.15)" }} />
          </div>
          <div className="flex-1 p-10 lg:p-12 bg-white">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#A8832A" }}>Our Strong Alliance</div>
            <h2 className="text-2xl font-black leading-tight mb-4" style={{ color: "#0C1F3F" }}>Backed by Alpha Premier Group</h2>
            <p className="text-sm leading-relaxed mb-6 max-w-[480px]" style={{ color: "#64748B" }}>As a proud subsidiary of Alpha Premier Group, we share a commitment to excellence, innovation, and customer satisfaction. Our collaboration empowers us to deliver premium solutions with global standards while remaining locally grounded.</p>
            <a href="#" className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm font-semibold text-white"
              style={{ background: "#0C1F3F", transition: "all 0.25s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 6px 20px rgba(168,131,42,0.35)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0C1F3F"; el.style.transform = "none"; el.style.boxShadow = "none"; }}>
              Know More About Us <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <>
      <Hero setPage={setPage} />
      <Divisions />
      <WhyBento />
      <Products />
      <AllianceBanner />
      <DarkCta headline="Ready to Supply Smarter?" sub="Let our procurement specialists design a tailored supply solution for your business." btnLabel="Request a Consultation" />
    </>
  );
}

// ─── SERVICES PAGE ────────────────────────────────────────────────────────────
function ServiceCard({ icon, title, desc, detail, delay }: { icon: React.ReactNode; title: string; desc: string; detail: string; delay: number }) {
  const { ref, inView } = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className="flex flex-col rounded-xl p-8"
      style={{
        background: "#fff",
        border: `1px solid ${hov ? "rgba(168,131,42,0.4)" : "rgba(12,31,63,0.09)"}`,
        boxShadow: hov ? "0 20px 56px rgba(12,31,63,0.14)" : "0 2px 16px rgba(12,31,63,0.06)",
        transform: hov ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)",
        opacity: inView ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
        style={{
          background: hov ? "#0C1F3F" : "#F4F6F9",
          color: hov ? "#fff" : "#0C1F3F",
          transform: hov ? "rotate(-8deg) scale(1.12)" : "none",
          transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}>{icon}</div>
      <h3 className="text-xl font-black mb-3" style={{ color: "#0C1F3F" }}>{title}</h3>
      <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#64748B" }}>{desc}</p>
      <div className="rounded-lg px-4 py-3 mb-5" style={{ background: "#F4F6F9" }}>
        <p className="text-[12px] leading-relaxed" style={{ color: "#0C1F3F" }}>{detail}</p>
      </div>
      <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: hov ? "#A8832A" : "#0C1F3F", transition: "color 0.2s" }}>
        Learn More <ArrowRight size={14} style={{ transform: hov ? "translateX(5px)" : "none", transition: "transform 0.25s" }} />
      </a>
    </div>
  );
}

function ServicesPage() {
  const services = [
    { icon: <Package size={28} strokeWidth={1.5} />, title: "Bulk Supply Solutions", desc: "Efficient sourcing and distribution of office goods, consumables, and corporate supplies at scale — designed for businesses that need volume reliability.", detail: "✓ MOQ flexibility  ·  ✓ Consolidated invoicing  ·  ✓ Dedicated account management" },
    { icon: <Truck size={28} strokeWidth={1.5} />, title: "Fast Delivery Logistics", desc: "Timely, trackable delivery services keeping your operations running without interruption — across Metro Manila and key provincial hubs.", detail: "✓ Same-day Metro Manila  ·  ✓ Real-time tracking  ·  ✓ Fleet-managed distribution" },
    { icon: <Layers size={28} strokeWidth={1.5} />, title: "Interior Panels & PVC", desc: "Premium WPC and PVC wall panels with a wide pattern library — engineered for speed of installation and long-term durability in commercial environments.", detail: "✓ 80+ textures & finishes  ·  ✓ Click-lock installation  ·  ✓ VOC-free certified" },
    { icon: <Thermometer size={28} strokeWidth={1.5} />, title: "HVAC Solutions", desc: "In exclusive partnership with Golden Dragon — a complete lineup of split-type and cassette inverter aircon units built for the Philippine climate.", detail: "✓ 1.0–3.0 HP range  ·  ✓ R32 refrigerant  ·  ✓ 5-star energy rated" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 text-center overflow-hidden" style={{ background: "#0C1F3F", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(168,131,42,1) 1px,transparent 1px),linear-gradient(90deg,rgba(168,131,42,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1600&h=800&fit=crop&auto=format')" }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <SectionLabel label="What We Offer" light />
          <h1 className="font-black text-white leading-tight mb-5" style={{ fontSize: "clamp(2.5rem,5vw,4rem)" }}>Our Services</h1>
          <p className="text-lg font-light" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "520px", margin: "0 auto" }}>
            From bulk procurement to last-mile delivery — four integrated service pillars designed around your operational demands.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,transparent,#A8832A 40%,#D4A53A 60%,transparent)" }} />
      </section>

      {/* Service cards 2×2 */}
      <section className="py-28 px-6" style={{ background: "#F4F6F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn><SectionLabel label="Service Pillars" /></FadeIn>
          <FadeIn delay={80}><h2 className="text-center font-black mb-4" style={{ fontSize: "clamp(1.75rem,3.5vw,2.75rem)", color: "#0C1F3F" }}>Built Around Your Operations</h2></FadeIn>
          <FadeIn delay={160}><p className="text-center text-base mb-16 max-w-xl mx-auto" style={{ color: "#64748B" }}>Each service is purpose-built, not bolted on — meaning the people, systems, and partners behind every offering are specialists, not generalists.</p></FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s, i) => <ServiceCard key={s.title} {...s} delay={i * 110} />)}
          </div>
        </div>
      </section>

      {/* Process strip */}
      <section className="py-20 px-6" style={{ background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn><SectionLabel label="How It Works" /></FadeIn>
          <FadeIn delay={80}><h2 className="text-center font-black mb-16" style={{ fontSize: "clamp(1.75rem,3vw,2.25rem)", color: "#0C1F3F" }}>From Inquiry to Delivery</h2></FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-0 relative">
            {["Send Inquiry", "Get a Quote", "Confirm Order", "Delivered"].map((step, i) => {
              const { ref, inView } = useInView();
              return (
                <div key={step} ref={ref} className="flex flex-col items-center text-center px-6"
                  style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(20px)", transition: `all 0.55s ease ${i * 120}ms` }}>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg mb-4"
                      style={{ background: "#0C1F3F", zIndex: 1, position: "relative" }}>{i + 1}</div>
                    {i < 3 && <div className="absolute top-6 left-12 right-0 h-px hidden sm:block" style={{ background: "rgba(12,31,63,0.15)", width: "calc(100% + 3rem)", zIndex: 0 }} />}
                  </div>
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "#A8832A" }}>Step {i + 1}</div>
                  <div className="font-bold text-[15px]" style={{ color: "#0C1F3F" }}>{step}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-16 px-6" style={{ background: "#F4F6F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden" style={{ background: "rgba(12,31,63,0.08)" }}>
          {[{ n: 500, s: "+", l: "Active Corporate Clients" }, { n: 98, s: "%", l: "On-Time Delivery Rate" }, { n: 80, s: "+", l: "Panel Textures Available" }, { n: 12, s: "+", l: "Years in Operation" }].map((stat, i) => {
            const { ref, inView } = useInView(0.4);
            const count = useCountUp(stat.n, inView);
            return (
              <div key={stat.l} ref={ref} className="flex flex-col items-center justify-center py-10 px-6"
                style={{ background: "#fff", opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(16px)", transition: `all 0.55s ease ${i * 100}ms` }}>
                <div className="text-4xl font-black mb-2" style={{ color: "#0C1F3F" }}>{count}{stat.s}</div>
                <div className="text-[12px] font-medium text-center" style={{ color: "#64748B" }}>{stat.l}</div>
              </div>
            );
          })}
        </div>
      </section>

      <DarkCta headline="Partner with Us" sub="Tell us what you need — we'll build the supply solution around your business." btnLabel="Contact Sales" />
    </>
  );
}

// ─── BLOGS PAGE ───────────────────────────────────────────────────────────────
const POSTS = [
  { img: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=900&h=560&fit=crop&auto=format", cat: "Logistics", catColor: "#2563EB", title: "How Direct Sourcing Cuts Cost Without Cutting Corners", excerpt: "We break down the economics of B2B direct procurement and show exactly how smart supplier relationships translate to margin wins for your business.", date: "June 28, 2025", read: "6 min read", featured: true },
  { img: "https://images.unsplash.com/photo-1758548157195-67d141468467?w=600&h=400&fit=crop&auto=format", cat: "Product Spotlight", catColor: "#7C3AED", title: "WPC vs PVC Panels: Which is Right for Your Fit-Out?", excerpt: "A practical breakdown of both materials — comparing durability, moisture resistance, install time, and cost per sqm.", date: "June 14, 2025", read: "5 min read" },
  { img: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=600&h=400&fit=crop&auto=format", cat: "Industry Trends", catColor: "#059669", title: "The Rise of Inverter HVAC in Philippine Commercial Spaces", excerpt: "Inverter technology is now the baseline expectation — here's what the shift means for facility managers and procurement teams.", date: "June 3, 2025", read: "4 min read" },
  { img: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&h=400&fit=crop&auto=format", cat: "Operations", catColor: "#DC2626", title: "5 Office Supply Procurement Mistakes That Drain Budgets", excerpt: "From fragmented vendors to reactive restocking — the common patterns that silently inflate your procurement overhead.", date: "May 22, 2025", read: "5 min read" },
  { img: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600&h=400&fit=crop&auto=format", cat: "Company News", catColor: "#D97706", title: "88 Prime and Golden Dragon Deepen HVAC Partnership", excerpt: "Our expanded agreement brings Golden Dragon's full commercial unit range to Philippine buyers, backed by local after-sales support.", date: "May 10, 2025", read: "3 min read" },
  { img: "https://images.unsplash.com/photo-1606964212858-c215029db704?w=600&h=400&fit=crop&auto=format", cat: "Logistics", catColor: "#2563EB", title: "Same-Day Delivery: Inside Our Metro Manila Dispatch System", excerpt: "How our logistics team maintains a 98% on-time rate across 17 cities in the National Capital Region.", date: "April 30, 2025", read: "4 min read" },
];

function BlogCard({ post, delay }: { post: typeof POSTS[number]; delay: number }) {
  const { ref, inView } = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className="flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "#fff",
        border: `1px solid ${hov ? "rgba(12,31,63,0.18)" : "rgba(12,31,63,0.08)"}`,
        boxShadow: hov ? "0 16px 48px rgba(12,31,63,0.12)" : "0 2px 12px rgba(12,31,63,0.05)",
        transform: hov ? "translateY(-6px)" : "none",
        opacity: inView ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img src={post.img} alt={post.title} className="w-full h-full object-cover"
          style={{ transform: hov ? "scale(1.07)" : "scale(1)", transition: "transform 0.55s ease" }} />
        <div className="absolute inset-0" style={{ background: hov ? "rgba(12,31,63,0.1)" : "transparent", transition: "background 0.3s" }} />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide text-white"
          style={{ background: post.catColor }}>{post.cat}</span>
      </div>
      <div className="flex flex-col flex-1 p-6">
        <h3 className="font-black text-[15px] leading-snug mb-3" style={{ color: "#0C1F3F" }}>{post.title}</h3>
        <p className="text-[13px] leading-relaxed flex-1 mb-4" style={{ color: "#64748B" }}>{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px]" style={{ color: "#94A3B8" }}>
            <span className="flex items-center gap-1"><Calendar size={11} />{post.date}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{post.read}</span>
          </div>
          <a href="#" className="text-[12px] font-semibold inline-flex items-center gap-1"
            style={{ color: hov ? "#A8832A" : "#0C1F3F", transition: "color 0.2s" }}>
            Read <ArrowRight size={12} style={{ transform: hov ? "translateX(3px)" : "none", transition: "transform 0.2s" }} />
          </a>
        </div>
      </div>
    </div>
  );
}

function BlogsPage() {
  const featured = POSTS[0];
  const rest = POSTS.slice(1);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [featHov, setFeatHov] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center overflow-hidden" style={{ background: "#0C1F3F", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(168,131,42,1) 1px,transparent 1px),linear-gradient(90deg,rgba(168,131,42,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <SectionLabel label="Industry Insights" light />
          <h1 className="font-black text-white leading-tight mb-4" style={{ fontSize: "clamp(2.2rem,5vw,3.75rem)" }}>Blogs & Insights</h1>
          <p className="text-base font-light" style={{ color: "rgba(255,255,255,0.6)", maxWidth: "460px", margin: "0 auto" }}>Procurement intelligence, product spotlights, and logistics thinking — curated for B2B decision-makers.</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,transparent,#A8832A 40%,#D4A53A 60%,transparent)" }} />
      </section>

      {/* Featured post */}
      <section className="py-16 px-6" style={{ background: "#F8F9FB", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn><div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6" style={{ color: "#A8832A" }}>Latest Insight</div></FadeIn>
          <FadeIn delay={80}>
            <div className="rounded-2xl overflow-hidden flex flex-col lg:flex-row"
              style={{
                border: `1px solid ${featHov ? "rgba(168,131,42,0.4)" : "rgba(12,31,63,0.1)"}`,
                boxShadow: featHov ? "0 20px 60px rgba(12,31,63,0.14)" : "0 4px 24px rgba(12,31,63,0.07)",
                transition: "all 0.4s ease",
              }}
              onMouseEnter={() => setFeatHov(true)} onMouseLeave={() => setFeatHov(false)}>
              <div className="lg:w-[55%] relative overflow-hidden bg-slate-200" style={{ minHeight: "340px" }}>
                <img src={featured.img} alt={featured.title} className="w-full h-full object-cover absolute inset-0"
                  style={{ transform: featHov ? "scale(1.05)" : "scale(1)", transition: "transform 0.6s ease" }} />
                <div className="absolute inset-0" style={{ background: "rgba(12,31,63,0.12)" }} />
                <span className="absolute top-5 left-5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide text-white"
                  style={{ background: featured.catColor }}>{featured.cat}</span>
              </div>
              <div className="flex-1 p-8 lg:p-12 bg-white flex flex-col justify-center">
                <div className="flex items-center gap-3 text-[11px] mb-4" style={{ color: "#94A3B8" }}>
                  <span className="flex items-center gap-1"><Calendar size={11} />{featured.date}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{featured.read}</span>
                </div>
                <h2 className="font-black leading-tight mb-4" style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", color: "#0C1F3F" }}>{featured.title}</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#64748B" }}>{featured.excerpt}</p>
                <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-white w-fit"
                  style={{ background: "#0C1F3F", transition: "all 0.25s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 6px 20px rgba(168,131,42,0.35)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0C1F3F"; el.style.transform = "none"; el.style.boxShadow = "none"; }}>
                  Read Article <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20 px-6" style={{ background: "#F8F9FB", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn><h2 className="font-black mb-10" style={{ fontSize: "clamp(1.4rem,2.5vw,1.75rem)", color: "#0C1F3F" }}>More Articles</h2></FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((p, i) => <BlogCard key={p.title} post={p} delay={i * 90} />)}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-6" style={{ background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <div className="rounded-2xl p-10 lg:p-14" style={{ background: "linear-gradient(135deg,#0C1F3F 0%,#1A3560 100%)" }}>
              <SectionLabel label="Stay Informed" light />
              <h2 className="font-black text-white mb-3" style={{ fontSize: "clamp(1.5rem,3vw,2rem)" }}>Industry Insights, Monthly</h2>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>No fluff — just relevant procurement, logistics, and product intelligence delivered to your inbox.</p>
              {submitted ? (
                <div className="flex items-center justify-center gap-2 text-white font-semibold">
                  <span style={{ color: "#D4A53A" }}>✓</span> You're subscribed — thank you!
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email" placeholder="your@company.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="flex-1 px-5 py-3 rounded text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#D4A53A")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                  />
                  <button onClick={() => email && setSubmitted(true)}
                    className="px-6 py-3 rounded text-sm font-bold text-white inline-flex items-center gap-2 justify-center"
                    style={{ background: "#A8832A", transition: "all 0.25s", cursor: "pointer", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#c9a030"; el.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.transform = "none"; }}>
                    Subscribe <Send size={14} />
                  </button>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

// ─── CAREERS PAGE ─────────────────────────────────────────────────────────────
const JOBS = [
  { title: "B2B Sales Executive", dept: "Sales & Business Development", loc: "Mandaluyong City", type: "Full-time" },
  { title: "Procurement Specialist", dept: "Supply Chain", loc: "Mandaluyong City", type: "Full-time" },
  { title: "Logistics Coordinator", dept: "Operations", loc: "Metro Manila", type: "Full-time" },
  { title: "Interior Solutions Consultant", dept: "Industrial Materials", loc: "Hybrid", type: "Full-time" },
  { title: "HVAC Technical Sales Rep", dept: "HVAC Solutions", loc: "Metro Manila", type: "Full-time" },
  { title: "Marketing & Content Associate", dept: "Marketing", loc: "Remote", type: "Full-time" },
];

function JobRow({ job, delay }: { job: typeof JOBS[number]; delay: number }) {
  const { ref, inView } = useInView();
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className="rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${open ? "rgba(168,131,42,0.4)" : hov ? "rgba(12,31,63,0.18)" : "rgba(12,31,63,0.09)"}`,
        boxShadow: open ? "0 8px 32px rgba(12,31,63,0.1)" : "0 2px 8px rgba(12,31,63,0.04)",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(16px)",
        transition: "all 0.4s ease",
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <button onClick={() => setOpen(!open)} className="w-full text-left"
        style={{ background: open ? "#F8F9FB" : "#fff", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <div className="font-bold text-[15px]" style={{ color: "#0C1F3F" }}>{job.title}</div>
              <div className="text-[12px] mt-0.5" style={{ color: "#64748B" }}>{job.dept} · {job.loc}</div>
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold w-fit"
              style={{ background: "rgba(12,31,63,0.07)", color: "#0C1F3F" }}>{job.type}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="#" className="px-5 py-2 rounded text-[13px] font-semibold text-white"
              style={{ background: "#0C1F3F", transition: "all 0.25s" }}
              onClick={e => e.stopPropagation()}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0C1F3F"; el.style.transform = "none"; }}>
              Apply Now
            </a>
            <ChevronDown size={18} style={{ color: "#94A3B8", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease", flexShrink: 0 }} />
          </div>
        </div>
      </button>
      <div style={{ maxHeight: open ? "260px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
        <div className="px-6 pb-6 pt-2" style={{ borderTop: "1px solid rgba(12,31,63,0.07)", background: "#F8F9FB" }}>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#64748B" }}>
            We're looking for a driven and detail-oriented <strong style={{ color: "#0C1F3F" }}>{job.title}</strong> to join our growing team. You'll work closely with cross-functional partners across procurement, logistics, and client-facing roles to deliver real business value. Experience in B2B environments preferred.
          </p>
          <div className="flex flex-wrap gap-2">
            {["B2B Experience", "Strong Communication", "Results-Driven", "Team Player"].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-medium" style={{ background: "rgba(12,31,63,0.07)", color: "#0C1F3F" }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CareersPage() {
  const perks = [
    { icon: <TrendingUp size={26} strokeWidth={1.5} />, title: "Career Growth", desc: "Structured learning paths, mentorship from senior leaders, and real opportunities to grow within the Alpha Premier Group network." },
    { icon: <ShieldCheck size={26} strokeWidth={1.5} />, title: "Comprehensive Benefits", desc: "Competitive base salary, HMO coverage from day one, performance bonuses, and government-mandated benefits — plus a little more." },
    { icon: <Heart size={26} strokeWidth={1.5} />, title: "Great Culture", desc: "A collaborative, no-bureaucracy team where results are recognized, ideas are heard, and Fridays finish on time." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-36 pb-0 px-6 overflow-hidden" style={{ background: "#0C1F3F", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(168,131,42,1) 1px,transparent 1px),linear-gradient(90deg,rgba(168,131,42,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 max-w-7xl mx-auto pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel label="Join the Team" light />
              <h1 className="font-black text-white leading-tight mb-5" style={{ fontSize: "clamp(2.2rem,4.5vw,3.75rem)" }}>
                Build Your Career<br /><span style={{ color: "#D4A53A" }}>With 88 Prime.</span>
              </h1>
              <p className="text-base font-light mb-8" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "420px" }}>
                We're a fast-moving B2B trading company backed by Alpha Premier Group. We hire people who take ownership, move fast, and care about the work.
              </p>
              <div className="flex gap-4 flex-wrap">
                <a href="#positions" className="px-7 py-3.5 rounded text-[14px] font-semibold text-white inline-flex items-center gap-2"
                  style={{ background: "#A8832A", transition: "all 0.25s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#c9a030"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 24px rgba(168,131,42,0.45)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.transform = "none"; el.style.boxShadow = "none"; }}>
                  See Open Positions <ChevronRight size={16} />
                </a>
                <a href="#" className="px-7 py-3.5 rounded text-[14px] font-semibold inline-flex items-center gap-2"
                  style={{ border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", transition: "all 0.25s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#D4A53A"; el.style.background = "rgba(168,131,42,0.1)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.3)"; el.style.background = "transparent"; }}>
                  Learn About Us
                </a>
              </div>
            </div>
            {/* Photo collage */}
            <div className="hidden lg:grid grid-cols-2 gap-3 h-[420px]">
              {[
                { img: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=500&h=600&fit=crop&auto=format", tall: true },
                { img: "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?w=500&h=280&fit=crop&auto=format", tall: false },
                { img: "https://images.unsplash.com/photo-1690378820474-b468b8ee64d3?w=500&h=280&fit=crop&auto=format", tall: false },
              ].map((photo, i) => (
                <div key={i} className={`relative rounded-xl overflow-hidden ${i === 0 ? "row-span-2" : ""}`}
                  style={{ minHeight: i === 0 ? "100%" : "190px" }}>
                  <img src={photo.img} alt="Team" className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0" style={{ background: "rgba(12,31,63,0.1)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,transparent,#A8832A 40%,#D4A53A 60%,transparent)" }} />
      </section>

      {/* Why join us */}
      <section className="py-24 px-6" style={{ background: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn><SectionLabel label="Why Join Us" /></FadeIn>
          <FadeIn delay={80}><h2 className="text-center font-black mb-4" style={{ fontSize: "clamp(1.75rem,3.5vw,2.5rem)", color: "#0C1F3F" }}>A Place to Grow, Not Just Work</h2></FadeIn>
          <FadeIn delay={160}><p className="text-center text-base mb-16 max-w-lg mx-auto" style={{ color: "#64748B" }}>We invest in people — with the systems, support, and culture to make your work genuinely rewarding.</p></FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {perks.map((perk, i) => {
              const { ref, inView } = useInView();
              const [hov, setHov] = useState(false);
              return (
                <div key={perk.title} ref={ref} className="rounded-xl p-8 text-center flex flex-col items-center"
                  style={{
                    background: hov ? "#0C1F3F" : "#F4F6F9",
                    border: `1px solid ${hov ? "#0C1F3F" : "rgba(12,31,63,0.07)"}`,
                    transform: hov ? "translateY(-6px) scale(1.01)" : "none",
                    opacity: inView ? 1 : 0,
                    transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                    transitionDelay: inView ? `${i * 120}ms` : "0ms",
                  }}
                  onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                    style={{ background: hov ? "rgba(255,255,255,0.12)" : "#fff", color: hov ? "#D4A53A" : "#0C1F3F", transition: "all 0.35s" }}>
                    {perk.icon}
                  </div>
                  <h3 className="font-black text-lg mb-3" style={{ color: hov ? "#fff" : "#0C1F3F", transition: "color 0.3s" }}>{perk.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: hov ? "rgba(255,255,255,0.7)" : "#64748B", transition: "color 0.3s" }}>{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section id="positions" className="py-20 px-6" style={{ background: "#F4F6F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn><SectionLabel label="Open Positions" /></FadeIn>
          <FadeIn delay={80}><h2 className="text-center font-black mb-4" style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", color: "#0C1F3F" }}>Find Your Role</h2></FadeIn>
          <FadeIn delay={160}><p className="text-center text-base mb-12 max-w-lg mx-auto" style={{ color: "#64748B" }}>All positions are based in the Philippines. Click a role to see the full description.</p></FadeIn>
          <div className="flex flex-col gap-3">
            {JOBS.map((job, i) => <JobRow key={job.title} job={job} delay={i * 80} />)}
          </div>
          <FadeIn delay={400}>
            <div className="mt-10 rounded-xl p-8 text-center" style={{ background: "#fff", border: "1px solid rgba(12,31,63,0.08)" }}>
              <GraduationCap size={28} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: "#A8832A" }} />
              <h3 className="font-black text-[17px] mb-2" style={{ color: "#0C1F3F" }}>Don't see your role?</h3>
              <p className="text-sm mb-5" style={{ color: "#64748B" }}>We're always open to talented people. Send us your CV and we'll reach out when the right opportunity comes up.</p>
              <a href="#" className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm font-semibold text-white"
                style={{ background: "#0C1F3F", transition: "all 0.25s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#0C1F3F"; el.style.transform = "none"; }}>
                Submit General Application <ArrowRight size={14} />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <DarkCta headline="Ready to Join 88 Prime?" sub="Take the first step toward a career built on real ownership, real growth, and real impact." btnLabel="Browse All Roles" />
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: Page) => void }) {
  const { ref, inView } = useInView(0.05);
  const nav: { label: string; page: Page }[] = [
    { label: "Home", page: "home" }, { label: "Services", page: "services" },
    { label: "Careers", page: "careers" }, { label: "Blogs", page: "blogs" },
  ];
  return (
    <footer ref={ref} className="pt-16 pb-8 px-6" style={{
      background: "#07132A", fontFamily: "'Plus Jakarta Sans', sans-serif",
      borderTop: "1px solid rgba(168,131,42,0.2)",
      opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(16px)", transition: "all 0.6s ease",
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-sm flex items-center justify-center text-white text-xs font-black cursor-pointer"
                style={{ background: "#A8832A", transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "rotate(8deg) scale(1.1)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}>88</div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: "#A8832A" }}>ALPHA PREMIER GROUP</div>
                <div className="text-[13px] font-bold text-white leading-tight">88 Prime Consumer Goods Trading</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Supplying businesses across the Philippines with premium goods, industrial materials, and HVAC solutions — backed by Alpha Premier Group.</p>
            <div className="flex gap-3 mt-6">
              {[Linkedin, Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#A8832A"; el.style.color = "#fff"; el.style.transform = "translateY(-3px) scale(1.1)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.07)"; el.style.color = "rgba(255,255,255,0.5)"; el.style.transform = "none"; }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#A8832A" }}>Navigation</div>
            <div className="flex flex-col gap-3">
              {nav.map(l => (
                <button key={l.label} onClick={() => setPage(l.page)}
                  className="text-sm text-left w-fit" style={{ color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#A8832A" }}>Contact</div>
            <div className="flex flex-col gap-4">
              {[
                { icon: <Phone size={14} />, text: "+63 2 8123 4567" },
                { icon: <Mail size={14} />, text: "info@88prime.com.ph" },
                { icon: <MapPin size={14} />, text: "Mandaluyong City, Metro Manila" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-2.5" style={{ transition: "all 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; (e.currentTarget as HTMLElement).style.transform = "translateX(3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: "#A8832A" }}>{c.icon}</span>
                  <span className="text-sm leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-px mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} 88 Prime Consumer Goods Trading. A Subsidiary of Alpha Premier Group. All Rights Reserved.</p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Use"].map(l => (
              <a key={l} href="#" className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#A8832A")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Global styles ────────────────────────────────────────────────────────────
const globalStyles = `
  @keyframes pulse-slow {
    0% { transform: scale(1) translate(0,0); opacity: 0.04; }
    100% { transform: scale(1.3) translate(10px,-10px); opacity: 0.08; }
  }
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 0px; }
  input::placeholder { color: rgba(255,255,255,0.4); }
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="bg-background text-foreground">
        <Nav page={page} setPage={setPage} />
        <main>
          {page === "home" && <HomePage setPage={setPage} />}
          {page === "services" && <ServicesPage />}
          {page === "blogs" && <BlogsPage />}
          {page === "careers" && <CareersPage />}
        </main>
        <Footer setPage={setPage} />
      </div>
    </>
  );
}
