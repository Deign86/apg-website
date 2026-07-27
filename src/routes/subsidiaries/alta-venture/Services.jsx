import {
  ArrowRight, BarChart3, Users, Code2, HeadphonesIcon, FileText, Shield,
} from 'lucide-react';
import { TEAL, TEAL2, ACCENT, MUTED } from './shared';
import { Glass, Pill } from './shared';

const SERVICES_DATA = [
  {
    Icon: BarChart3, color: ACCENT, tag: 'FINANCE', title: 'Virtual CFO Services',
    desc: 'Strategic financial leadership without the full-time cost. From cash flow management to investor reporting and board-level advisory.',
    points: ['Financial planning & analysis', 'Cash flow management', 'Investor-ready reporting', 'KPI dashboard setup', 'Budgeting & forecasting', 'M&A due diligence support'],
  },
  {
    Icon: Users, color: TEAL2, tag: 'PEOPLE', title: 'Talent & HR Outsourcing',
    desc: 'Build world-class teams faster. We handle sourcing, vetting, onboarding, and ongoing HR administration so you can focus on leadership.',
    points: ['Talent acquisition', 'Onboarding workflows', 'Payroll processing', 'Performance management', 'HR compliance', 'Benefits administration'],
  },
  {
    Icon: Code2, color: '#6b6bcc', tag: 'TECH', title: 'Technology & IT Support',
    desc: 'From helpdesk to infrastructure, our tech specialists keep your systems running, secure, and future-ready.',
    points: ['IT helpdesk (24/7 option)', 'Cloud infrastructure', 'Cybersecurity monitoring', 'Software development', 'QA & testing', 'System integrations'],
  },
  {
    Icon: HeadphonesIcon, color: '#c07a3a', tag: 'CX', title: 'Customer Experience',
    desc: 'Delight your customers at every touchpoint. Omnichannel support that feels like your own in-house team.',
    points: ['Live chat & email support', 'Phone support', 'Social media moderation', 'Customer success programs', 'NPS tracking', 'Escalation management'],
  },
  {
    Icon: FileText, color: '#9b59b6', tag: 'OPS', title: 'Back-Office Operations',
    desc: 'Streamline the work behind the scenes. Data entry, document management, and process automation handled with precision.',
    points: ['Data entry & cleansing', 'Document management', 'Accounts payable/receivable', 'Compliance filing', 'Research & analysis', 'Workflow automation'],
  },
  {
    Icon: Shield, color: '#2980b9', tag: 'LEGAL', title: 'Risk & Compliance',
    desc: 'Stay ahead of regulatory changes. Our compliance experts protect your business and keep you audit-ready at all times.',
    points: ['Regulatory compliance', 'AML & KYC processes', 'Risk assessment', 'Policy documentation', 'Internal audit support', 'GDPR / data privacy'],
  },
];

export default function Services() {
  return (
    <>
      <section className="relative overflow-hidden py-20 px-8 md:px-14" style={{ background: '#e2f8f0' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -90, right: -50, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 50% 40%, #74e87a 0%, #c8f5b0 52%, transparent 76%)',
              filter: 'blur(72px)', opacity: 0.65,
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -70, left: -50, width: 420, height: 360,
              background: 'radial-gradient(ellipse at 48% 56%, #b8c8f8 0%, transparent 70%)',
              filter: 'blur(80px)', opacity: 0.45,
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <Pill>What We Offer</Pill>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5" style={{ color: TEAL, letterSpacing: '-0.02em' }}>
            Our Services
          </h1>
          <p className="text-base leading-relaxed max-w-lg mx-auto" style={{ color: MUTED }}>
            End-to-end outsourcing solutions designed to give your business a competitive edge — from finance to
            customer experience and everything in between.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 px-8 md:px-14" style={{ background: '#f6fef9' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -140, left: -100, width: 520, height: 460,
              background: 'radial-gradient(ellipse at 40% 40%, #c4f5e4 0%, transparent 68%)',
              filter: 'blur(60px)', opacity: 0.55,
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES_DATA.map(({ Icon, color, tag, title, desc, points }) => (
            <Glass
              key={title}
              className="rounded-3xl p-7 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}14`, color }}
                >
                  <Icon size={20} />
                </div>
                <span
                  className="text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase"
                  style={{ background: `${color}12`, color }}
                >
                  {tag}
                </span>
              </div>
              <h3 className="text-base font-bold leading-snug" style={{ color: TEAL }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{desc}</p>
              <ul className="space-y-1.5 mt-auto pt-3 border-t" style={{ borderColor: `${TEAL}08` }}>
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[11px]" style={{ color: MUTED }}>{p}</span>
                  </li>
                ))}
              </ul>
              <button
                className="flex items-center gap-1 text-xs font-bold self-start mt-1 hover:gap-2 transition-all"
                style={{ color }}
              >
                Learn more <ArrowRight size={11} />
              </button>
            </Glass>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-24 px-8 md:px-14" style={{ background: TEAL }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -100, right: -60, width: 500, height: 440,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(25,164,138,0.28) 0%, transparent 72%)',
              filter: 'blur(60px)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.05">
            <defs>
              <pattern id="av-dots-services" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#av-dots-services)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <Pill light>How It Works</Pill>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-14" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
            From Discovery to Delivery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n: '01', title: 'Discovery Call', desc: 'We learn about your business, pain points, and goals in a free 30-min consultation.' },
              { n: '02', title: 'Solution Design', desc: 'Our team crafts a tailored outsourcing blueprint aligned to your budget and timeline.' },
              { n: '03', title: 'Team Onboarding', desc: 'We deploy and integrate your dedicated team within days — not weeks.' },
              { n: '04', title: 'Ongoing Optimisation', desc: 'Quarterly reviews, SLA reporting, and continuous improvement built in.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col gap-3">
                <span className="text-5xl font-black leading-none" style={{ color: 'rgba(255,255,255,0.09)' }}>{n}</span>
                <h3 className="text-sm font-bold" style={{ color: '#fff' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-20 px-8 md:px-14 flex flex-col items-center text-center"
        style={{ background: '#f0f2fc' }}
      >
        <h2 className="text-3xl font-extrabold mb-3" style={{ color: TEAL }}>
          Not sure which service fits?
        </h2>
        <p className="text-sm mb-8 max-w-md" style={{ color: MUTED }}>
          Book a free discovery call and we'll map the perfect solution for your business stage and goals.
        </p>
        <button
          className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: TEAL, color: '#fff', boxShadow: `0 6px 24px ${TEAL}30` }}
        >
          Let's get it started <ArrowRight size={14} />
        </button>
      </section>
    </>
  );
}
