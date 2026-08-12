import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavTab } from '../../types';
import { Facebook, Linkedin, Instagram, Mail, ChevronUp, ShieldCheck } from 'lucide-react';

const logo2025 = '/assets/images/logo2025.png';
const apgLogo = '/assets/images/apgopc.png';

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.77a4.85 4.85 0 01-1.02-.08z" />
    </svg>
  );
}

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
  const navigate = useNavigate();
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'sitemap' | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#100E0A] relative overflow-hidden">
      {/* Subtle Background Pattern Aligned with Dynamic Tree Footer */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-14 sm:pt-20 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-10 pb-12 border-b border-white/10">
          
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <button 
              onClick={() => { onNavigate('home'); scrollToTop(); }}
              className="w-fit text-left cursor-pointer"
            >
              <img
                src={logo2025 || apgLogo}
                alt="Alpha Premier Group"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== apgLogo && apgLogo) {
                    target.src = apgLogo;
                  }
                }}
              />
            </button>
            <p
              className="text-sm text-white/50 leading-relaxed max-w-xs"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
            >
              A diversified corporate conglomerate connecting ambition with opportunity across real estate investment, commercial construction, sanitation services, creative media, BPO solutions, and enterprise trading.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-5">
            <h4
              className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Quick Links
            </h4>
            <nav className="flex flex-col gap-3.5">
              <button
                onClick={() => { onNavigate('home'); scrollToTop(); }}
                className="text-sm text-white/60 hover:text-[#D4AF37] transition-colors w-fit font-medium text-left cursor-pointer"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Home Overview
              </button>
              <button
                onClick={() => { onNavigate('enterprises'); scrollToTop(); }}
                className="text-sm text-white/60 hover:text-[#D4AF37] transition-colors w-fit font-medium text-left cursor-pointer"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Enterprises Directory
              </button>
              <button
                onClick={() => { onNavigate('blogs'); scrollToTop(); }}
                className="text-sm text-white/60 hover:text-[#D4AF37] transition-colors w-fit font-medium text-left cursor-pointer"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Blogs & Newsroom
              </button>
              <button
                onClick={() => { onNavigate('careers'); scrollToTop(); }}
                className="text-sm text-white/60 hover:text-[#D4AF37] transition-colors w-fit font-medium text-left cursor-pointer"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Careers & Opportunities
              </button>
              <button
                onClick={onOpenInquire}
                className="text-sm text-[#D4AF37] hover:underline transition-colors w-fit font-semibold text-left cursor-pointer"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Schedule Consultation →
              </button>
            </nav>
          </div>

          {/* Our Enterprises */}
          <div className="flex flex-col gap-5">
            <h4
              className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Our Enterprises
            </h4>
            <nav className="flex flex-col gap-3">
              {SUBSIDIARIES.map((sub) => (
                <button
                  key={sub.path}
                  onClick={() => {
                    navigate(sub.path);
                    scrollToTop();
                  }}
                  className="text-sm text-white/60 hover:text-[#D4AF37] transition-colors w-fit text-left font-medium cursor-pointer"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {sub.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact + Newsletter & Socials */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3.5">
              <h4
                className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Get in Touch
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-white/60">
                <a
                  href="mailto:contact@alphapremier.com"
                  className="hover:text-[#D4AF37] transition-colors font-medium w-fit"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  contact@alphapremier.com
                </a>
                <a
                  href="tel:+639158889482"
                  className="hover:text-[#D4AF37] transition-colors font-medium w-fit"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  0915 888 9482 / (02) 8 650 2540
                </a>
                <p
                  className="text-white/50 leading-relaxed max-w-[220px]"
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 300 }}
                >
                  Unit 3104, Tektite East Tower, Ortigas Center, Pasig City
                </p>
              </div>
            </div>

            <div>
              <h4
                className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold mb-3.5"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Follow Us
              </h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Facebook size={16} />, label: 'Facebook', url: 'https://www.facebook.com/alphapremiergroup' },
                  { icon: <Instagram size={16} />, label: 'Instagram', url: 'https://www.instagram.com/alphapremiergroup/' },
                  { icon: <TikTokIcon size={16} />, label: 'TikTok', url: 'https://www.tiktok.com/@alphapremierr' },
                  { icon: <Linkedin size={16} />, label: 'LinkedIn', url: 'https://www.linkedin.com/company/alpha-premier-group' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-white/5 transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold mb-3.5"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Newsletter
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 min-w-0 text-sm bg-white/8 border border-white/15 rounded-full px-4 py-2.5 text-white placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                  required
                />
                <button
                  type="submit"
                  className="flex-shrink-0 bg-[#D4AF37] rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#FFF3D1] hover:scale-105 transition-all duration-200 cursor-pointer shadow-md"
                  aria-label="Subscribe"
                >
                  <Mail size={15} className="text-neutral-950" />
                </button>
              </form>
              {subscribed && (
                <span
                  className="block text-[11px] text-[#D4AF37] font-semibold mt-2"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  ✓ Subscribed to APG Executive Briefings.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-xs text-white/30"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            © 2026 Alpha Premier Group of Companies. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <button
              onClick={() => setLegalModal('privacy')}
              className="hover:text-white/60 transition-colors cursor-pointer"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setLegalModal('terms')}
              className="hover:text-white/60 transition-colors cursor-pointer"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setLegalModal('sitemap')}
              className="hover:text-white/60 transition-colors cursor-pointer"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Sitemap
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full border border-white/20 text-white/40 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-white/5 transition-all cursor-pointer ml-2"
              title="Scroll to Top"
            >
              <ChevronUp size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Legal Dialog Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F131C] border border-[#D4AF37]/40 p-6 max-w-lg w-full text-neutral-200 space-y-4 max-h-[80vh] overflow-y-auto rounded-none shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <h3 className="text-sm font-bold tracking-widest uppercase text-[#D4AF37] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {legalModal === 'privacy' && 'Privacy Policy'}
                {legalModal === 'terms' && 'Terms of Service'}
                {legalModal === 'sitemap' && 'Site Index'}
              </h3>
              <button onClick={() => setLegalModal(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            {legalModal === 'privacy' && (
              <div className="text-xs text-neutral-400 space-y-3 leading-relaxed">
                <p>Alpha Premier Group of Companies is committed to protecting the privacy and confidentiality of client data under the Data Privacy Act of 2012 (RA 10173).</p>
                <p>Information collected through inquiries, virtual office applications, or consultation scheduling is strictly used for business communication and service delivery across our 7 subsidiaries.</p>
                <p>We do not disclose personal information to third parties without prior explicit authorization.</p>
              </div>
            )}

            {legalModal === 'terms' && (
              <div className="text-xs text-neutral-400 space-y-3 leading-relaxed">
                <p>By accessing the Alpha Premier Group portal, you agree to comply with all corporate policies, copyright regulations, and service terms.</p>
                <p>All trademarks, property listings, architectural renderings, and brand logos presented on this site are the exclusive property of Alpha Premier Group of Companies.</p>
              </div>
            )}

            {legalModal === 'sitemap' && (
              <div className="text-xs text-neutral-300 grid grid-cols-2 gap-3 pt-2">
                <div>
                  <h4 className="font-bold text-[#D4AF37] mb-1">Main Pages</h4>
                  <p>• Home Overview</p>
                  <p>• Enterprises Showcase</p>
                  <p>• Blogs & Newsroom</p>
                  <p>• Careers & Opportunities</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#D4AF37] mb-1">Enterprises</h4>
                  <p>• Alpha Premier Realty</p>
                  <p>• Luxe Prime Realty</p>
                  <p>• Dynamic Tree Multimedia</p>
                  <p>• Swift Clear Sanitation</p>
                  <p>• Alta Venture Outsource</p>
                  <p>• Alpha Premier Construction</p>
                  <p>• 88 Prime Virtual Offices</p>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button 
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 bg-[#D4AF37] text-neutral-950 font-bold text-xs hover:bg-[#FFF3D1] transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
