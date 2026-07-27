import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Phone, Mail } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'HOME' },
  { to: '/enterprises', label: 'ENTERPRISES' },
  { to: '/careers', label: 'CAREERS' },
  { to: '/blogs', label: 'BLOGS' },
];

const constructionNavLinks = [
  { to: '/subsidiaries/construction#home', label: 'HOME' },
  { to: '/subsidiaries/construction#services', label: 'SERVICES' },
  { to: '/subsidiaries/construction#blogs', label: 'BLOGS' },
  { to: '/subsidiaries/construction#careers', label: 'CAREERS' },
];

export default function Header({ onOpenInquire }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const activeLinks = location.pathname.startsWith('/subsidiaries/construction')
    ? constructionNavLinks
    : navLinks;

  const getCleanPath = (link) => {
    if (location.pathname === '/subsidiaries/construction' && !location.hash) {
      return '/subsidiaries/construction#home';
    }
    return `${location.pathname}${location.hash}`;
  };

  const headerContent = (
    <header className={`site-header fixed top-0 left-0 w-full z-45 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#2A2F3A] transition-all duration-300 font-sans ${scrolled ? 'py-1 shadow-lg' : 'py-2'}`}>
      <div className="w-full px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="cursor-pointer group flex items-center py-1"
        >
          <img 
            src="/assets/images/logo-navbar.jpg" 
            alt="Alpha Premier Group" 
            className="h-12 sm:h-14 w-auto object-contain transition-opacity group-hover:opacity-90"
            onError={(e) => {
              e.currentTarget.src = "/assets/images/apgopc.png";
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {activeLinks.map((item) => {
            const currentPath = getCleanPath(item);
            const isActive = currentPath === item.to || (item.to === '/' && location.pathname === '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative py-2 text-xs font-bold font-serif tracking-[0.15em] transition-all uppercase ${
                  isActive
                    ? 'text-[#E2B857]'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E2B857] rounded-full shadow-[0_0_8px_rgba(226,184,87,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F131C] border-b border-[#2A2F3A] px-4 pt-3 pb-6 space-y-3 font-sans">
          {activeLinks.map((item) => {
            const currentPath = getCleanPath(item);
            const isActive = currentPath === item.to || (item.to === '/' && location.pathname === '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center justify-between py-3 px-4 text-left text-xs font-bold tracking-[0.15em] uppercase border-l-2 transition-all ${
                  isActive
                    ? 'border-[#E2B857] bg-[#E2B857]/10 text-[#E2B857]'
                    : 'border-transparent text-neutral-300 hover:bg-neutral-800/50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </Link>
            );
          })}
          
          <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2 px-4 py-1">
              <Phone className="w-3.5 h-3.5 text-[#E2B857]" />
              <span>(+63 2) 8888-1234</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1">
              <Mail className="w-3.5 h-3.5 text-[#E2B857]" />
              <span>info@alphapremiergroup.com</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );

  if (typeof document !== 'undefined') {
    return createPortal(headerContent, document.body);
  }

  return headerContent;
}
