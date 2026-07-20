import { useState } from 'react';
import {
  ArrowRight, ChevronRight, Globe, Zap, Award, Target, Users, Shield,
  BarChart3, HeadphonesIcon, Code2, FileText, MapPin, Clock, DollarSign, Send,
} from 'lucide-react';
import { TEAL, TEAL2, ACCENT, MUTED } from './shared';
import { Glass, Pill } from './shared';

const PERKS = [
  { Icon: Globe, title: '100% Remote', desc: "Work from anywhere in the world. We're a distributed team by design, not by default." },
  { Icon: Zap, title: 'Fast Growth', desc: 'Join a scale-up with a real career track — not a flat org where promotions take years.' },
  { Icon: Award, title: 'Learning Budget', desc: '$1,500/year to spend on courses, certifications, books, or conferences. Learning is core.' },
  { Icon: Target, title: 'Equity Access', desc: 'Long-term team members access profit-sharing and equity programmes as we grow.' },
  { Icon: Users, title: 'Diverse Team', desc: '40+ nationalities. A truly global team that brings broad perspective to every engagement.' },
  { Icon: Shield, title: 'Full Benefits', desc: 'Health cover, paid leave, parental leave, and mental health support — wherever you are.' },
];

const JOBS_DATA = [
  { Icon: BarChart3, color: ACCENT, dept: 'Finance', tags: ['FINANCE', 'FP&A', 'EXCEL'],
    title: 'Senior Financial Analyst', type: 'Full-time', loc: 'Remote (Global)', sal: '$65k – $90k',
    desc: "Join our Virtual CFO delivery team. You'll own financial models, client reporting packages, and monthly close processes for a portfolio of growth-stage companies." },
  { Icon: Users, color: TEAL2, dept: 'People', tags: ['HR', 'HRIS', 'RECRUITING'],
    title: 'HR Business Partner', type: 'Full-time', loc: 'Manila / Remote', sal: '$45k – $65k',
    desc: "Support our clients' people operations end-to-end — from talent acquisition through performance cycles — while working with a world-class remote HR team." },
  { Icon: HeadphonesIcon, color: '#9b59b6', dept: 'CX', tags: ['CX', 'SAAS', 'RETENTION'],
    title: 'Customer Success Manager', type: 'Full-time', loc: 'Remote (APAC)', sal: '$50k – $70k',
    desc: "Be the voice of our clients' customers. Drive onboarding, retention, and NPS improvements through proactive relationship management and data-driven insights." },
  { Icon: Code2, color: '#6b6bcc', dept: 'Tech', tags: ['REACT', 'NODE.JS', 'TYPESCRIPT'],
    title: 'Full-Stack Developer', type: 'Contract', loc: 'Remote (Global)', sal: '$80k – $120k',
    desc: "Build and maintain internal tooling and client-facing automation platforms. You'll ship high-quality code in a fast-paced, async-first engineering environment." },
  { Icon: FileText, color: '#c07a3a', dept: 'Operations', tags: ['OPS', 'PROCESS', 'DATA'],
    title: 'Operations Coordinator', type: 'Full-time', loc: 'Cebu / Remote', sal: '$30k – $45k',
    desc: 'Coordinate back-office workflows for our client portfolio. Attention to detail and a knack for process improvement are your superpowers in this role.' },
  { Icon: Shield, color: '#2980b9', dept: 'Legal', tags: ['AML', 'KYC', 'GDPR'],
    title: 'Compliance & Risk Analyst', type: 'Full-time', loc: 'Remote (UK/EU preferred)', sal: '$60k – $85k',
    desc: 'Keep our clients audit-ready and regulatorily compliant. You\'ll lead risk assessments, policy documentation, and liaise with external auditors.' },
];

