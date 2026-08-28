import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavTab } from '../../types';
import { COMPANY_INFO } from '../../data/companyData';
import { Facebook, Linkedin, Instagram, MapPin, Phone, Mail, ChevronUp, ShieldCheck, Send, Check } from 'lucide-react';

const logoNavbar = '/assets/images/logo-navbar.jpg';
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
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#0B0905] text-neutral-300 border-t border-[#D4AF37]/30 pt-16 pb-8 relative z-10 overflow-hidden font-sans">
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
                      fallback.innerHTML = `<span class="text-2xl font-black tracking-[0.2em] text-[#E2B857]">ALPHA</span><span class="text-[9px] font-semibold tracking-[0.25em] text-neutral-400 uppercase">PREMIER GROUP OF COMPANIES</span>`;
                      parent.appendChild(fallback);
                    }
                  }
                }}
              />
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed font-light pr-2">
              A diversified corporate conglomerate connecting ambition with opportunity across real estate investment, commercial construction, facility sanitation, creative media, BPO outsourcing, and enterprise trading.
            </p>

            {/* Social Ring Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <h4 className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-bold">
                FOLLOW OUR NETWORK
              </h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Facebook className="w-4 h-4" />, label: 'Facebook', href: 'https://www.facebook.com/alphapremiergroup' },
                  { icon: <Instagram className="w-4 h-4" />, label: 'Instagram', href: 'https://www.instagram.com/alphapremiergroup/' },
                  { icon: <TikTokIcon size={15} />, label: 'TikTok', href: 'https://www.tiktok.com/@alphapremierr' },
                  { icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn', href: 'https://www.linkedin.com/company/alpha-premier-group' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-200"
                  >
                    {s.icon}
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
            <nav className="flex flex-col gap-3 text-xs text-neutral-400 font-medium">
              <button 
                onClick={() => { onNavigate('home'); scrollToTop(); }}
                className="text-left hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Home Overview
              </button>
              <button 
                onClick={() => { onNavigate('enterprises'); scrollToTop(); }}
                className="text-left hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Enterprises Directory
              </button>
              <button 
                onClick={() => { navigate('/properties'); scrollToTop(); }}
                className="text-left hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Properties & Real Estate
              </button>
              <button 
                onClick={() => { onNavigate('blogs'); scrollToTop(); }}
                className="text-left hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Blogs & Newsroom
              </button>
              <button 
                onClick={() => { onNavigate('careers'); scrollToTop(); }}
                className="text-left hover:text-[#E2B857] transition-colors w-fit cursor-pointer"
              >
                Careers & Opportunities
              </button>
              <button 
                onClick={() => { onOpenInquire(); }}
                className="text-left text-[#E2B857] hover:underline transition-colors w-fit font-bold cursor-pointer"
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
            <nav className="flex flex-col gap-2.5 text-xs text-neutral-400">
              {SUBSIDIARIES.map((sub) => (
                <button
                  key={sub.path}
                  onClick={() => {
                    navigate(sub.path);
                    scrollToTop();
                  }}
                  className="text-left hover:text-[#E2B857] transition-colors w-fit flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#D4AF37]/50 text-[10px]">›</span>
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
              <div className="flex flex-col gap-3 text-xs text-neutral-400 font-light">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Unit 3104, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>0915 888 9482 / (02) 8 650 2540</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>contact@alphapremier.com</span>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="flex flex-col gap-3 pt-1 border-t border-[#D4AF37]/15">
              <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-300 font-bold">
                NEWSLETTER
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 min-w-0 text-xs bg-neutral-900/80 border border-[#D4AF37]/30 rounded-full px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37] transition-all"
                  required
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[#D4AF37] text-neutral-950 rounded-full w-9 h-9 flex items-center justify-center hover:bg-[#FFF3D1] hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
                  aria-label="Subscribe"
                >
                  {newsletterSubscribed ? <Check className="w-4 h-4 text-emerald-800" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
              {newsletterSubscribed && (
                <span className="text-[10px] text-[#D4AF37] font-semibold tracking-wide">
                  ✓ Subscribed to APG Corporate Briefings.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 Alpha Premier Group of Companies. All rights reserved.</p>
          
          <div className="flex items-center space-x-6">
            <button onClick={() => setLegalModal('privacy')} className="hover:text-neutral-300 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => setLegalModal('terms')} className="hover:text-neutral-300 transition-colors cursor-pointer">
              Terms of Use
            </button>
            <button onClick={() => setLegalModal('sitemap')} className="hover:text-neutral-300 transition-colors cursor-pointer">
              Sitemap
            </button>
            <button 
              onClick={scrollToTop} 
              className="p-2 border border-[#D4AF37]/30 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all ml-2 cursor-pointer"
              title="Scroll to Top"
            >
              <ChevronUp className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </div>
        </div>

      </div>

      {/* Legal Dialog Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F131C] border border-[#D4AF37]/40 p-6 max-w-lg w-full text-neutral-200 space-y-4 max-h-[80vh] overflow-y-auto rounded-none shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <h3 className="text-sm font-bold tracking-widest uppercase text-[#E2B857] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {legalModal === 'privacy' && 'Privacy Policy'}
                {legalModal === 'terms' && 'Terms of Use'}
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
                  <h4 className="font-bold text-[#E2B857] mb-1">Main Pages</h4>
                  <p>• Home Overview</p>
                  <p>• Enterprises Showcase</p>
                  <p>• Blogs & Newsroom</p>
                  <p>• Careers & Opportunities</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#E2B857] mb-1">Enterprises</h4>
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
                className="px-4 py-2 bg-[#E2B857] text-neutral-950 font-bold text-xs hover:bg-[#FFF3D1] transition-colors"
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
