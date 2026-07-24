import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  Users, Monitor, Camera, Film, Lightbulb, Megaphone,
  ChevronDown, ArrowRight, Star, X, ChevronLeft, ChevronRight,
} from "lucide-react";

import logo   from "@/imports/Dynamic_Tree_Logo-1.png";
import model1 from "@/imports/model1.jpg";
import model2 from "@/imports/model2.jpg";
import model3 from "@/imports/model3.jpg";
import model4 from "@/imports/model4.jpg";
import model5 from "@/imports/model5.jpg";
import model6 from "@/imports/model6.jpg";
import model7 from "@/imports/model7.jpg";
import model8 from "@/imports/model8.jpg";
import model9 from "@/imports/model9.jpg";

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: Users,     title: "Model & Influencer Casting",          description: "We curate and connect brands with the right faces—models, influencers, and personalities who embody your brand's vision and voice." },
  { icon: Monitor,   title: "TV, Digital & Online Advertising",    description: "From broadcast commercials to targeted digital campaigns, we craft media that performs across every screen and digital platform." },
  { icon: Megaphone, title: "Product Launches & Social Campaigns", description: "Launch your product with strategic campaigns and buzz-building content that drives real engagement and lasting brand recall." },
  { icon: Camera,    title: "Fashion & Product Photography",       description: "We produce studio-grade visual assets that elevate your brand's identity with editorial precision and creative vision." },
  { icon: Film,      title: "Video Direction & Production",        description: "From concept to final cut, we craft compelling video stories that captivate, convert, and endure beyond the campaign." },
  { icon: Lightbulb, title: "Creative Campaign Development",       description: "End-to-end campaign design that connects your brand to your audience with clarity, emotion, and commercial power." },
];

const TICKER_ITEMS = [
  "Model & Influencer Casting", "Video Production", "Fashion Photography",
  "TV & Digital Advertising", "Creative Campaigns", "Product Launches",
  "Talent Management", "Brand Storytelling", "Social Content",
];

const GALLERY = [
  { src: model1, alt: "Runway editorial — red gown",          tall: true  },
  { src: model2, alt: "Group runway — teal collection",       tall: false },
  { src: model3, alt: "White gown runway",                    tall: false },
  { src: model5, alt: "Ancient Filipino Language show",       tall: false },
  { src: model9, alt: "Runway editorial — blue gown",         tall: true  },
  { src: model4, alt: "Neon group campaign stage",            tall: false },
  { src: model7, alt: "Ang Baybayin live production",         tall: false },
];

const TEAM_PHOTOS = [
  { src: model8, alt: "Dynamic Tree team — crew and models backstage" },
  { src: model6, alt: "Dynamic Tree talent — styled models backstage" },
  { src: model4, alt: "Dynamic Tree production — neon campaign cast"  },
];

// ─── Motion variants ──────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 32 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
interface LightboxProps {
  images: { src: string; alt: string }[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  // Close on Escape, navigate with arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0A0608]/92 backdrop-blur-sm" />

      {/* Image */}
      <motion.div
        className="relative z-10 flex items-center justify-center px-4 sm:px-16"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index].src}
          alt={images[index].alt}
          className="max-h-[88vh] max-w-[88vw] object-contain rounded-2xl shadow-2xl"
        />
      </motion.div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-xs text-white/60 tracking-widest"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {index + 1} / {images.length}
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 sm:left-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 sm:right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </motion.div>
  );
}

// ─── Sakura petals ────────────────────────────────────────────────────────────
const SAKURA_PETALS = Array.from({ length: 22 }, (_, i) => {
  const s = (i * 137.508) % 100;
  return {
    id: i,
    left:     s,
    size:     9 + (s % 11),
    duration: 1.6 + (s % 18) * 0.08,
    delay:    (s % 28) * 0.09,
    hue:      s < 50 ? "#F4A8BF" : s < 75 ? "#EF8FA8" : "#FBBFD3",
  };
});

