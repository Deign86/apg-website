import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, BarChart3, Users, Code2, HeadphonesIcon, FileText, Shield,
  CheckCircle2, Sparkles, HelpCircle
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

const SERVICES_DATA = [
  {
    id: 'cfo',
    Icon: BarChart3, color: ACCENT, tag: 'FINANCE', title: 'Virtual CFO Services',
    desc: 'Strategic financial leadership without the full-time executive cost. From cash flow management to investor reporting and board-level advisory.',
    points: ['Financial planning & analysis', 'Cash flow management', 'Investor-ready reporting', 'KPI dashboard setup', 'Budgeting & forecasting', 'M&A due diligence support'],
  },
  {
    id: 'people',
    Icon: Users, color: TEAL2, tag: 'PEOPLE', title: 'Talent & HR Outsourcing',
    desc: 'Build world-class teams faster. We handle sourcing, vetting, onboarding, and ongoing HR administration so you can focus on core vision.',
    points: ['Executive talent acquisition', 'Onboarding workflows', 'Global payroll processing', 'Performance management', 'HR compliance', 'Benefits administration'],
  },
  {
    id: 'tech',
    Icon: Code2, color: '#4338ca', tag: 'TECH', title: 'Technology & IT Support',
    desc: 'From helpdesk to cloud infrastructure, our technology specialists keep your operations secure, resilient, and ready to scale.',
    points: ['24/7 IT helpdesk support', 'Cloud infrastructure setup', 'Cybersecurity monitoring', 'Software development', 'QA & test automation', 'System integrations'],
  },
  {
    id: 'cx',
    Icon: HeadphonesIcon, color: '#d97706', tag: 'CX', title: 'Customer Experience Operations',
    desc: 'Delight your customers at every touchpoint. Omnichannel support that feels like an extension of your own in-house leadership.',
    points: ['Live chat & email support', '24/7 phone desk', 'Social media moderation', 'Customer success programs', 'NPS & CSAT tracking', 'Escalation management'],
  },
  {
    id: 'ops',
    Icon: FileText, color: '#7c3aed', tag: 'OPS', title: 'Back-Office Operations',
    desc: 'Streamline essential administrative functions. Data management, invoicing, document workflow, and process automation executed with precision.',
    points: ['Data entry & cleansing', 'Document management', 'Accounts payable/receivable', 'Compliance filing', 'Research & analysis', 'Workflow automation'],
  },
  {
    id: 'risk',
    Icon: Shield, color: '#0284c7', tag: 'LEGAL', title: 'Risk & Compliance Management',
    desc: 'Stay ahead of evolving regulatory standards. Our compliance specialists protect your business reputation and keep you audit-ready.',
    points: ['Regulatory compliance audit', 'AML & KYC verification', 'Risk assessment frameworks', 'Policy documentation', 'Internal audit support', 'GDPR & data privacy'],
  },
];