export default function Careers() {
  const [activeDept, setActiveDept] = useState('All');
  const depts = ['All', 'Finance', 'People', 'CX', 'Tech', 'Ops', 'Legal'];
  const deptMap = { Operations: 'Ops' };
  const filtered = activeDept === 'All'
    ? JOBS_DATA
    : JOBS_DATA.filter((j) => (deptMap[j.dept] ?? j.dept) === activeDept || j.dept === activeDept);

  return (
    <>
      <section className="relative overflow-hidden py-24 px-8 md:px-14" style={{ background: TEAL }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -120, right: -80, width: 520, height: 460,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(25,164,138,0.35) 0%, transparent 72%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -80, left: -60, width: 440, height: 380,
              background: 'radial-gradient(ellipse at 48% 55%, rgba(107,107,204,0.26) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.05">
            <defs>
              <pattern id="av-dots-careers" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#av-dots-careers)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <Pill light>We're Hiring</Pill>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-5" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Build Your Career<br />
            <span style={{ color: '#4de8b8' }}>With Alta Venture</span>
          </h1>
          <p className="text-base leading-relaxed max-w-lg" style={{ color: 'rgba(255,255,255,0.58)' }}>
            Join a global team of professionals who are reshaping how businesses grow. Remote-first, ambition-driven, and
            genuinely great to work with.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 px-8 md:px-14" style={{ background: '#f6fef9' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -100, left: -80, width: 460, height: 400,
              background: 'radial-gradient(ellipse at 40% 40%, #c4f5e4 0%, transparent 68%)',
              filter: 'blur(60px)', opacity: 0.60,
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <Pill>Why Alta Venture</Pill>
          <h2 className="text-3xl font-extrabold mb-10" style={{ color: TEAL, letterSpacing: '-0.02em' }}>
            Life at Alta Venture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PERKS.map(({ Icon, title, desc }) => (
              <Glass key={title} className="rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TEAL}0e`, color: TEAL }}>
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: TEAL }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{desc}</p>
              </Glass>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 px-8 md:px-14" style={{ background: '#edf8f3' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -70, right: -50, width: 380, height: 340,
              background: 'radial-gradient(ellipse at 50% 45%, #c4ccf8 0%, transparent 70%)',
              filter: 'blur(72px)', opacity: 0.45,
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <Pill>Open Positions</Pill>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-extrabold" style={{ color: TEAL, letterSpacing: '-0.02em' }}>
              Current Openings
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {depts.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200"
                  style={{
                    background: activeDept === dept ? TEAL : 'rgba(255,255,255,0.65)',
                    color: activeDept === dept ? '#fff' : TEAL,
                    border: '1px solid rgba(255,255,255,1)',
                    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filtered.map((job) => {
              const c = job.color;
              const JobIcon = job.Icon;
              return (
                <div
                  key={job.title}
                  className="rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 hover:-translate-y-0.5 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,1)',
                    boxShadow: '0 4px 20px rgba(13,61,82,0.05)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c}14`, color: c, border: `1.5px solid ${c}28` }}
                  >
                    <JobIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      {job.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ background: `${c}10`, color: c }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-base font-bold mb-0.5" style={{ color: TEAL }}>{job.title}</h3>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: MUTED }}>{job.desc}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: MUTED }}>
                        <MapPin size={10} /> {job.loc}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: MUTED }}>
                        <Clock size={10} /> {job.type}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: MUTED }}>
                        <DollarSign size={10} /> {job.sal}
                      </span>
                    </div>
                  </div>
                  <button
                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: TEAL, color: '#fff', boxShadow: `0 4px 14px ${TEAL}28` }}
                  >
                    Apply <ChevronRight size={12} />
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: MUTED }}>No openings in this department right now.</p>
                <button onClick={() => setActiveDept('All')} className="mt-3 text-xs font-bold underline" style={{ color: TEAL }}>
                  View all openings
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden py-20 px-8 md:px-14"
        style={{ background: 'linear-gradient(145deg, #082636 0%, #0d3d52 45%, #0c4236 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -60, left: '18%', width: 460, height: 380,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(25,164,138,0.25) 0%, transparent 72%)',
              filter: 'blur(80px)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center gap-5">
          <div
            className="p-3.5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <Send size={22} style={{ color: 'rgba(255,255,255,0.85)' }} />
          </div>
          <h2 className="text-3xl font-extrabold" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Don't see your role?
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
            We're always looking for exceptional people. Send us your CV and we'll keep you in mind for future
            opportunities that match your skills.
          </p>
          <button
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{ background: '#4de8b8', color: TEAL, boxShadow: '0 6px 28px rgba(77,232,184,0.28)' }}
          >
            Send an Open Application <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </>
  );
}