function SakuraFall() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Check scroll on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[60] pointer-events-none overflow-hidden transition-opacity duration-700 ${
        scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {SAKURA_PETALS.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`, top: -24,
            width: p.size, height: p.size * 0.78,
            animation: `sakuraDrop ${p.duration * 1.8}s ${p.delay}s linear infinite`,
          }}
        >
          <svg viewBox="0 0 24 19" fill="none">
            <ellipse cx="12" cy="9.5" rx="12" ry="9.5" fill={p.hue} fillOpacity="0.85" />
            <ellipse cx="12" cy="9.5" rx="7"  ry="5.5"  fill="#fff"  fillOpacity="0.35" />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes sakuraDrop {
          0%   { transform: translateY(0)     rotate(0deg);   opacity: 0;   }
          12%  { opacity: 0.88; }
          85%  { opacity: 0.72; }
          100% { transform: translateY(108vh) rotate(540deg); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();

  // Parallax layers keyed to raw scroll pixels (hero is ~100vh tall)
  const orbY1    = useTransform(scrollY, [0, 700], [0, -120]);
  const orbY2    = useTransform(scrollY, [0, 700], [0, -70]);
  const orbY3    = useTransform(scrollY, [0, 700], [0, -40]);
  const cardLeft  = useTransform(scrollY, [0, 700], [0,  50]);
  const cardRight = useTransform(scrollY, [0, 700], [0,  50]);
  const contentY  = useTransform(scrollY, [0, 700], [0,  60]);

  // Lightbox for filmstrip
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const filmImages = [model2, model3, model4, model5, model7].map((src, i) => ({
    src,
    alt: `Dynamic Tree production ${i + 1}`,
  }));
  const closeLb = useCallback(() => setLbIndex(null), []);
  const prevLb  = useCallback(() => setLbIndex((p) => p !== null ? (p - 1 + filmImages.length) % filmImages.length : 0), [filmImages.length]);
  const nextLb  = useCallback(() => setLbIndex((p) => p !== null ? (p + 1) % filmImages.length : 0), [filmImages.length]);

  return (
    <section
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(160deg, #FDF6F9 0%, #FAF4F8 50%, #F8F2F6 100%)" }}
    >
      {/* Orbs — parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div style={{ y: orbY1 }}
          className="absolute -top-48 -left-48 w-[620px] h-[620px] opacity-40"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full rounded-full" style={{ background: "radial-gradient(circle, #F5ABBE 0%, #E8607E 30%, transparent 65%)", filter: "blur(90px)" }} />
        </motion.div>

        <motion.div style={{ y: orbY2 }}
          className="absolute -top-36 -right-36 w-[520px] h-[520px] opacity-28"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="w-full h-full rounded-full" style={{ background: "radial-gradient(circle, #FBBF7A 0%, #E8843A 30%, transparent 65%)", filter: "blur(100px)" }} />
        </motion.div>

        <motion.div style={{ y: orbY3 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] opacity-20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <div className="w-full h-full rounded-full" style={{ background: "radial-gradient(ellipse, #EDE0F5 0%, #D8C8F0 40%, transparent 70%)", filter: "blur(110px)" }} />
        </motion.div>

        <div className="absolute top-1/2 -left-24 w-[380px] h-[380px] opacity-15 rounded-full"
          style={{ background: "radial-gradient(circle, #B8D8C0 0%, #8CAF8C 30%, transparent 70%)", filter: "blur(90px)" }} />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.045]"
        style={{ backgroundImage: "radial-gradient(circle, #C84A72 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Corner petal silhouettes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.svg
          className="absolute -top-8 -left-8 w-72 h-72 opacity-[0.07]"
          viewBox="0 0 200 200" fill="none"
          animate={{ rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="60" cy="100" rx="55" ry="30" fill="#C84A72" transform="rotate(-40 60 100)" />
          <ellipse cx="100" cy="60" rx="55" ry="28" fill="#C84A72" transform="rotate(-10 100 60)" />
          <ellipse cx="140" cy="90" rx="52" ry="27" fill="#C84A72" transform="rotate(30 140 90)" />
          <ellipse cx="100" cy="130" rx="50" ry="26" fill="#C84A72" transform="rotate(70 100 130)" />
          <circle cx="100" cy="100" r="14" fill="#E8843A" />
        </motion.svg>
        <motion.svg
          className="absolute -bottom-10 -right-10 w-80 h-80 opacity-[0.06]"
          viewBox="0 0 200 200" fill="none"
          animate={{ rotate: [0, -5, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <ellipse cx="60" cy="100" rx="55" ry="28" fill="#E8843A" transform="rotate(-40 60 100)" />
          <ellipse cx="100" cy="60" rx="55" ry="28" fill="#C84A72" transform="rotate(-10 100 60)" />
          <ellipse cx="140" cy="90" rx="52" ry="27" fill="#C84A72" transform="rotate(30 140 90)" />
          <ellipse cx="100" cy="130" rx="50" ry="26" fill="#E8843A" transform="rotate(70 100 130)" />
          <circle cx="100" cy="100" r="14" fill="#C84A72" />
        </motion.svg>
      </div>

      {/* Side cards — float + parallax */}
      <motion.div
        style={{ y: cardLeft }}
        className="absolute left-4 xl:left-10 top-1/2 -translate-y-[46%] z-10 hidden xl:block"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-44 2xl:w-52 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/60 cursor-zoom-in"
            whileHover={{ scale: 1.04, boxShadow: "0 24px 60px rgba(200,74,114,0.22)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setLbIndex(0)}
          >
            <img src={model1} alt="Dynamic Tree production — red gown editorial"
              className="w-full h-full object-cover object-top" style={{ aspectRatio: "3/4" }} />
          </motion.div>
          <motion.div
            className="mt-2 mx-auto w-fit px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase text-[#C84A72] border border-[#C84A72]/25"
            style={{ fontFamily: "Outfit, sans-serif", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}
            whileHover={{ scale: 1.05 }}
          >
            Fashion
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: cardRight }}
        className="absolute right-4 xl:right-10 top-1/2 -translate-y-[46%] z-10 hidden xl:block"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        >
          <motion.div
            className="w-44 2xl:w-52 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/60 cursor-zoom-in"
            whileHover={{ scale: 1.04, boxShadow: "0 24px 60px rgba(200,74,114,0.22)" }}
            transition={{ duration: 0.3 }}
          >
            <img src={model9} alt="Dynamic Tree production — blue gown editorial"
              className="w-full h-full object-cover object-top" style={{ aspectRatio: "3/4" }} />
          </motion.div>
          <motion.div
            className="mt-2 mx-auto w-fit px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase text-[#C84A72] border border-[#C84A72]/25"
            style={{ fontFamily: "Outfit, sans-serif", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}
            whileHover={{ scale: 1.05 }}
          >
            Runway
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Center content — slight scroll drift */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-20 flex flex-col items-center text-center flex-1 px-6 pt-24 lg:pt-28 pb-8"
      >
        {/* Logo */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={logo} alt="Dynamic Tree"
            className="h-16 sm:h-20 lg:h-24 w-auto mx-auto drop-shadow-sm" />
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="flex flex-col items-center gap-0.5 mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          <span className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-[#C84A72] font-bold"
            style={{ fontFamily: "Outfit, sans-serif" }}>
            Elevate Your Brand,
          </span>
          <p className="text-base sm:text-lg lg:text-xl text-[#1C1814]/65 tracking-[0.12em]"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            One Frame at a Time.
          </p>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          className="text-[clamp(3rem,9.5vw,8.5rem)] leading-[0.88] font-black uppercase text-[#1C1814] mb-5"
          style={{ fontFamily: "'Big Shoulders Display', sans-serif", letterSpacing: "-0.02em" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          Dynamic Tree
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          className="text-sm lg:text-base text-[#3D3040] max-w-sm sm:max-w-md leading-relaxed mb-8 font-normal"
          style={{ fontFamily: "Outfit, sans-serif" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38, ease: "easeOut" }}
        >
          A full-service creative agency and talent casting hub — from runway
          productions and TV campaigns to influencer casting and digital content.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('services');
                else if (window.enterpriseNavigate) window.enterpriseNavigate('services');
              }}
              className="group flex items-center justify-center gap-2 border-2 border-[#1C1814] text-[#1C1814] text-sm font-bold px-8 py-3.5 rounded-full hover:bg-[#1C1814] hover:text-white transition-all duration-300 bg-white/50 w-52 sm:w-auto cursor-pointer"
              style={{ fontFamily: "Outfit, sans-serif" }}>
              Our Services
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('inquire');
                else if (window.enterpriseNavigate) window.enterpriseNavigate('inquire');
              }}
              className="group flex items-center justify-center gap-2 bg-[#C84A72] text-white text-sm font-bold px-8 py-3.5 rounded-full hover:bg-[#A0305A] transition-all duration-300 shadow-lg w-52 sm:w-auto cursor-pointer"
              style={{ fontFamily: "Outfit, sans-serif" }}>
              View Our Work
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Filmstrip */}
        <motion.div
          className="w-full max-w-2xl lg:max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
        >
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#8A7078] mb-3 font-semibold"
            style={{ fontFamily: "Outfit, sans-serif" }}>
            Recent Productions
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 justify-center scrollbar-hide">
            {filmImages.map((img, i) => (
              <motion.div
                key={i}
                className="flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 lg:w-28 lg:h-[4.5rem] rounded-lg overflow-hidden bg-[#F0D8E4] ring-1 ring-white/80 shadow-md cursor-zoom-in"
                whileHover={{ scale: 1.08, boxShadow: "0 8px 24px rgba(200,74,114,0.2)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setLbIndex(i)}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover object-center" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        className="relative z-10 border-t border-[#E8C8D4]/40"
        style={{ background: "rgba(253,246,249,0.75)", backdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-7">
          <motion.div
            className="flex flex-wrap justify-center gap-8 sm:gap-12 lg:gap-20"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {[
              { value: "200+", label: "Talents Managed" },
              { value: "50+",  label: "Brand Campaigns"  },
              { value: "12",   label: "Years in Industry" },
              { value: "3×",   label: "Award-Winning Work" },
            ].map((s) => (
              <motion.div
                key={s.label}
                className="flex flex-col items-center gap-1"
                variants={fadeUp}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#C84A72]"
                  style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}>
                  {s.value}
                </span>
                <span className="text-[10px] sm:text-xs text-[#6B5D65] tracking-wide uppercase font-semibold"
                  style={{ fontFamily: "Outfit, sans-serif" }}>
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Lightbox for side cards + filmstrip */}
      <AnimatePresence>
        {lbIndex !== null && (
          <Lightbox images={filmImages} index={lbIndex}
            onClose={closeLb} onPrev={prevLb} onNext={nextLb} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="bg-[#1C1814] py-3.5 overflow-hidden relative">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #1C1814, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #1C1814, transparent)" }} />
      <div className="flex" style={{ width: "max-content", animation: "ticker 30s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4 px-5 whitespace-nowrap">
            <Star size={9} className="text-[#C84A72] fill-[#C84A72] flex-shrink-0" />
            <span className="text-white/65 tracking-widest uppercase"
              style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.68rem" }}>
              {item}
            </span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

// ─── Dynamic Showcase ─────────────────────────────────────────────────────────
function DynamicShowcase() {
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const closeLb = useCallback(() => setLbIndex(null), []);
  const prevLb  = useCallback(() => setLbIndex((p) => p !== null ? (p - 1 + GALLERY.length) % GALLERY.length : 0), []);
  const nextLb  = useCallback(() => setLbIndex((p) => p !== null ? (p + 1) % GALLERY.length : 0), []);

  return (
    <section id="portfolio" className="py-12 sm:py-16 lg:py-20 bg-[#FAF4F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 sm:mb-12"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={fadeLeft}>
            <span className="text-xs tracking-[0.25em] uppercase text-[#C84A72] font-medium"
              style={{ fontFamily: "Outfit, sans-serif" }}>
              Portfolio
            </span>
            <h2 className="text-4xl lg:text-5xl font-semibold text-[#1C1814] mt-2 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Crafting Visual{" "}
              <span style={{ fontStyle: "italic" }}>Buzz.</span>
            </h2>
          </motion.div>
          <motion.p
            className="text-[#3D3040] max-w-xs leading-relaxed text-sm font-normal"
            style={{ fontFamily: "Outfit, sans-serif" }}
            variants={fadeRight}
          >
            Runway productions, editorial campaigns, and live stage shows that
            define the Dynamic Tree standard.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
        >
          {GALLERY.map((img, i) => (
            <motion.div
              key={i}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#F0D8E4] cursor-zoom-in ${
                img.tall ? "aspect-[3/4] lg:row-span-2" : "aspect-[4/3]"
              }`}
              variants={fadeUp}
              whileHover={{ scale: 1.02, zIndex: 10 }}
              transition={{ duration: 0.35 }}
              onClick={() => setLbIndex(i)}
            >
              <img src={img.src} alt={img.alt}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              {/* Hover overlay with label */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-[#1C1814]/60 via-[#1C1814]/10 to-transparent flex items-end p-4"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <div>
                  <p className="text-white text-xs font-semibold tracking-wide"
                    style={{ fontFamily: "Outfit, sans-serif" }}>
                    {img.alt}
                  </p>
                  <p className="text-white/60 text-[10px] tracking-widest uppercase mt-0.5"
                    style={{ fontFamily: "Outfit, sans-serif" }}>
                    Click to expand
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            className="group flex items-center gap-2 text-sm font-medium text-[#1C1814] border border-[#1C1814]/20 px-9 py-3.5 rounded-full hover:bg-[#C84A72] hover:text-white hover:border-transparent transition-all duration-300"
            style={{ fontFamily: "Outfit, sans-serif" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            View Full Portfolio
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {lbIndex !== null && (
          <Lightbox images={GALLERY} index={lbIndex}
            onClose={closeLb} onPrev={prevLb} onNext={nextLb} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Core Offerings ───────────────────────────────────────────────────────────
function CoreOfferings() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="py-16 lg:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FAF4F7 0%, #F5EDF3 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-10"
          style={{ background: "radial-gradient(ellipse, #C84A72 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-14"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        >
          <motion.span
            className="text-xs tracking-[0.25em] uppercase text-[#C84A72] font-medium"
            style={{ fontFamily: "Outfit, sans-serif" }}
            variants={fadeUp}
          >
            What We Do
          </motion.span>
          <motion.h2
            className="text-4xl lg:text-5xl font-semibold text-[#1C1814] mt-3 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
            variants={fadeUp}
          >
            Creative Agency &{" "}<br />
            <span style={{ fontStyle: "italic" }}>Talent Casting Hub</span>
          </motion.h2>
          <motion.p
            className="text-[#3D3040] mt-5 max-w-md mx-auto leading-relaxed text-sm font-normal"
            style={{ fontFamily: "Outfit, sans-serif" }}
            variants={fadeUp}
          >
            Dynamic Tree offers a full spectrum of creative services for brands
            and businesses looking to make a lasting impact.
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-2.5"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}
        >
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`border-l-[3px] rounded-r-2xl overflow-hidden transition-colors duration-300 ${
                  isOpen
                    ? "border-[#C84A72] bg-white shadow-[0_4px_28px_rgba(200,74,114,0.12)]"
                    : "border-[#E8C8D4] bg-white/60 hover:bg-white hover:border-[#C84A72]/60"
                }`}
                animate={{ boxShadow: isOpen ? "0 4px 28px rgba(200,74,114,0.12)" : "none" }}
              >
                <motion.button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isOpen ? "bg-[#C84A72]" : "bg-[#F5E0EC]"
                      }`}
                      animate={{ backgroundColor: isOpen ? "#C84A72" : "#F5E0EC" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon size={16} className={isOpen ? "text-white" : "text-[#C84A72]"} />
                    </motion.div>
                    <span
                      className={`text-base font-medium transition-colors ${isOpen ? "text-[#C84A72]" : "text-[#1C1814]"}`}
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {service.title}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronDown size={17} className={isOpen ? "text-[#C84A72]" : "text-[#8A7078]"} />
                  </motion.div>
                </motion.button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-6 pb-5" style={{ paddingLeft: "calc(1.5rem + 2.25rem + 1rem)" }}>
                        <p className="text-[#3D3040] leading-relaxed text-sm font-normal"
                          style={{ fontFamily: "Outfit, sans-serif" }}>
                          {service.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Join Our Team ────────────────────────────────────────────────────────────
function JoinTeam() {
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const closeLb = useCallback(() => setLbIndex(null), []);
  const prevLb  = useCallback(() => setLbIndex((p) => p !== null ? (p - 1 + TEAM_PHOTOS.length) % TEAM_PHOTOS.length : 0), []);
  const nextLb  = useCallback(() => setLbIndex((p) => p !== null ? (p + 1) % TEAM_PHOTOS.length : 0), []);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #F5E0EC 0%, #EDE0F5 55%, #E0EAF5 100%)" }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Text — fade from left */}
          <motion.div
            className="flex flex-col gap-7"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeLeft}>
              <span className="text-xs tracking-[0.25em] uppercase text-[#C84A72] font-medium"
                style={{ fontFamily: "Outfit, sans-serif" }}>
                Careers
              </span>
              <h2 className="text-4xl lg:text-[3.5rem] font-semibold text-[#1C1814] mt-3 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Join Our{" "}
                <span style={{ fontStyle: "italic" }}>Team.</span>
              </h2>
            </motion.div>

            <motion.p
              className="text-[#3D3040] text-base leading-relaxed font-normal"
              style={{ fontFamily: "Outfit, sans-serif" }}
              variants={fadeLeft}
            >
              Be part of a creative team that brings ideas to life—visually,
              emotionally, and commercially. We're looking for passionate
              storytellers, visual artists, and strategic minds who believe great
              work changes everything.
            </motion.p>

            <motion.div className="grid grid-cols-2 gap-3" variants={stagger}>
              {[
                { role: "Creative Director",  type: "Full Time" },
                { role: "Talent Scout",        type: "Full Time" },
                { role: "Photographer",        type: "Freelance" },
                { role: "Campaign Strategist", type: "Full Time" },
              ].map((job) => (
                <motion.div
                  key={job.role}
                  className="bg-white/65 backdrop-blur-sm rounded-xl p-4 border border-white/60 cursor-default"
                  variants={fadeUp}
                  whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.85)", borderColor: "rgba(200,74,114,0.3)" }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm font-medium text-[#1C1814]" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {job.role}
                  </p>
                  <p className="text-xs text-[#C84A72] mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {job.type}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeLeft}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-fit">
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('careers');
                    else if (window.enterpriseNavigate) window.enterpriseNavigate('careers');
                  }}
                  className="group flex items-center gap-2 bg-[#1C1814] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#C84A72] transition-all duration-300 cursor-pointer"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  View Open Roles
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Photos — fade from right, clickable lightbox */}
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div
              className="rounded-2xl overflow-hidden bg-[#F0D8E8] aspect-[3/4] cursor-zoom-in"
              variants={fadeRight}
              whileHover={{ scale: 1.03, boxShadow: "0 16px 48px rgba(200,74,114,0.18)" }}
              transition={{ duration: 0.3 }}
              onClick={() => setLbIndex(0)}
            >
              <img src={TEAM_PHOTOS[0].src} alt={TEAM_PHOTOS[0].alt}
                className="w-full h-full object-cover object-top" />
            </motion.div>
            <div className="flex flex-col gap-3 lg:pt-8">
              {[1, 2].map((idx) => (
                <motion.div
                  key={idx}
                  className="rounded-2xl overflow-hidden bg-[#F0D8E8] aspect-square cursor-zoom-in"
                  variants={fadeRight}
                  whileHover={{ scale: 1.04, boxShadow: "0 12px 36px rgba(200,74,114,0.18)" }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setLbIndex(idx)}
                >
                  <img src={TEAM_PHOTOS[idx].src} alt={TEAM_PHOTOS[idx].alt}
                    className="w-full h-full object-cover object-top" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {lbIndex !== null && (
          <Lightbox images={TEAM_PHOTOS} index={lbIndex}
            onClose={closeLb} onPrev={prevLb} onNext={nextLb} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <SakuraFall />
      <Hero />
      <Ticker />
      <DynamicShowcase />
      <CoreOfferings />
      <JoinTeam />
    </>
  );
}