export default function Services() {
  const [selectedTag, setSelectedTag] = useState('ALL');
  const tags = ['ALL', 'FINANCE', 'PEOPLE', 'TECH', 'CX', 'OPS', 'LEGAL'];

  const filteredServices = selectedTag === 'ALL'
    ? SERVICES_DATA
    : SERVICES_DATA.filter(s => s.tag === selectedTag);

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #e2f8f0 0%, #f6fef9 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -90, right: -50, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.40) 0%, transparent 70%)',
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
            <Pill>What We Offer</Pill>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
            style={{ color: TEAL }}
          >
            Enterprise-Grade <span style={{ color: ACCENT }}>Outsourcing Solutions</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
            style={{ color: MUTED }}
          >
            End-to-end outsourcing solutions designed to eliminate operational bottlenecks, reduce fixed overhead, and drive sustainable market growth.
          </motion.p>
        </motion.div>
      </section>

      {/* ── FILTER & SERVICE GRID ── */}
      <section className="relative py-16 px-6 md:px-14" style={{ background: 'linear-gradient(150deg, #f0fdf8 0%, #f6fef9 50%, #fdf0ff 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Mint-teal orb top-left */}
          <div style={{ position: 'absolute', top: -140, left: -80, width: 550, height: 500, background: 'radial-gradient(ellipse at 40% 40%, rgba(77,232,184,0.25) 0%, rgba(20,146,123,0.10) 45%, transparent 70%)', filter: 'blur(70px)' }} />
          {/* Soft violet orb top-right */}
          <div style={{ position: 'absolute', top: -80, right: -60, width: 460, height: 400, background: 'radial-gradient(ellipse at 60% 40%, rgba(167,139,250,0.20) 0%, rgba(124,58,237,0.08) 50%, transparent 72%)', filter: 'blur(68px)' }} />
          {/* Warm amber bottom-centre */}
          <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 420, height: 360, background: 'radial-gradient(ellipse at 50% 60%, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.08) 50%, transparent 72%)', filter: 'blur(72px)' }} />
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.03"><defs><pattern id="svc-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#082636" /></pattern></defs><rect width="100%" height="100%" fill="url(#svc-dots)" /></svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer border ${
                  selectedTag === tag
                    ? 'shadow-md scale-105'
                    : 'hover:bg-white/80'
                }`}
                style={{
                  background: selectedTag === tag ? TEAL : 'rgba(255,255,255,0.75)',
                  color: selectedTag === tag ? '#ffffff' : TEAL,
                  borderColor: selectedTag === tag ? TEAL : 'rgba(8, 38, 54, 0.1)',
                }}
              >
                {tag === 'ALL' ? 'All Services' : tag}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div
            key={selectedTag}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={
              filteredServices.length === 1
                ? 'max-w-2xl mx-auto grid grid-cols-1 gap-6'
                : filteredServices.length === 2
                ? 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            }
          >
            {filteredServices.map(({ id, Icon, color, tag, title, desc, points }) => (
              <motion.div key={id} variants={fadeInUp}>
                <Glass
                  hoverEffect
                  className="rounded-3xl p-8 flex flex-col justify-between h-full border border-teal-900/10 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${color}18`, color }}
                      >
                        <Icon size={24} />
                      </div>
                      <span
                        className="text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase"
                        style={{ background: `${color}14`, color }}
                      >
                        {tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold mb-3" style={{ color: TEAL }}>{title}</h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: MUTED }}>{desc}</p>

                    <ul className="space-y-2.5 pt-4 border-t" style={{ borderColor: 'rgba(8, 38, 54, 0.08)' }}>
                      {points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="flex-shrink-0" style={{ color }} />
                          <span className="text-xs font-semibold" style={{ color: TEAL }}>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/subsidiaries/alta-venture/inquire"
                    className="mt-8 flex items-center gap-1.5 text-xs font-extrabold hover:gap-3 transition-all self-start"
                    style={{ color }}
                  >
                    Inquire About This Service <ArrowRight size={14} />
                  </Link>
                </Glass>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── EXECUTION METHODOLOGY ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: TEAL }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -100, right: -60, width: 500, height: 440,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.25) 0%, transparent 72%)',
              filter: 'blur(70px)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Pill light>How It Works</Pill>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: '#ffffff' }}>
              From Discovery to Seamless Delivery
            </h2>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              A proven 4-stage deployment methodology tailored for zero friction and immediate ROI.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { n: '01', title: 'Discovery Call', desc: 'We analyze your operational needs, pain points, and growth goals in a free 30-minute consultation.' },
              { n: '02', title: 'Solution Blueprint', desc: 'Our team crafts a tailored outsourcing blueprint aligned to your budget, KPIs, and security standards.' },
              { n: '03', title: 'Team Onboarding', desc: 'We deploy and integrate your dedicated domain specialists into your daily workflows within days.' },
              { n: '04', title: 'Continuous Scaling', desc: 'Quarterly reviews, SLA reporting, and continuous performance optimization built into every account.' },
            ].map(({ n, title, desc }) => (
              <motion.div key={n} variants={fadeInUp}>
                <div className="av-dark-card rounded-3xl p-8 h-full flex flex-col justify-between">
                  <div>
                    <span className="text-4xl font-extrabold block mb-4" style={{ color: MINT_LIGHT }}>{n}</span>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#ffffff' }}>{title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CONSULTATION CTA ── */}
      <section className="relative overflow-hidden py-20 px-6 md:px-14 flex flex-col items-center text-center" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f3f8f5 50%, #fff8f0 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Periwinkle orb left */}
          <div style={{ position: 'absolute', top: -80, left: -40, width: 420, height: 380, background: 'radial-gradient(ellipse at 40% 40%, rgba(99,102,241,0.20) 0%, rgba(139,92,246,0.08) 50%, transparent 70%)', filter: 'blur(66px)' }} />
          {/* Peach right */}
          <div style={{ position: 'absolute', bottom: -50, right: -50, width: 400, height: 360, background: 'radial-gradient(ellipse at 60% 60%, rgba(251,146,60,0.18) 0%, rgba(249,115,22,0.08) 50%, transparent 72%)', filter: 'blur(68px)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(8, 38, 54, 0.08)', color: TEAL }}
          >
            <HelpCircle size={28} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: TEAL }}>
            Not sure which service fits your current stage?
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: MUTED }}>
            Speak directly with our solutions architects. We will map out the exact capacity, talent, and operational framework for your goals.
          </p>
          <Link
            to="/subsidiaries/alta-venture/inquire"
            className="av-btn-glow inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-extrabold transition-all hover:scale-105 shadow-xl"
            style={{ background: TEAL, color: '#ffffff', boxShadow: `0 6px 24px ${TEAL}35` }}
          >
            Book Free Discovery Call <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
