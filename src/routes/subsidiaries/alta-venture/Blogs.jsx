import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, BookOpen, Calendar, Clock, ChevronRight, Send, Sparkles, CheckCircle2
} from 'lucide-react';
import { TEAL, TEAL2, ACCENT, MINT_LIGHT, MUTED } from './shared';
import { Glass, Pill } from './shared';

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const TAG_COLORS = {
  Finance: ACCENT, Operations: '#d97706', Technology: '#4338ca',
  People: TEAL2, CX: '#7c3aed',
};

const BLOG_POSTS = [
  {
    id: 'post-1',
    tag: 'Finance', date: 'Jun 28, 2025', read: '5 min read', featured: true,
    title: 'Why Every Growing Business Needs a Virtual CFO in 2025',
    body: 'The days of waiting until Series B to hire senior financial leadership are over. Discover how fractional CFOs level the playing field for high-growth startups and middle-market companies worldwide.'
  },
  {
    id: 'post-2',
    tag: 'Operations', date: 'Jun 14, 2025', read: '4 min read',
    title: 'The Hidden Cost of In-House Hiring (And How Outsourcing Changes the Math)',
    body: "When you factor in benefits, hardware, training, and management overhead, full-time internal hires cost 1.5x to 2x their base salary. Here is how strategic outsourcing unlocks flexibility."
  },
  {
    id: 'post-3',
    tag: 'Technology', date: 'May 30, 2025', read: '6 min read',
    title: 'Automating Your Back-Office: A 2025 Execution Roadmap',
    body: 'From automated invoice matching to AI-assisted data entry, back-office operations are undergoing a massive transformation. Here is a step-by-step roadmap for growing firms.'
  },
  {
    id: 'post-4',
    tag: 'People', date: 'May 18, 2025', read: '3 min read',
    title: 'Building Remote Teams That Drive Measurable Output',
    body: "Culture does not stop at office walls. HR specialists share actionable frameworks for onboarding, async communication, and talent retention across global remote teams."
  },
  {
    id: 'post-5',
    tag: 'CX', date: 'May 05, 2025', read: '5 min read',
    title: 'Customer Experience in the AI Era: Speed Meets Human Empathy',
    body: 'AI support bots accelerate response times, but customers still demand genuine human resolution. How to balance automation and human support for high NPS.'
  },
  {
    id: 'post-6',
    tag: 'Finance', date: 'Apr 22, 2025', read: '4 min read',
    title: '90-Day Cash Flow Forecasting: The Metric That Saves Startups',
    body: "Most company failures stem from unexpected cash flow crunches. Our Virtual CFO team shares essential 90-day runway forecasting models used by venture-backed startups."
  },
];

