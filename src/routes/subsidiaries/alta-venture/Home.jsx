import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, BarChart3, CheckCircle2, Mail, Phone, Lightbulb,
  Users, Handshake, Target, Rocket, TrendingUp, Building2, ChevronDown,
  Cpu, Headphones, Sparkles, Plus, Minus, Layers, ShieldCheck, Zap
} from 'lucide-react';
import {
  TEAL, TEAL2, ACCENT, MINT_LIGHT, MUTED,
  heroBg, heroVideo, altaLogo
} from './shared';
import { Glass, Pill, ImageWithFallback } from './shared';

/* Animation variants */
const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

/* Interactive Services Data */
const SERVICE_CAPABILITIES = [
  {
    id: 'cfo',
    icon: BarChart3,
    badge: 'Strategic Finance',
    title: 'Virtual CFO & Financial Leadership',
    desc: 'Senior-level financial expertise to manage cash flow, optimize capital allocation, prepare investor reporting, and build financial models without the cost of a full-time executive.',
    benefits: ['Financial Modeling & Forecasting', 'Budgeting & Variance Analysis', 'Cap Table & Investor Readiness', 'Cash Flow Optimization']
  },
  {
    id: 'talent',
    icon: Users,
    badge: 'Human Capital',
    title: 'Fractional HR & Talent Solutions',
    desc: 'End-to-end talent acquisition, executive search, global payroll administration, and strategic workforce planning designed for hyper-growth teams.',
    benefits: ['Global Executive Search', 'Payroll & Compliance Management', 'Employee Onboarding & Retention', 'Performance Management']
  },
  {
    id: 'it',
    icon: Cpu,
    badge: 'Technology',
    title: 'Managed IT & Infrastructure',
    desc: 'Enterprise-grade IT operations, cybersecurity protocols, cloud infrastructure management, and tech stack optimization tailored to modern business demands.',
    benefits: ['24/7 Managed IT Service Desk', 'Cybersecurity & Data Governance', 'Cloud Infrastructure Optimization', 'SaaS Asset Management']
  },
  {
    id: 'cx',
    icon: Headphones,
    badge: 'Operations',
    title: 'Customer Experience & Back-Office',
    desc: 'Scalable customer support, omnichannel experience management, data processing, and back-office execution that elevate customer satisfaction.',
    benefits: ['Omnichannel Support Operations', 'Back-Office Data Management', 'Workflow & Process Automation', 'SLAs & Performance Analytics']
  }
];

/* Interactive About Pillars Data */
const ABOUT_PILLARS = [
  {
    id: 'collaboration',
    icon: Users,
    title: 'Expert Collaboration',
    tagline: 'Senior domain talent integrated directly into your operations',
    desc: 'Our hand-picked specialists integrate seamlessly with your core team, bringing executive capability and deep domain knowledge without the fixed overhead of permanent hires.',
    highlights: ['Zero onboarding friction', 'Direct Slack & Teams integration', 'Dedicated account leadership', 'Scalable team size on demand']
  },
  {
    id: 'partnership',
    icon: Handshake,
    title: 'Strategic Partnership',
    tagline: 'Deep alignment with your long-term business roadmap',
    desc: 'We do not just execute tasks — we align with your growth objectives. Every engagement is governed by shared KPIs, continuous SLA reporting, and mutual accountability.',
    highlights: ['Shared performance metrics', 'Quarterly strategic reviews', 'Proactive process optimization', 'Executive steering oversight']
  },
  {
    id: 'bespoke',
    icon: Target,
    title: 'Bespoke Delivery',
    tagline: 'Tailored operational frameworks calibrated to your exact scale',
    desc: 'No off-the-shelf templates. We design custom outsourcing operations specifically calibrated to your industry, stage, budget, and security standards.',
    highlights: ['Custom SLA frameworks', 'Flexible month-to-month terms', 'Enterprise security protocols', 'Multi-disciplinary coverage']
  }
];

