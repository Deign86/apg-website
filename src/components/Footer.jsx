import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail, ChevronUp, ShieldCheck } from 'lucide-react';

const COMPANY_INFO = {
  name: 'ALPHA PREMIER GROUP',
  fullName: 'Alpha Premier Group of Companies',
  tagline: 'A diversified conglomerate connecting ambition with opportunity across real estate, construction, and business services.',
  founded: 'EST. 2010 · PASIG CITY, PHILIPPINES',
  address: '12F One Corporate Centre, Julia Vargas Ave., Ortigas Center, Pasig City 1605',
  phone: '(+63 2) 8888-1234',
  email: 'info@alphapremiergroup.com',
};

export default function Footer({ onOpenInquire }) {
  const [legalModal, setLegalModal] = useState(null);
  const [socials, setSocials] = useState({
    facebook: 'https://www.facebook.com/alphapremierRealty',
    instagram: 'https://www.instagram.com/alphapremier_rec/',
    tiktok: 'https://www.tiktok.com/@alphapremierr',
  });
  const [siteName, setSiteName] = useState('Alpha Premier');

  useEffect(() => {
    supabase.from('site_settings').select('key,value').in('key', ['social_facebook','social_instagram','social_tiktok','site_name'])
      .then(({ data }) => {
        if (data?.length) {
          const map = {};
          data.forEach(s => { map[s.key] = s.value; });
          if (map.site_name) setSiteName(map.site_name);
          setSocials(prev => ({
            facebook: map.social_facebook || prev.facebook,
            instagram: map.social_instagram || prev.instagram,
            tiktok: map.social_tiktok || prev.tiktok,
          }));
        }
      })
      .catch(() => { /* fallback */ });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-neutral-300 border-t border-[#1C1C20] pt-16 pb-8 relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#1C1C20]">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="/assets/images/logo-navbar.jpg" 
                alt="Alpha Premier Group" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/assets/images/apgopc.png";
                }}
              />
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed pr-2">
              {COMPANY_INFO.tagline}
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 border border-[#222228] hover:border-[#E2B857] hover:text-[#E2B857] transition-colors rounded-none">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 border border-[#222228] hover:border-[#E2B857] hover:text-[#E2B857] transition-colors rounded-none">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 border border-[#222228] hover:border-[#E2B857] hover:text-[#E2B857] transition-colors rounded-none text-xs font-bold font-sans">
                  🎵
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-100 font-display">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/careers" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blogs" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <button 
                  onClick={onOpenInquire}
                  className="hover:text-[#E2B857] transition-colors font-semibold text-[#E2B857] cursor-pointer"
                >
                  Schedule Consultation →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Our Companies */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-100 font-display">
              OUR COMPANIES
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li><Link to="/subsidiaries/realty" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">Alpha Premier Realty</Link></li>
              <li><Link to="/subsidiaries/construction" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">Alpha Premier Construction</Link></li>
              <li><Link to="/subsidiaries/swiftclear" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">Swift Clear Solutions</Link></li>
              <li><Link to="/subsidiaries/dynamic-tree" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">Dynamic Tree Multimedia</Link></li>
              <li><Link to="/subsidiaries/alta-venture" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">Alta Venture Outsource</Link></li>
              <li><Link to="/subsidiaries/88prime" onClick={scrollToTop} className="hover:text-[#E2B857] transition-colors">88 Prime & Virtual Office</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-100 font-display">
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
          <p>© {new Date().getFullYear()} {siteName} Group of Companies. All rights reserved.</p>
          
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
              className="p-1.5 border border-[#2B303C] hover:border-[#E2B857] hover:text-[#E2B857] transition-colors ml-2 cursor-pointer"
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
          <div className="bg-[#0F131C] border border-[#2A2F3A] p-6 max-w-lg w-full text-neutral-200 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-[#2A2F3A] pb-3">
              <h3 className="text-sm font-bold tracking-widest uppercase text-[#E2B857] flex items-center gap-2 font-display">
                <ShieldCheck className="w-4 h-4" />
                {legalModal === 'privacy' && 'Privacy Policy'}
                {legalModal === 'terms' && 'Terms of Use'}
                {legalModal === 'sitemap' && 'Site Index'}
              </h3>
              <button onClick={() => setLegalModal(null)} className="text-neutral-400 hover:text-white cursor-pointer">✕</button>
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
                  <p>• Properties & Listings</p>
                  <p>• Careers & Opportunities</p>
                  <p>• Blogs & Newsroom</p>
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
                className="px-4 py-2 bg-[#E2B857] text-neutral-950 font-bold text-xs cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
