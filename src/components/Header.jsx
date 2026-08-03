import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
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

  const getSubsidiaryName = (path) => {
    if (path.includes('construction')) return 'Construction';
    if (path.includes('realty')) return 'Realty';
    if (path.includes('swiftclear')) return 'SwiftClear';
    if (path.includes('88prime')) return '88 Prime';
    return '';
  };

  const headerContent = (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="brand-group">
        {isSubsidiaryRoute && (
          <Link to="/" className="apg-parent-badge" title="Return to Alpha Premier Group Main Site">
            <span className="apg-badge-chevron">‹</span>
            <span className="apg-badge-text">APG Main Site</span>
            <img src="/assets/images/viber1.png" alt="Alpha Premier Group" className="apg-badge-logo" />
          </Link>
        )}
        <div className="logo">
          <Link to="/">
            <img src="/assets/images/viber1.png" alt="Alpha Premier" className="header-logo" />
          </Link>
        </div>
      </div>
      <div className="mobile-menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </div>
      <nav id="mainNav" className={menuOpen ? 'open' : ''}>
        <ul>
          {(location.pathname.startsWith('/subsidiaries/construction') ? constructionNavLinks : navLinks).map((link) => {
            const currentPath = location.pathname === '/subsidiaries/construction' && !location.hash
              ? '/subsidiaries/construction#home'
              : `${location.pathname}${location.hash}`;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={currentPath === link.to ? 'active' : ''}
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