/* Interactive Client Tiers Data */
const CLIENT_TIERS = [
  {
    id: 'startups',
    icon: Rocket,
    title: 'Start-ups & Pre-Seed',
    color: ACCENT,
    tagline: 'Move fast with institutional discipline',
    desc: 'Founders gain immediate access to fractional specialists, building strong financial and operational foundations from day one without burning capital.',
    deploymentTime: 'Deploy in 1-2 Weeks',
    points: [
      'Fractional CFO & accounting leadership from day one',
      'Flexible contracts that grow with funding rounds',
      'Investor-ready cap table & financial modeling',
      'Core administrative & ops infrastructure setup'
    ],
    stat: '3x Faster Scaling Speed'
  },
  {
    id: 'scaleups',
    icon: TrendingUp,
    title: 'Scale-ups & Growth',
    color: TEAL2,
    tagline: 'Scale operations without bottlenecks',
    desc: 'We plug operational gaps in rapidly expanding companies so momentum never slows and leadership stays laser-focused on core strategy.',
    deploymentTime: 'Seamless Integration',
    points: [
      'Rapid capacity expansion across key departments',
      'Process optimization & automated workflow design',
      'Senior domain specialists without fixed overhead',
      'Cross-border team integration & global payroll'
    ],
    stat: '45% Cost Reduction'
  },
  {
    id: 'enterprise',
    icon: Building2,
    title: 'Established Firms',
    color: '#3b5998',
    tagline: 'Efficiency, agility & digital transformation',
    desc: 'Mature enterprises partner with us to reduce operating costs, streamline complex back-office workflows, and access elite global talent.',
    deploymentTime: 'Enterprise SLA & NDA',
    points: [
      'High-impact offshore execution & back-office desk',
      'Specialized project & digital transformation teams',
      'Rigorous compliance, GDPR & data security controls',
      'Strategic cost reduction & workflow consolidation'
    ],
    stat: '99.9% Operational SLA'
  }
];

/* Frequently Asked Questions */
const FAQ_ITEMS = [
  {
    question: 'How quickly can Alta Venture deploy outsourcing teams or specialists?',
    answer: 'Engagements typically launch within 1 to 2 weeks following initial discovery and solution design. Our talent pool and structured onboarding allow for rapid, seamless integration into your current tools and workflows.'
  },
  {
    question: 'How does Alta Venture ensure data security and compliance?',
    answer: 'We enforce enterprise-grade security standards including strict NDAs, encrypted communications, secure access controls, and adherence to global compliance standards across all client engagements.'
  },
  {
    question: 'Can we scale our team up or down based on business seasonality?',
    answer: 'Yes. Our flexible engagement models are specifically engineered so startups and enterprises can adjust capacity and talent allocation seamlessly without rigid long-term lock-ins.'
  },
  {
    question: 'What sets Alta Venture apart from traditional BPO providers?',
    answer: 'Alta Venture is the professional solutions hub of Alpha Premier Group. Rather than offering commoditized labor, we provide high-touch fractional leadership, domain specialists, and strategic advisory dedicated to solving real business challenges.'
  }
];

