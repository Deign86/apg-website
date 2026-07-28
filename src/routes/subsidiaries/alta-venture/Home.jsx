import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, CheckCircle2, Mail, Phone, Lightbulb,
  Users, Handshake, Target, Rocket, TrendingUp, Building2, ChevronDown,
} from 'lucide-react';
import {
  TEAL, TEAL2, ACCENT, MUTED,
  heroBg, altaLogo, logo88Prime, logoDynTree, logoSwiftClear,
  logoConstruct, logoLuxe, logoAlpha,
} from './shared';
import { Glass, Pill, ImageWithFallback } from './shared';

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-[92vh]">
        <div aria-hidden className="absolute inset-0">
          <ImageWithFallback src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(215,248,238,0.18)' }} />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 px-8 py-20 text-center">
          <ImageWithFallback
            src={altaLogo}
            alt="Alta Venture Outsourcing"
            style={{ width: 340, height: 'auto', objectFit: 'contain' }}
          />
          <Link
            to="/subsidiaries/alta-venture/services"
            className="px-8 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: TEAL, color: '#fff', boxShadow: `0 4px 18px ${TEAL}45` }}
          >
            Get Started
          </Link>
        </div>
        <div className="relative z-10 absolute bottom-8 flex flex-col items-center gap-1 animate-bounce">
          <ChevronDown size={16} style={{ color: MUTED }} />
        </div>
      </section>

      {/* ── YOUR BUSINESS GROWTH ENGINE ── */}
      <section className="relative overflow-hidden py-24 px-8 md:px-14" style={{ background: '#f6fef9' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -180, left: -120, width: 560, height: 520,
              background: 'radial-gradient(ellipse at 40% 40%, #c4f5e4 0%, transparent 68%)',
              filter: 'blur(64px)', opacity: 0.65,
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -100, right: -80, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 55% 55%, #a8f0c0 0%, transparent 70%)',
              filter: 'blur(72px)', opacity: 0.40,
            }}
          />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.025">
            <defs>
              <pattern id="av-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0d3d52" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#av-grid)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <Pill>What We Do</Pill>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <h2
              className="text-4xl md:text-5xl font-extrabold leading-tight"
              style={{ color: TEAL, letterSpacing: '-0.02em', maxWidth: 460 }}
            >
              Your Business<br />
              <span style={{ color: ACCENT }}>Growth Engine</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: MUTED }}>
              Empowering entrepreneurs and businesses with professional solutions that drive real growth.
            </p>
          </div>

          <Glass className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${TEAL}10` }}
            >
              <BarChart3 size={26} style={{ color: TEAL }} />
            </div>
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2.5"
                style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}28` }}
              >
                ✦ Featured Service
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: TEAL }}>Virtual CFO Services</h3>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Get the financial leadership your business needs without the full-time cost. Strategic financial
                planning, cash flow management, investor reporting, and growth advisory — tailored for startups and
                scaling companies.
              </p>
            </div>
            <Link
              to="/subsidiaries/alta-venture/services"
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold hover:-translate-y-0.5 hover:shadow-lg transition-all"
              style={{ background: TEAL, color: '#fff', boxShadow: `0 4px 18px ${TEAL}35` }}
            >
              Explore <ArrowRight size={14} />
            </Link>
          </Glass>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '500+', label: 'Clients served' },
              { value: '40+', label: 'Countries' },
              { value: '98%', label: 'Satisfaction rate' },
            ].map(({ value, label }) => (
              <Glass key={label} className="rounded-2xl px-5 py-4 text-center">
                <p className="text-2xl font-extrabold mb-1" style={{ color: TEAL }}>{value}</p>
                <p className="text-xs font-medium" style={{ color: MUTED }}>{label}</p>
              </Glass>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR SERVICES (client logo strip) ── */}
      <section className="relative overflow-hidden py-16 px-8 md:px-14" style={{ background: '#edf8f3' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -60, left: -80, width: 420, height: 360,
              background: 'radial-gradient(ellipse at 45% 45%, #b4efd0 0%, transparent 70%)',
              filter: 'blur(72px)', opacity: 0.50,
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -60, right: -60, width: 380, height: 320,
              background: 'radial-gradient(ellipse at 50% 55%, #c2caf8 0%, transparent 70%)',
              filter: 'blur(72px)', opacity: 0.40,
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-center mb-10"
            style={{ color: TEAL, letterSpacing: '-0.02em' }}
          >
            Our Services
          </h2>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { src: logo88Prime, alt: '88 Prime', dark: false },
              { src: logoDynTree, alt: 'Dynamic Tree Multimedia', dark: false },
              { src: logoSwiftClear, alt: 'SwiftClear Disinfecting', dark: false },
              { src: logoConstruct, alt: 'Alpha Premier Construction', dark: false },
              { src: logoLuxe, alt: 'Luxe Prime Realty', dark: false },
              { src: logoAlpha, alt: 'AlphaPremier Realty', dark: true },
            ].map(({ src, alt, dark }) => (
              <div
                key={alt}
                className="w-36 h-36 rounded-2xl flex items-center justify-center p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                style={{
                  background: dark ? '#111' : 'rgba(255,255,255,0.88)',
                  backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                  border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,1)',
                  boxShadow: dark
                    ? '0 4px 20px rgba(0,0,0,0.22)'
                    : '0 4px 20px rgba(13,61,82,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}
              >
                <ImageWithFallback src={src} alt={alt} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
          <p className="text-center text-xs font-medium mt-8" style={{ color: MUTED }}>
            Trusted by growing businesses across industries
          </p>
        </div>
      </section>

      {/* ── ABOUT ALTA VENTURE ── */}
      <section className="relative overflow-hidden py-24 px-8 md:px-14" style={{ background: TEAL }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -150, right: -100, width: 560, height: 500,
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(25,164,138,0.28) 0%, rgba(26,88,112,0.14) 45%, transparent 72%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -100, left: -80, width: 460, height: 400,
              background: 'radial-gradient(ellipse at 45% 55%, rgba(107,159,196,0.22) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.05">
            <defs>
              <pattern id="av-dots-about" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#av-dots-about)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <Pill light>About Us</Pill>
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
            About Alta Venture
          </h2>
          <p className="text-sm leading-relaxed mb-12 max-w-2xl" style={{ color: 'rgba(255,255,255,0.58)' }}>
            Alta Venture Outsourcing is a premier business process outsourcing firm dedicated to connecting
            forward-thinking companies with elite professional talent. We bridge the gap between ambition and
            execution — delivering measurable results across finance, operations, technology, and client experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                Icon: Users, title: 'Expert Collaboration',
                desc: 'Our hand-picked specialists integrate seamlessly with your team, bringing senior-level expertise to every engagement without the overhead of permanent hires.',
              },
              {
                Icon: Handshake, title: 'Strategic Partnership',
                desc: "We don't just deliver tasks — we align with your vision. Every engagement is built around long-term outcomes, accountability, and shared success metrics.",
              },
              {
                Icon: Target, title: 'Tailored Approach',
                desc: 'No two businesses are alike. We design bespoke solutions calibrated to your industry, growth stage, and operational needs — nothing off-the-shelf.',
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl p-7 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.13)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: '#fff' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE SERVE ── */}
      <section className="relative overflow-hidden py-24 px-8 md:px-14" style={{ background: '#f0f2fc' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -130, right: -70, width: 500, height: 440,
              background: 'radial-gradient(ellipse at 50% 45%, #c4ccf8 0%, #d8dcfa 35%, transparent 72%)',
              filter: 'blur(72px)', opacity: 0.70,
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -90, left: -60, width: 440, height: 360,
              background: 'radial-gradient(ellipse at 48% 55%, #a8f0c4 0%, #c4f8d8 38%, transparent 72%)',
              filter: 'blur(72px)', opacity: 0.50,
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <Pill>Clients</Pill>
          <h2 className="text-4xl font-extrabold mb-10" style={{ color: TEAL, letterSpacing: '-0.02em' }}>
            Who We Serve?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                Icon: Rocket, title: 'Start-ups', color: ACCENT,
                desc: 'From pre-seed through Series A, we give founders the operational backbone to move at startup speed without sacrificing financial discipline.',
                points: [
                  'Fractional specialists from day one', 'Flexible contracts that grow with you',
                  'Finance, ops & admin support', 'Investor-ready reporting & structure',
                ],
              },
              {
                Icon: TrendingUp, title: 'Scale-ups', color: TEAL2,
                desc: "When you're scaling fast, cracks appear. We plug those gaps precisely so your momentum never slows and your operations stay ahead of demand.",
                points: [
                  'Systems built for rapid growth', 'Process optimisation & automation',
                  'Senior talent without senior overhead', 'Cross-border expansion support',
                ],
              },
              {
                Icon: Building2, title: 'Established Firms', color: '#6b6bcc',
                desc: 'Mature organisations trust Alta Venture to unlock efficiency, reduce overhead, and bring fresh strategic thinking to entrenched challenges.',
                points: [
                  'Cost-efficient offshore capability', 'Specialised project-based support',
                  'Compliance & risk management', 'Digital transformation advisory',
                ],
              },
            ].map(({ Icon, title, color, desc, points }) => (
              <Glass key={title} className="rounded-3xl p-7 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.52)' }}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}12`, border: `1.5px solid ${color}40`, color }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-extrabold" style={{ color: TEAL }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                <ul className="space-y-2 mt-auto pt-3 border-t" style={{ borderColor: `${TEAL}0c` }}>
                  {points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color }} />
                      <span className="text-xs font-medium leading-snug" style={{ color: TEAL }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </Glass>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="relative overflow-hidden py-24 px-8 md:px-14"
        style={{ background: 'linear-gradient(145deg, #082636 0%, #0d3d52 45%, #0c4236 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -80, left: '12%', width: 580, height: 480,
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(25,164,138,0.32) 0%, rgba(25,164,138,0.08) 48%, transparent 72%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -60, right: -60, width: 420, height: 360,
              background: 'radial-gradient(ellipse at 50% 55%, rgba(107,107,204,0.26) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-7"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <Lightbulb size={26} style={{ color: 'rgba(255,255,255,0.88)' }} />
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-[44px] font-extrabold leading-tight mb-4"
            style={{ color: '#fff', letterSpacing: '-0.02em', maxWidth: 520 }}
          >
            Ready to Accelerate Your<br />
            <span style={{ color: '#4de8b8' }}>Business Growth?</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-md mb-9" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Let Alta Venture be your trusted partner in achieving business success. Join hundreds of companies already
            growing with us.
          </p>
          <Link
            to="/subsidiaries/alta-venture/inquire"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-2xl mb-8"
            style={{ background: '#4de8b8', color: TEAL, boxShadow: '0 6px 28px rgba(77,232,184,0.30)' }}
          >
            Get started today <ArrowRight size={15} />
          </Link>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
              <Mail size={12} /> hello@altaventureoutsourcing.com
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
              <Phone size={12} /> +1 (800) ALTA-BIZ
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