export default function Blogs() {
  const [activeTag, setActiveTag] = useState('All');
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const tags = ['All', 'Finance', 'Operations', 'Technology', 'People', 'CX'];
  const filtered = activeTag === 'All' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.tag === activeTag);
  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p !== featured);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #e2f8f0 0%, #f6fef9 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -90, right: -50, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.4) 0%, transparent 70%)',
              filter: 'blur(72px)',
            }}
          />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp}>
            <Pill>Insights & Intelligence</Pill>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
            style={{ color: TEAL }}
          >
            The Alta Venture <span style={{ color: ACCENT }}>Insights Blog</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
            style={{ color: MUTED }}
          >
            Expert strategic advice on outsourcing, fractional CFO leadership, IT operations, and enterprise scaling.
          </motion.p>
        </motion.div>
      </section>

      {/* ── FILTER & ARTICLES ── */}
      <section className="relative overflow-hidden py-16 px-6 md:px-14" style={{ background: 'linear-gradient(155deg, #f0fdf8 0%, #f6fef9 45%, #f5f0ff 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Mint orb top-left */}
          <div style={{ position: 'absolute', top: -120, left: -70, width: 520, height: 460, background: 'radial-gradient(ellipse at 38% 38%, rgba(77,232,184,0.26) 0%, rgba(20,146,123,0.10) 48%, transparent 70%)', filter: 'blur(68px)' }} />
          {/* Violet orb top-right */}
          <div style={{ position: 'absolute', top: -70, right: -50, width: 440, height: 380, background: 'radial-gradient(ellipse at 62% 40%, rgba(167,139,250,0.22) 0%, rgba(124,58,237,0.09) 50%, transparent 72%)', filter: 'blur(65px)' }} />
          {/* Amber bottom-centre */}
          <div style={{ position: 'absolute', bottom: -55, left: '25%', width: 400, height: 350, background: 'radial-gradient(ellipse at 50% 62%, rgba(251,191,36,0.17) 0%, rgba(245,158,11,0.07) 52%, transparent 72%)', filter: 'blur(72px)' }} />
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.03"><defs><pattern id="blog-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#14927b" /></pattern></defs><rect width="100%" height="100%" fill="url(#blog-dots)" /></svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Tag Filter Bar */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer border ${
                  activeTag === tag
                    ? 'shadow-md scale-105'
                    : 'hover:bg-white/80'
                }`}
                style={{
                  background: activeTag === tag ? TEAL : 'rgba(255,255,255,0.75)',
                  color: activeTag === tag ? '#ffffff' : TEAL,
                  borderColor: activeTag === tag ? TEAL : 'rgba(8, 38, 54, 0.1)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {/* Featured Article Card */}
            {featured && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <Glass hoverEffect className="rounded-3xl p-8 md:p-12 border shadow-xl">
                  <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                    <div
                      className="w-full lg:w-72 h-48 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${TAG_COLORS[featured.tag] ?? TEAL}20, ${TAG_COLORS[featured.tag] ?? TEAL}08)`,
                        border: `1.5px solid ${TAG_COLORS[featured.tag] ?? TEAL}30`,
                      }}
                    >
                      <BookOpen size={48} style={{ color: TAG_COLORS[featured.tag] ?? TEAL, opacity: 0.6 }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider"
                          style={{ background: `${TAG_COLORS[featured.tag] ?? TEAL}15`, color: TAG_COLORS[featured.tag] ?? TEAL }}
                        >
                          {featured.tag}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                          <Sparkles size={12} /> Featured Article
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: TEAL }}>
                        {featured.title}
                      </h2>
                      <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: MUTED }}>
                        {featured.body}
                      </p>

                      <div className="flex items-center gap-6 text-xs font-semibold" style={{ color: MUTED }}>
                        <span className="flex items-center gap-1.5"><Calendar size={13} /> {featured.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} /> {featured.read}</span>
                        <button
                          className="ml-auto flex items-center gap-1.5 text-xs font-extrabold hover:gap-2.5 transition-all"
                          style={{ color: TAG_COLORS[featured.tag] ?? ACCENT }}
                        >
                          Read Full Article <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Glass>
              </motion.div>
            )}

            {/* Grid of Articles */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {rest.map((post) => {
                const c = TAG_COLORS[post.tag] ?? TEAL;
                return (
                  <motion.div key={post.id} variants={fadeInUp}>
                    <Glass hoverEffect className="rounded-3xl p-6 flex flex-col justify-between h-full border border-teal-900/10 shadow-lg">
                      <div>
                        <div
                          className="w-full h-32 rounded-2xl flex items-center justify-center mb-5"
                          style={{ background: `linear-gradient(135deg, ${c}15, ${c}05)`, border: `1px solid ${c}20` }}
                        >
                          <BookOpen size={32} style={{ color: c, opacity: 0.5 }} />
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3 inline-block"
                          style={{ background: `${c}15`, color: c }}
                        >
                          {post.tag}
                        </span>
                        <h3 className="text-lg font-bold mb-3 leading-snug" style={{ color: TEAL }}>{post.title}</h3>
                        <p className="text-xs leading-relaxed mb-6 line-clamp-3" style={{ color: MUTED }}>{post.body}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t text-xs font-semibold" style={{ borderColor: 'rgba(8, 38, 54, 0.08)', color: MUTED }}>
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.read}</span>
                        <button className="flex items-center gap-1 font-extrabold" style={{ color: c }}>
                          Read <ChevronRight size={13} />
                        </button>
                      </div>
                    </Glass>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER SUBSCRIPTION ── */}
      <section
        className="relative overflow-hidden py-24 px-6 md:px-14"
        style={{ background: 'linear-gradient(145deg, #041824 0%, #082636 45%, #0d4e66 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="av-pulse-glow"
            style={{
              position: 'absolute', top: -60, left: '15%', width: 480, height: 400,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.30) 0%, transparent 72%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: MINT_LIGHT }}
          >
            <Send size={26} />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
            Subscribe to Market Insights
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
            Get strategic outsourcing tips, Virtual CFO guides, and operational intelligence delivered bi-weekly.
          </p>

          {subscribed ? (
            <div
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold"
              style={{ background: 'rgba(77, 232, 184, 0.15)', color: MINT_LIGHT, border: '1px solid rgba(77, 232, 184, 0.35)' }}
            >
              <CheckCircle2 size={18} /> You are subscribed! Check your inbox for our latest edition.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter business email..."
                className="flex-1 px-5 py-4 rounded-xl text-sm outline-none font-medium text-white"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <button
                type="submit"
                className="av-btn-glow px-8 py-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-xl"
                style={{ background: MINT_LIGHT, color: TEAL }}
              >
                Subscribe <ArrowRight size={15} />
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </>
  );
}
