import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AlphaPremierLogo from './AlphaPremierLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onInquireClick: () => void;
}

export default function Header({ activeTab, setActiveTab, onInquireClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'services', label: 'SERVICES' },
    { id: 'blogs', label: 'BLOGS' },
    { id: 'careers', label: 'CAREERS' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/45 backdrop-blur-md px-4 py-3 md:px-12 md:py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      {/* Brand Logo with Name beside it */}
      <div 
        onClick={() => handleNavClick('home')} 
        className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group"
        id="header-brand-logo"
      >
        <AlphaPremierLogo className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 transition-transform duration-300 group-hover:scale-105" iconOnly={true} />
        <div className="flex flex-col items-center">
          <span className="font-display text-[11px] sm:text-xs md:text-sm font-extrabold tracking-[0.15em] sm:tracking-[0.22em] text-white uppercase leading-tight text-center">
            Alpha Premier
          </span>
          <div className="flex items-center justify-center w-full gap-1 sm:gap-2 mt-0.5 sm:mt-1">
            <span className="h-[1px] w-2 sm:w-3 md:w-4 bg-[#c5a85c]/60"></span>
            <span className="font-sans text-[7px] sm:text-[8px] md:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.28em] text-[#c5a85c] uppercase leading-none opacity-95">
              Realty
            </span>
            <span className="h-[1px] w-2 sm:w-3 md:w-4 bg-[#c5a85c]/60"></span>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Navigation Links (md and above) */}
      <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 backdrop-blur-lg rounded-full p-1 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" id="header-capsule-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`relative font-sans text-xs font-semibold tracking-[0.18em] transition-all duration-300 px-4 py-1.5 focus:outline-none rounded-full ${
                isActive 
                  ? 'bg-gradient-to-r from-[#d3b769] to-[#c5a85c] text-neutral-950 font-bold shadow-[0_2px_12px_rgba(197,168,92,0.25)]' 
                  : 'text-white/70 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile Hamburger Button (below md) */}
      <div className="flex md:hidden items-center" id="mobile-hamburger-container">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-white/80 hover:text-[#c5a85c] hover:bg-white/[0.03] rounded-lg transition-colors border border-white/5 focus:outline-none"
          aria-label="Toggle Menu"
          id="mobile-hamburger-btn"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="absolute top-full left-0 right-0 bg-black/75 backdrop-blur-xl border-b border-white/10 shadow-2xl py-6 px-6 md:hidden z-50 flex flex-col gap-4 animate-fade-in"
          id="mobile-drawer-overlay"
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full font-sans text-left text-xs font-semibold tracking-[0.2em] transition-all duration-300 px-5 py-3.5 rounded-xl border ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#d3b769] to-[#c5a85c] text-neutral-950 font-bold border-transparent shadow-[0_2px_12px_rgba(197,168,92,0.15)]' 
                      : 'text-white/75 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
