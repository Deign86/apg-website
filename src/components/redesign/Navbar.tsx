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
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'enterprises', label: 'Enterprises' },
    { id: 'blogs', label: 'Blogs' },
    { id: 'careers', label: 'Careers' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0803]/95 backdrop-blur-xl shadow-lg border-b border-[#D4AF37]/40'
          : 'bg-[#0A0803]/80 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="cursor-pointer group flex items-center gap-3 py-1 relative z-10"
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#D4AF37] font-bold'
                    : 'text-white/70 font-semibold hover:text-[#D4AF37]'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Button (Aligned with Dynamic Tree Inquire Pill Button) */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={onOpenInquire}
            className="bg-[#D4AF37] text-neutral-950 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#FFF3D1] hover:shadow-lg transition-all duration-300 shadow-md cursor-pointer"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Inquire Now!
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/80 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0803]/98 backdrop-blur-xl border-t border-[#D4AF37]/30 px-6 pb-6 pt-4 flex flex-col gap-4 shadow-lg">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between text-left text-base transition-colors ${
                  isActive
                    ? 'text-[#D4AF37] font-bold'
                    : 'text-white/70 font-semibold hover:text-[#D4AF37]'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-60 text-[#D4AF37]" />
              </button>
            );
          })}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInquire?.();
            }}
            className="mt-2 bg-[#D4AF37] text-neutral-950 text-sm font-semibold px-6 py-2.5 rounded-full w-fit hover:bg-[#FFF3D1] transition-colors shadow-md"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Inquire Now!
          </button>

          <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>0915 888 9482 / (02) 8 650 2540</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>contact@alphapremier.com</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
