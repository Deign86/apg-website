import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteNavigate } from '../../hooks/useSiteNavigate';
import { useNewsletter } from '../../hooks/useNewsletter';
import { NavTab } from '../../types';
import { useSiteSettings, mainSocials } from '../../hooks/useSiteSettings';
import { SocialIcon } from './SocialIcon';
import { MapPin, Phone, Mail, Clock, ChevronUp, Send, Check } from 'lucide-react';

const logoNavbar = '/assets/images/logos/logo-navbar-96.webp'; // 2x of logo-navbar.jpg's 48px height
const apgLogo = '/assets/images/apgopc.png';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
  onOpenInquire: () => void;
}

const SUBSIDIARIES = [
  { name: 'Alpha Premier Realty', path: '/subsidiaries/realty' },
  { name: 'Luxe Prime Realty', path: '/subsidiaries/luxe-prime' },
  { name: 'Dynamic Tree Multimedia', path: '/subsidiaries/dynamic-tree' },
  { name: 'Swift Clear Sanitation', path: '/subsidiaries/swiftclear' },
  { name: 'Alta Venture Outsource', path: '/subsidiaries/alta-venture' },
  { name: 'Alpha Premier Construction', path: '/subsidiaries/construction' },
  { name: '88 Prime Trading & Virtual Office', path: '/subsidiaries/88prime' },
];

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenInquire }) => {
  const navigate = useSiteNavigate();
  const newsletter = useNewsletter('corporate');
  const settings = useSiteSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B0905] text-neutral-300 border-t border-[#D4AF37]/30 pt-16 pb-24 relative z-10 overflow-hidden font-sans">
      {/* Subtle Gold Background Radial Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-10 pb-12 border-b border-[#D4AF37]/20">
          
          {/* Column 1: Brand & Bio & Social Ring Buttons */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center">
              <img 
                src={logoNavbar || apgLogo}
                alt="Alpha Premier Group"
                width={320}
                height={96}
                loading="lazy"
                decoding="async"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== apgLogo && apgLogo) {
                    target.src = apgLogo;
                  } else {
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-footer-logo')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-footer-logo flex flex-col';
                      fallback.innerHTML = `<span class="text-2xl font-black tracking-[0.2em] text-[#E2B857]">ALPHA</span><span class="text-xs font-semibold tracking-[0.25em] text-neutral-400 uppercase">PREMIER GROUP OF COMPANIES</span>`;
                      parent.appendChild(fallback);
                    }
                  }
                }}
              />
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed font-normal pr-2">
              A diversified corporate conglomerate connecting ambition with opportunity across real estate investment, commercial construction, facility sanitation, creative media, BPO outsourcing, and enterprise trading.
            </p>

            {/* Social Ring Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <h4 className="text-xs tracking-[0.25em] uppercase text-neutral-400 font-bold">
                FOLLOW OUR NETWORK
              </h4>
              <div className="flex items-center gap-3">
                {mainSocials(settings).map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="size-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-200"
                  >
                    <SocialIcon platform={s.key} className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs tracking-[0.25em] uppercase text-[#E2B857] font-bold">
              QUICK LINKS
            </h4>
            <nav className="flex flex-col md:gap-3 text-xs text-neutral-400 font-medium">
              <button 
                onClick={() => { onNavigate('home'); scrollToTop(); }}
                className="text-left py-3 md:py-0 hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Home Overview
              </button>
              <button 
                onClick={() => { onNavigate('enterprises'); scrollToTop(); }}
                className="text-left py-3 md:py-0 hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Enterprises Directory
              </button>
              <button 
                onClick={() => { navigate('/properties'); scrollToTop(); }}
                className="text-left py-3 md:py-0 hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Properties & Real Estate
              </button>
              <button 
                onClick={() => { onNavigate('blogs'); scrollToTop(); }}
                className="text-left py-3 md:py-0 hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Blogs & Newsroom
              </button>
              <button 
                onClick={() => { onNavigate('careers'); scrollToTop(); }}
                className="text-left py-3 md:py-0 hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Careers & Opportunities
              </button>
              <button
                onClick={() => { navigate('/contact'); scrollToTop(); }}
                className="text-left py-3 md:py-0 hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Contact Us
              </button>
              <button 
                onClick={() => { onOpenInquire(); }}
                className="text-left py-3 md:py-0 text-[#E2B857] hover:underline transition-colors w-fit font-bold cursor-pointer"
              >
                Schedule Consultation →
              </button>
            </nav>
          </div>

          {/* Column 3: Our Enterprises (Verified Active Subsidiaries) */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs tracking-[0.25em] uppercase text-[#E2B857] font-bold">
              OUR ENTERPRISES
            </h4>
            <nav className="flex flex-col md:gap-2.5 text-xs text-neutral-400">
              {SUBSIDIARIES.map((sub) => (
                <button
                  key={sub.path}
                  onClick={() => {
                    navigate(sub.path);
                    scrollToTop();
                  }}
                  className="text-left py-3 md:py-0 hover:text-[#E2B857] transition-colors w-fit flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#D4AF37]/50 text-xs">›</span>
                  <span>{sub.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h4 className="text-xs tracking-[0.25em] uppercase text-[#E2B857] font-bold">
                GET IN TOUCH
              </h4>
              <div className="flex flex-col gap-3 text-xs text-neutral-400 font-normal">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {settings.address_short as string}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{settings.phone as string}</span>
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="min-w-0 wrap-anywhere">{settings.email as string}</span>
                </div>
                {(settings.business_hours as string).trim() !== '' && (
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="leading-relaxed whitespace-pre-line">{settings.business_hours as string}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="flex flex-col gap-3 pt-1 border-t border-[#D4AF37]/15">
              <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-300 font-bold">
                NEWSLETTER
              </h4>
              <form onSubmit={newsletter.subscribe} className="flex gap-2">
                <input
                  {...newsletter.inputProps}
                  aria-label="Your email address"
                  placeholder="Your email"
                  value={newsletter.email}
                  onChange={(e) => newsletter.setEmail(e.target.value)}
                  className="flex-1 min-w-0 text-xs bg-neutral-900/80 border border-[#D4AF37]/30 rounded-full px-4 py-2.5 text-white placeholder-neutral-400 focus:outline-none focus:border-[#D4AF37] transition-all"
                />
                <button
                  type="submit"
                  disabled={newsletter.status === 'sending'}
                  className="shrink-0 bg-[#D4AF37] text-neutral-950 rounded-full size-10 flex items-center justify-center hover:bg-[#FFF3D1] hover:scale-105 transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60"
                  aria-label="Subscribe"
                >
                  {newsletter.status === 'done' ? <Check className="w-4 h-4 text-emerald-800" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
              {newsletter.status === 'done' && (
                <span role="status" className="text-xs text-[#D4AF37] font-semibold tracking-wide">
                  ✓ Subscribed to APG Corporate Briefings. Check your inbox for a confirmation.
                </span>
              )}
              {newsletter.status === 'error' && (
                <span id={newsletter.errorId} role="alert" className="text-xs text-red-400 font-semibold tracking-wide">{newsletter.error}</span>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© 2026 Alpha Premier Group of Companies. All rights reserved.</p>
          
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="py-3 hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="py-3 hover:text-neutral-300 transition-colors">
              Terms of Use
            </Link>
            <button 
              onClick={scrollToTop} 
              className="size-10 flex items-center justify-center border border-[#D4AF37]/30 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all ml-2 cursor-pointer"
              title="Scroll to Top"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </div>
        </div>

      </div>

    </footer>
  );
};
