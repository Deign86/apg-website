import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/virtual-office', label: 'Virtual Office' },
  { to: '/careers', label: 'Careers' },
  { to: '/blogs', label: 'Blogs' },
];

const constructionNavLinks = [
  { to: '/subsidiaries/construction#home', label: 'Home' },
  { to: '/subsidiaries/construction#services', label: 'Services' },
  { to: '/subsidiaries/construction#blogs', label: 'Blogs' },
  { to: '/subsidiaries/construction#careers', label: 'Careers' },
];

const prime88NavLinks = [
  { to: '/subsidiaries/88prime#home', label: 'Home' },
  { to: '/subsidiaries/88prime#services', label: 'Services' },
  { to: '/subsidiaries/88prime#blogs', label: 'Blogs' },
  { to: '/subsidiaries/88prime#careers', label: 'Careers' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.classList.add('loaded');
  }, []);

  const isSubsidiaryRoute = location.pathname.startsWith('/subsidiaries/');

  const getNavLinks = () => {
    if (location.pathname.startsWith('/subsidiaries/construction')) {
      return constructionNavLinks;
    }
    if (location.pathname.startsWith('/subsidiaries/88prime')) {
      return prime88NavLinks;
    }
    return navLinks;
  };

  const headerContent = (
    <header className={`site-header ${scrolled ? 'scrolled' : ''} ${location.pathname.startsWith('/subsidiaries/88prime') ? 'prime88-header' : ''}`}>
      <div className="brand-group">
        {isSubsidiaryRoute ? (
          <Link to="/" className="apg-parent-badge" title="Return to Alpha Premier Group Main Site">
            <span className="apg-badge-chevron">‹</span>
            <span className="apg-badge-text">APG MAIN SITE</span>
          </Link>
        ) : (
          <div className="logo">
            <Link to="/">
              <img src="/assets/images/viber1.png" alt="Alpha Premier" className="header-logo" />
            </Link>
          </div>
        )}
      </div>
      <div className="mobile-menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </div>
      <nav id="mainNav" className={menuOpen ? 'open' : ''}>
        <ul>
          {getNavLinks().map((link) => {
            let isActive = false;
            if (location.pathname.startsWith('/subsidiaries/88prime')) {
              const currentHash = location.hash || '#home';
              isActive = link.to === `/subsidiaries/88prime${currentHash}`;
            } else if (location.pathname.startsWith('/subsidiaries/construction')) {
              const currentHash = location.hash || '#home';
              isActive = link.to === `/subsidiaries/construction${currentHash}`;
            } else {
              isActive = location.pathname === link.to;
            }

            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={isActive ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );

  if (typeof document !== 'undefined') {
    return createPortal(headerContent, document.body);
  }

  return headerContent;
}
