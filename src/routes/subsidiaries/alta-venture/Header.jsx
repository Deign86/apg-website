import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../../../components/Header.css';
import './av-header.css';
import { MAIN_SITE_HREF } from '../../../lib/enterpriseHost';

const ROOT = '/subsidiaries/alta-venture';

const navLinks = [
  { to: `${ROOT}`, label: 'Home' },
  { to: `${ROOT}/services`, label: 'Services' },
  { to: `${ROOT}/blogs`, label: 'Blogs' },
  { to: `${ROOT}/careers`, label: 'Careers' },
  { to: `${ROOT}/inquire`, label: 'Inquire' },
];

export default function AltaVentureHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 30);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (to) => {
    if (to === ROOT) return location.pathname === ROOT;
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <header className={`site-header av-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="av-brand-group">
        <Link to={MAIN_SITE_HREF} className="apg-parent-badge" title="Return to Alpha Premier Group Main Site">
          <span className="apg-badge-chevron" aria-hidden="true">‹</span>
          <span className="apg-badge-text">APG MAIN SITE</span>
          <span className="apg-badge-text-short">APG</span>
        </Link>
      </div>
      <div
        className="mobile-menu-icon"
        role="button"
        tabIndex={0}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="avMainNav"
        onClick={() => setMenuOpen(!menuOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setMenuOpen(!menuOpen);
          }
        }}
      >
        {menuOpen ? <X size="1em" aria-hidden="true" /> : <Menu size="1em" aria-hidden="true" />}
      </div>
      <nav id="avMainNav" className={menuOpen ? 'open' : ''}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className={isActive(link.to) ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
