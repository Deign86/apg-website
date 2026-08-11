import React, { useState } from 'react';
import { NavTab } from '../types';
import { COMPANY_INFO } from '../data/companyData';
import { Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail, ChevronUp, ShieldCheck, FileText } from 'lucide-react';
import logoNavbar from '../../assets/images/logo-navbar.jpg';
import apgLogo from '../../assets/images/apgopc.png';

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
  onOpenInquire: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenInquire }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'sitemap' | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#120E05]/90 backdrop-blur-md text-neutral-300 border-t border-[#D4AF37]/30 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#D4AF37]/20">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
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
            
            <p className="text-xs text-neutral-400 leading-relaxed pr-2">
              {COMPANY_INFO.tagline}
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-2.5 pt-2">
              <a href="#facebook" onClick={(e) => e.preventDefault()} className="p-2 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors rounded-full bg-[#140F06]">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="#twitter" onClick={(e) => e.preventDefault()} className="p-2 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors rounded-full bg-[#140F06]">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="#linkedin" onClick={(e) => e.preventDefault()} className="p-2 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors rounded-full bg-[#140F06]">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a href="#instagram" onClick={(e) => e.preventDefault()} className="p-2 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors rounded-full bg-[#140F06]">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-100">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button 
                  onClick={() => { onNavigate('home'); scrollToTop(); }}
                  className="hover:text-[#E2B857] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('enterprises'); scrollToTop(); }}
                  className="hover:text-[#E2B857] transition-colors"
                >
                  Enterprises
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('blogs'); scrollToTop(); }}
                  className="hover:text-[#E2B857] transition-colors"
                >
                  Blogs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('careers'); scrollToTop(); }}
                  className="hover:text-[#E2B857] transition-colors"
                >
                  Careers
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenInquire}
                  className="hover:text-[#E2B857] transition-colors font-semibold text-[#E2B857]"
                >
                  Schedule Consultation →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Our Companies */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-100">
              OUR COMPANIES
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li><a href="#realty" onClick={(e) => { e.preventDefault(); onNavigate('enterprises'); scrollToTop(); }} className="hover:text-[#E2B857] transition-colors">Alpha Premier Realty</a></li>
              <li><a href="#construction" onClick={(e) => { e.preventDefault(); onNavigate('enterprises'); scrollToTop(); }} className="hover:text-[#E2B857] transition-colors">Alpha Premier Construction</a></li>
              <li><a href="#swiftclear" onClick={(e) => { e.preventDefault(); onNavigate('enterprises'); scrollToTop(); }} className="hover:text-[#E2B857] transition-colors">Swift Clear Solutions</a></li>
              <li><a href="#businesshub" onClick={(e) => { e.preventDefault(); onNavigate('enterprises'); scrollToTop(); }} className="hover:text-[#E2B857] transition-colors">Alpha Business Hub</a></li>
              <li><a href="#freight" onClick={(e) => { e.preventDefault(); onNavigate('enterprises'); scrollToTop(); }} className="hover:text-[#E2B857] transition-colors">Alpha Freight & Cargo</a></li>
              <li><a href="#ventures" onClick={(e) => { e.preventDefault(); onNavigate('enterprises'); scrollToTop(); }} className="hover:text-[#E2B857] transition-colors">Alpha Premier Ventures</a></li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-100">
              CONTACT US
            </h4>
            <div className="space-y-3 text-xs text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E2B857] shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E2B857] shrink-0" />
                <span>{COMPANY_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E2B857] shrink-0" />
                <span>{COMPANY_INFO.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© 2025 Alpha Premier Group of Companies. All rights reserved.</p>
          
          <div className="flex items-center space-x-6">
            <button onClick={() => setLegalModal('privacy')} className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setLegalModal('terms')} className="hover:text-neutral-300 transition-colors">
              Terms of Use
            </button>
            <button onClick={() => setLegalModal('sitemap')} className="hover:text-neutral-300 transition-colors">
              Sitemap
            </button>
            <button 
              onClick={scrollToTop} 
              className="p-1.5 border border-[#2B303C] hover:border-[#E2B857] hover:text-[#E2B857] transition-colors ml-2"
              title="Scroll to Top"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Legal Dialog Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F131C] border border-[#2A2F3A] p-6 max-w-lg w-full text-neutral-200 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2A2F3A] pb-3">
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
                  <p>• Alpha Premier Construction</p>
                  <p>• Swift Clear Solutions</p>
                  <p>• 88 Prime Virtual Offices</p>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button 
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 bg-[#E2B857] text-neutral-950 font-bold text-xs"
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