export default function Home() {
  const [activeServiceTab, setActiveServiceTab] = useState('cfo');
  const [activeAboutPillar, setActiveAboutPillar] = useState('collaboration');
  const [activeClientTier, setActiveClientTier] = useState('startups');
  const [activeFaq, setActiveFaq] = useState(null);

  const selectedService = SERVICE_CAPABILITIES.find(s => s.id === activeServiceTab) || SERVICE_CAPABILITIES[0];
  const selectedPillar = ABOUT_PILLARS.find(p => p.id === activeAboutPillar) || ABOUT_PILLARS[0];
  const selectedTier = CLIENT_TIERS.find(t => t.id === activeClientTier) || CLIENT_TIERS[0];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <>
      {/* ── HERO SECTION WITH BACKGROUND VIDEO ── */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-[92vh] pt-12 pb-20">
        {/* Background visual layers */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
            <ImageWithFallback src={heroBg} alt="" className="w-full h-full object-cover" />
          </video>

          {/* Lighter, vibrant backdrop overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(215, 248, 238, 0.18) 0%, rgba(8, 38, 54, 0.45) 100%)'
            }}
          />
          
          {/* Animated decorative glow spheres */}
          <div
            className="av-pulse-glow"
            style={{
              position: 'absolute', top: '10%', left: '15%', width: 450, height: 450,
              background: 'radial-gradient(circle, rgba(77,232,184,0.35) 0%, transparent 70%)',
              filter: 'blur(70px)',
            }}
          />
          <div
            className="av-pulse-glow"
            style={{
              position: 'absolute', bottom: '15%', right: '10%', width: 500, height: 500,
              background: 'radial-gradient(circle, rgba(20,146,123,0.30) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animationDelay: '3s'
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 flex flex-col items-center max-w-5xl mx-auto px-6 text-center"
        >
          {/* Status Badge */}
          <motion.div variants={fadeInUp}>
            <Pill light>
              <Sparkles size={13} className="inline mr-1 text-[#4de8b8]" />
              Professional Solutions Hub
            </Pill>
          </motion.div>

          {/* Logo with clean drop-shadow halo filter (no white box) */}
          <motion.div variants={fadeInUp} className="mb-6">
            <ImageWithFallback
              src={altaLogo}
              alt="Alta Venture Outsourcing"
              className="av-animate-float"
              style={{
                width: 380,
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 18px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 24px rgba(77, 232, 184, 0.70))'
              }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.h1
            variants={fadeInUp}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-white"
          >
            Empowering Business Through <br className="hidden sm:inline" />
            <span className="relative inline-block" style={{ color: MINT_LIGHT }}>
              Comprehensive Outsourcing
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C40 2 120 2 199 5.5" stroke={MINT_LIGHT} strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg max-w-2xl leading-relaxed mb-9 font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.88)' }}
          >
            Delivering elite fractional talent, financial leadership, IT infrastructure, and customer operations that drive scalable growth for ambitious enterprises.
          </motion.p>

          {/* CTA Group */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/subsidiaries/alta-venture/inquire"
              className="av-btn-glow w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2"
              style={{ background: MINT_LIGHT, color: TEAL, boxShadow: `0 8px 28px rgba(77,232,184,0.35)` }}
            >
              Get Started Today <ArrowRight size={18} />
            </Link>

            <Link
              to="/subsidiaries/alta-venture/services"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 border text-white flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)'
              }}
            >
              Explore Solutions
            </Link>
          </motion.div>

          {/* Highlights bar */}
          <motion.div
            variants={fadeInUp}
            className="mt-14 pt-8 border-t grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl"
            style={{ borderColor: 'rgba(255, 255, 255, 0.18)' }}
          >
            {[
              { label: 'Client Satisfaction', value: '98%' },
              { label: 'Global Markets', value: '40+' },
              { label: 'Operational Uptime', value: '99.9%' },
              { label: 'Dedicated Experts', value: '500+' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-extrabold text-white">{value}</span>
                <span className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: MINT_LIGHT }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="relative z-10 mt-12 flex flex-col items-center gap-1 animate-bounce">
          <ChevronDown size={20} style={{ color: MINT_LIGHT }} />
        </div>
      </section>

      {/* ── YOUR BUSINESS GROWTH ENGINE (Interactive Tabs) ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: 'linear-gradient(160deg, #f0fdf8 0%, #f6fef9 50%, #f0f6ff 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Primary mint-teal orb top-left */}
          <div
            style={{
              position: 'absolute', top: -180, left: -120, width: 600, height: 560,
              background: 'radial-gradient(ellipse at 40% 40%, rgba(77,232,184,0.28) 0%, rgba(20,146,123,0.12) 45%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          {/* Warm amber accent splash bottom-right */}
          <div
            style={{
              position: 'absolute', bottom: -60, right: -80, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 60% 60%, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.10) 45%, transparent 70%)',
              filter: 'blur(72px)',
            }}
          />
          {/* Periwinkle cool mid accent */}
          <div
            style={{
              position: 'absolute', top: '35%', right: '15%', width: 320, height: 300,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.13) 0%, transparent 70%)',
              filter: 'blur(55px)',
            }}
          />
          {/* Subtle dot grid */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.035">
            <defs>
              <pattern id="av-dots-1" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="#082636" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#av-dots-1)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Pill>Solutions Hub</Pill>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: TEAL }}>
              Your Business <span style={{ color: ACCENT }}>Growth Engine</span>
            </h2>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: MUTED }}>
              Comprehensive professional outsourcing tailored to eliminate bottlenecks, elevate efficiency, and accelerate revenue.
            </p>
          </motion.div>

          {/* Interactive Service Selector Tabs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          >
            {SERVICE_CAPABILITIES.map((service) => {
              const Icon = service.icon;
              const isActive = activeServiceTab === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveServiceTab(service.id)}
                  className={`p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-all duration-300 cursor-pointer border ${
                    isActive ? 'shadow-lg scale-[1.02]' : 'hover:bg-white/80'
                  }`}
                  style={{
                    background: isActive ? TEAL : 'rgba(255,255,255,0.7)',
                    borderColor: isActive ? TEAL : 'rgba(8, 38, 54, 0.1)',
                    color: isActive ? '#ffffff' : TEAL
                  }}
                >
                  <Icon size={24} style={{ color: isActive ? MINT_LIGHT : ACCENT }} />
                  <span className="text-xs md:text-sm font-bold">{service.badge}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Dynamic Active Service Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedService.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <Glass className="rounded-3xl p-8 md:p-12 border shadow-xl">
                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                  <div className="max-w-2xl">
                    <div
                      className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold mb-4"
                      style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                    >
                      <Sparkles size={13} /> {selectedService.badge}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: TEAL }}>
                      {selectedService.title}
                    </h3>
                    <p className="text-base leading-relaxed mb-6" style={{ color: MUTED }}>
                      {selectedService.desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedService.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2.5">
                          <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: ACCENT }} />
                          <span className="text-sm font-semibold" style={{ color: TEAL }}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full lg:w-auto min-w-[240px]">
                    <Link
                      to="/subsidiaries/alta-venture/services"
                      className="w-full px-6 py-4 rounded-xl text-sm font-bold text-center transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
                      style={{ background: TEAL, color: '#ffffff' }}
                    >
                      Learn More <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/subsidiaries/alta-venture/inquire"
                      className="w-full px-6 py-4 rounded-xl text-sm font-bold text-center transition-all hover:bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2"
                      style={{ color: ACCENT }}
                    >
                      Book Consultation
                    </Link>
                  </div>
                </div>
              </Glass>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── ABOUT ALTA VENTURE (Redesigned Split Interactive Spotlight Module) ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: TEAL }}>
        {/* Background glow styling */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -150, right: -100, width: 560, height: 500,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.22) 0%, rgba(13,78,102,0.15) 45%, transparent 72%)',
              filter: 'blur(70px)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading, Mandatory Text & Pillar Nav Buttons */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="lg:col-span-6 flex flex-col"
            >
              <motion.div variants={fadeInUp}>
                <Pill light>About Us</Pill>
              </motion.div>
              
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight text-white"
              >
                About Alta Venture
              </motion.h2>

              {/* MANDATORY REQUIRED EXACT TEXT */}
              <motion.p
                variants={fadeInUp}
                className="text-base md:text-lg font-medium leading-relaxed mb-8"
                style={{ color: 'rgba(255, 255, 255, 0.92)' }}
              >
                Alta Venture is the Group's professional solutions hub, empowering entrepreneurs and businesses through comprehensive outsourcing services. We work with startups, scale-ups, and established firms to deliver real solutions to real business challenges.
              </motion.p>

              {/* Interactive Pillar Selector Tabs */}
              <motion.div variants={fadeInUp} className="flex flex-col gap-3">
                {ABOUT_PILLARS.map((pillar) => {
                  const Icon = pillar.icon;
                  const isActive = activeAboutPillar === pillar.id;

                  return (
                    <button
                      key={pillar.id}
                      onClick={() => setActiveAboutPillar(pillar.id)}
                      className={`p-4 rounded-2xl flex items-center gap-4 text-left transition-all duration-300 cursor-pointer border ${
                        isActive ? 'scale-[1.02] shadow-xl' : 'hover:bg-white/10'
                      }`}
                      style={{
                        background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isActive ? MINT_LIGHT : 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          background: isActive ? MINT_LIGHT : 'rgba(255, 255, 255, 0.12)',
                          color: isActive ? TEAL : '#ffffff'
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-white">{pillar.title}</h4>
                        <p className="text-xs opacity-75 text-white line-clamp-1">{pillar.tagline}</p>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-white transition-transform duration-300 ${isActive ? '-rotate-90 text-[#4de8b8]' : 'opacity-40'}`}
                      />
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Right Column: Dynamic Feature Spotlight Visual Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className="lg:col-span-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPillar.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="av-dark-card rounded-3xl p-8 md:p-10 border shadow-2xl relative overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.09)', borderColor: 'rgba(77, 232, 184, 0.35)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: 'rgba(77, 232, 184, 0.20)', color: MINT_LIGHT, border: '1px solid rgba(77, 232, 184, 0.40)' }}
                  >
                    <selectedPillar.icon size={28} />
                  </div>

                  <h3 className="text-2xl font-extrabold text-white mb-2">{selectedPillar.title}</h3>
                  <p className="text-xs font-bold uppercase tracking-wider mb-5 text-[#4de8b8]">{selectedPillar.tagline}</p>

                  <p className="text-sm leading-relaxed mb-8 text-white/90 font-medium">
                    {selectedPillar.desc}
                  </p>

                  <div className="space-y-3 pt-6 border-t border-white/15">
                    {selectedPillar.highlights.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#4de8b8]/20 text-[#4de8b8]">
                          <CheckCircle2 size={14} />
                        </div>
                        <span className="text-xs font-semibold text-white/95">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHO WE SERVE (Redesigned Interactive Segment Comparison Showcase) ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f3f8f5 40%, #fdf5f0 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Periwinkle / indigo orb top-right */}
          <div
            style={{
              position: 'absolute', top: -130, right: -70, width: 560, height: 480,
              background: 'radial-gradient(ellipse at 55% 45%, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.12) 45%, transparent 70%)',
              filter: 'blur(68px)',
            }}
          />
          {/* Coral / rose warm splash bottom-left */}
          <div
            style={{
              position: 'absolute', bottom: -80, left: -60, width: 500, height: 420,
              background: 'radial-gradient(ellipse at 40% 60%, rgba(251,113,133,0.16) 0%, rgba(244,63,94,0.08) 50%, transparent 72%)',
              filter: 'blur(72px)',
            }}
          />
          {/* Mint accent mid-page */}
          <div
            style={{
              position: 'absolute', top: '40%', left: '30%', width: 380, height: 320,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(77,232,184,0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          {/* Subtle diagonal stripes */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.03">
            <defs>
              <pattern id="av-stripe" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#082636" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#av-stripe)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <Pill>Client Partners</Pill>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: TEAL }}>
              Who We <span style={{ color: ACCENT }}>Serve</span>
            </h2>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: MUTED }}>
              Tailored professional solutions engineered for every growth stage of your business.
            </p>
          </motion.div>

          {/* Segment Selector Tabs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex items-center justify-center gap-3 flex-wrap mb-10"
          >
            {CLIENT_TIERS.map((tier) => {
              const Icon = tier.icon;
              const isActive = activeClientTier === tier.id;

              return (
                <button
                  key={tier.id}
                  onClick={() => setActiveClientTier(tier.id)}
                  className={`px-6 py-3.5 rounded-2xl flex items-center gap-2.5 text-sm font-extrabold transition-all duration-300 cursor-pointer border ${
                    isActive ? 'shadow-xl scale-105' : 'hover:bg-white/80'
                  }`}
                  style={{
                    background: isActive ? TEAL : 'rgba(255,255,255,0.70)',
                    color: isActive ? '#ffffff' : TEAL,
                    borderColor: isActive ? TEAL : 'rgba(8, 38, 54, 0.12)'
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? MINT_LIGHT : tier.color }} />
                  <span>{tier.title}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Dynamic Active Segment Showcase Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <Glass className="rounded-3xl p-8 md:p-12 border shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Persona & Overview */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: `${selectedTier.color}18`, border: `1.5px solid ${selectedTier.color}35`, color: selectedTier.color }}
                        >
                          <selectedTier.icon size={24} />
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: ACCENT }}>{selectedTier.deploymentTime}</span>
                          <h3 className="text-2xl font-extrabold" style={{ color: TEAL }}>{selectedTier.title}</h3>
                        </div>
                      </div>

                      <p className="text-xs font-extrabold uppercase tracking-wide mb-4" style={{ color: selectedTier.color }}>
                        {selectedTier.tagline}
                      </p>

                      <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: MUTED }}>
                        {selectedTier.desc}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: `${selectedTier.color}10`, borderColor: `${selectedTier.color}25` }}>
                      <span className="text-xs font-bold" style={{ color: TEAL }}>Key Performance Impact:</span>
                      <span className="text-sm font-extrabold" style={{ color: selectedTier.color }}>{selectedTier.stat}</span>
                    </div>
                  </div>

                  {/* Right Column: Capability Matrix Checklist & CTA */}
                  <div className="lg:col-span-7 flex flex-col justify-between h-full pl-0 lg:pl-6 lg:border-l" style={{ borderColor: 'rgba(8, 38, 54, 0.1)' }}>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider mb-4" style={{ color: TEAL }}>
                        Tailored Operational Framework:
                      </h4>

                      <div className="space-y-3.5 mb-8">
                        {selectedTier.points.map((pt) => (
                          <div key={pt} className="flex items-start gap-3 p-3.5 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(8, 38, 54, 0.06)' }}>
                            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" style={{ color: selectedTier.color }} />
                            <span className="text-sm font-semibold leading-snug" style={{ color: TEAL }}>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      to="/subsidiaries/alta-venture/inquire"
                      className="av-btn-glow flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-extrabold transition-all hover:scale-105 shadow-md self-start w-full sm:w-auto"
                      style={{ background: TEAL, color: '#ffffff' }}
                    >
                      Partner With Us For {selectedTier.title} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </Glass>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: 'linear-gradient(160deg, #fafff8 0%, #f6fef9 55%, #fff8f0 100%)' }}>
        {/* Colour decorations */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Mint glow top-right */}
          <div
            style={{
              position: 'absolute', top: -100, right: '5%', width: 420, height: 380,
              background: 'radial-gradient(ellipse at 55% 40%, rgba(77,232,184,0.22) 0%, rgba(20,146,123,0.10) 50%, transparent 72%)',
              filter: 'blur(65px)',
            }}
          />
          {/* Soft orange-peach splash bottom-left */}
          <div
            style={{
              position: 'absolute', bottom: -60, left: '8%', width: 380, height: 340,
              background: 'radial-gradient(ellipse at 40% 60%, rgba(251,146,60,0.16) 0%, rgba(249,115,22,0.08) 50%, transparent 72%)',
              filter: 'blur(68px)',
            }}
          />
          {/* Tiny dot grid */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.03">
            <defs>
              <pattern id="av-dots-2" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="#14927b" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#av-dots-2)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <Pill>Got Questions?</Pill>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4" style={{ color: TEAL }}>
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: MUTED }}>
              Everything you need to know about partnering with Alta Venture.
            </p>
          </motion.div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <motion.div
                  key={faq.question}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="rounded-2xl border transition-all duration-300 bg-white"
                  style={{ borderColor: isOpen ? ACCENT : 'rgba(8, 38, 54, 0.1)' }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-sm md:text-base cursor-pointer"
                    style={{ color: TEAL }}
                  >
                    <span>{faq.question}</span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                      style={{ background: isOpen ? `${ACCENT}15` : 'rgba(8, 38, 54, 0.05)', color: ACCENT }}
                    >
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6 text-sm leading-relaxed border-t pt-4"
                        style={{ color: MUTED, borderColor: 'rgba(8, 38, 54, 0.06)' }}
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL HERO CTA ── */}
      <section
        className="relative overflow-hidden py-24 px-6 md:px-14"
        style={{ background: 'linear-gradient(145deg, #041824 0%, #082636 45%, #0d4e66 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="av-pulse-glow"
            style={{
              position: 'absolute', top: -80, left: '12%', width: 580, height: 480,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.32) 0%, transparent 72%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: MINT_LIGHT }}
          >
            <Lightbulb size={28} />
          </div>

          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ color: '#ffffff', letterSpacing: '-0.02em' }}
          >
            Ready to Transform Your <br />
            <span style={{ color: MINT_LIGHT }}>Business Operations?</span>
          </h2>

          <p className="text-base md:text-lg leading-relaxed max-w-xl mb-10" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
            Partner with Alta Venture to unlock elite fractional leadership, operational efficiency, and rapid enterprise scaling.
          </p>

          <Link
            to="/subsidiaries/alta-venture/inquire"
            className="av-btn-glow flex items-center gap-3 px-10 py-5 rounded-2xl text-base font-extrabold transition-all duration-300 hover:scale-105 shadow-2xl mb-10"
            style={{ background: MINT_LIGHT, color: TEAL, boxShadow: '0 8px 32px rgba(77,232,184,0.35)' }}
          >
            Get Started Today <ArrowRight size={18} />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs md:text-sm" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            <div className="flex items-center gap-2">
              <Mail size={14} style={{ color: MINT_LIGHT }} /> hello@altaventureoutsourcing.com
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} style={{ color: MINT_LIGHT }} /> +1 (800) ALTA-BIZ
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
