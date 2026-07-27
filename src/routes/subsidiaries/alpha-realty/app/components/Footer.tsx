import React from 'react';
import { MapPin, Phone, Mail, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import AlphaPremierLogo from './AlphaPremierLogo';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onInquireClick: () => void;
}

export default function Footer({ setActiveTab, onInquireClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#040507] text-white border-t border-gray-900 pt-16 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* Column 1: Brand & Action button */}
        <div className="md:col-span-5 flex flex-col items-start gap-6">
          <div className="flex items-center">
            <AlphaPremierLogo className="h-16 w-auto" />
          </div>

          <button
            onClick={onInquireClick}
            id="footer-inquire-btn"
            className="w-full sm:w-80 bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] font-sans font-semibold text-xs tracking-[0.3em] uppercase py-4 px-6 text-center transition-all duration-300 rounded-sm"
          >
            INQUIRE NOW!
          </button>

          {/* Contacts */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-start gap-3 text-white/60 text-xs leading-relaxed max-w-sm">
              <MapPin className="w-4 h-4 text-[#c5a85c] shrink-0 mt-0.5" />
              <span>Tektite East Tower, Exchange Road, Ortigas Center, San Antonio, Pasig City</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-xs font-mono">
              <Phone className="w-4 h-4 text-[#c5a85c] shrink-0" />
              <span>0927 555 5803 | 0915 888 9482 | 0921 217 4555</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-xs hover:text-[#c5a85c] transition-colors">
              <Mail className="w-4 h-4 text-[#c5a85c] shrink-0" />
              <a href="mailto:realty@alphapremiergroup.com">realty@alphapremiergroup.com</a>
            </div>
          </div>
        </div>

        {/* Column 2: Divider Spacer */}
        <div className="hidden md:block md:col-span-2"></div>

        {/* Column 3: Quick Navigation & Social Icons combined */}
        <div className="md:col-span-5 flex flex-col items-start md:items-end gap-6 md:ml-auto w-full md:w-auto" id="footer-right-column">
          <div className="flex flex-col items-start md:items-end gap-3.5" id="footer-nav-links">
            <button 
              onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }}
              className="text-white/60 hover:text-[#c5a85c] text-xs font-semibold tracking-[0.35em] transition-colors uppercase py-1"
            >
              HOME
            </button>
            <button 
              onClick={() => { setActiveTab('services'); window.scrollTo(0,0); }}
              className="text-white/60 hover:text-[#c5a85c] text-xs font-semibold tracking-[0.35em] transition-colors uppercase py-1"
            >
              SERVICES
            </button>
            <button 
              onClick={() => { setActiveTab('blogs'); window.scrollTo(0,0); }}
              className="text-white/60 hover:text-[#c5a85c] text-xs font-semibold tracking-[0.35em] transition-colors uppercase py-1"
            >
              BLOGS
            </button>
            <button 
              onClick={() => { setActiveTab('careers'); window.scrollTo(0,0); }}
              className="text-white/60 hover:text-[#c5a85c] text-xs font-semibold tracking-[0.35em] transition-colors uppercase py-1"
            >
              CAREERS
            </button>
          </div>

          {/* Social Icons directly below navigation links */}
          <div className="flex gap-3 w-full md:w-auto md:justify-end" id="footer-social-icons">
            <a href="#" className="w-10 h-10 rounded-sm border border-gray-800 bg-black/20 backdrop-blur-sm flex items-center justify-center hover:border-[#c5a85c] hover:text-[#c5a85c] hover:bg-white/[0.02] transition-all text-white/70">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-sm border border-gray-800 bg-black/20 backdrop-blur-sm flex items-center justify-center hover:border-[#c5a85c] hover:text-[#c5a85c] hover:bg-white/[0.02] transition-all text-white/70">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-sm border border-gray-800 bg-black/20 backdrop-blur-sm flex items-center justify-center hover:border-[#c5a85c] hover:text-[#c5a85c] hover:bg-white/[0.02] transition-all text-white/70">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-sm border border-gray-800 bg-black/20 backdrop-blur-sm flex items-center justify-center hover:border-[#c5a85c] hover:text-[#c5a85c] hover:bg-white/[0.02] transition-all text-white/70">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">
          © {currentYear} ALPHA PREMIER GROUP. ALL RIGHTS RESERVED.
        </p>
        <p className="text-white/20 text-[9px] tracking-[0.1em]">
          PRIVACY POLICY · TERMS OF SERVICE
        </p>
      </div>
    </footer>
  );
}
