import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getEnterpriseConfig } from '../data/enterpriseConfig';
import { useEnterpriseNav } from '../context/EnterpriseNavContext';
import './EnterpriseHeader.css';
import { MAIN_SITE_HREF } from '../lib/enterpriseHost';

export default function EnterpriseHeader() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const config = getEnterpriseConfig(location.pathname);
  const { currentPage, navigate: navToPage } = useEnterpriseNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 20 || (document.documentElement && document.documentElement.scrollTop > 20);
      setScrolled(isScrolled);
    };
    onScroll();
    const timer = setTimeout(onScroll, 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname]);

  // Close mobile menu on any navigation event
  useEffect(() => { setMenuOpen(false); }, [location.pathname, currentPage]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  if (!config) return null;

  const handleNav = (key) => {
    setMenuOpen(false);
    // No enterprise page mounted (e.g. the /inquire route): go to the enterprise home,
    // which picks up the requested section when it registers its navigator.
    if (!navToPage(key)) routerNavigate('/subsidiaries/' + config.slug);
  };

  const headerContent = (
    <header
      className={'enterprise-header ' + (scrolled ? 'is-scrolled' : '')}
      style={{
        '--enterprise-accent': config.accentColor,
        '--enterprise-nav-text': config.navTextColor || '#1C1814',
        '--enterprise-initial-bg': config.initialBg || 'transparent',
        '--enterprise-scrolled-bg': config.scrolledBg || 'rgba(10, 10, 10, 0.95)',
        '--enterprise-mobile-bg': config.mobileNavBg || 'rgba(10, 10, 10, 0.98)',
      }}
    >
      <div className="enterprise-brand-group">
        <Link to={MAIN_SITE_HREF} className="apg-parent-badge" title="Return to Alpha Premier Group Main Site">
          <span className="apg-badge-chevron">‹</span>
          <span className="apg-badge-text">APG MAIN SITE</span>
        </Link>
      </div>
      <button
        type="button"
        className="enterprise-mobile-menu-icon"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="enterprise-nav"
      >
        <i className={'fa-solid ' + (menuOpen ? 'fa-xmark' : 'fa-bars')} aria-hidden="true"></i>
      </button>
      <nav id="enterprise-nav" className={'enterprise-nav ' + (menuOpen ? 'is-open' : '')}>
        <ul>
          {config.navItems.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={currentPage === item.key ? 'is-active' : ''}
                aria-current={currentPage === item.key ? 'page' : undefined}
                onClick={() => handleNav(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li className="enterprise-nav-cta">
            <button type="button" onClick={() => handleNav(config.inquireKey)}>
              {config.inquireLabel}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );

  if (typeof document !== 'undefined') {
    return createPortal(headerContent, document.body);
  }

  return headerContent;
}
