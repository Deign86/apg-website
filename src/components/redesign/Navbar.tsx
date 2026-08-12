import React, { useState, useEffect } from 'react';
import { NavTab } from '../../types';
import { Menu, X, ChevronRight, Phone, Mail } from 'lucide-react';

const logo2025 = '/assets/images/logo2025.png';
const viberLogo = '/assets/images/viber1.png';
const apgLogo = '/assets/images/apgopc.png';

interface NavbarProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenInquire?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenInquire }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'HOME' },
    { id: 'enterprises', label: 'ENTERPRISES' },
    { id: 'blogs', label: 'BLOGS' },
    { id: 'careers', label: 'CAREERS' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0d0a06]/95 backdrop-blur-xl border-b border-[#D4AF37]/50 shadow-[0_4px_25px_rgba(0,0,0,0.8)]' 
        : 'bg-[#0d0a06]/85 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-xl'
    }`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
        scrolled ? 'h-16 sm:h-16' : 'h-20 sm:h-20'
      }`}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="cursor-pointer group flex items-center gap-3 py-1"
        >
          <img 
            src={logo2025} 
            alt="Alpha Premier Group" 
            className={`w-auto object-contain transition-all duration-300 group-hover:opacity-90 ${
              scrolled ? 'h-9 sm:h-10' : 'h-10 sm:h-12'
            }`}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== apgLogo && apgLogo) {
                target.src = apgLogo;
              }
            }}
          />
          <img 
            src={viberLogo} 
            alt="Viber" 
            className={`w-auto object-contain transition-all duration-300 group-hover:opacity-90 ${
              scrolled ? 'h-7 sm:h-8' : 'h-8 sm:h-10'
            }`}
          />
        </div>

        {/* Desktop Navigation - Glassmorphic Pill Bar */}
        <nav className="hidden md:flex items-center p-1.5 rounded-full bg-[#161109]/90 border border-[#D4AF37]/30 shadow-inner">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-5 py-2 rounded-full text-xs font-extrabold tracking-[0.15em] transition-all uppercase cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFE082] via-[#D4AF37] to-[#B8860B] text-black shadow-[0_2px_12px_rgba(212,175,55,0.4)]'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Inquire Pill Button (Matching Dynamic Tree Pill Styling in Gold) */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={onOpenInquire}
            className="px-6 py-2.5 rounded-full border border-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-extrabold text-[11px] tracking-widest uppercase transition-all duration-300 shadow-md cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            INQUIRE NOW
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0a06]/98 backdrop-blur-xl border-b border-[#D4AF37]/30 px-4 pt-3 pb-6 space-y-3">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between py-3 px-4 text-left text-xs font-bold tracking-[0.15em] uppercase rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#D4AF37] text-black font-extrabold'
                    : 'text-neutral-300 hover:bg-neutral-800/50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>
            );
          })}
          
          {/* Updated Official Contact Details in Mobile Drawer */}
          <div className="pt-3 border-t border-[#D4AF37]/20 space-y-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2 px-4 py-1">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>0915 888 9482 / (02) 8 650 2540</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>contact@alphapremier.com</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
