import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getEnterpriseConfig } from '../data/enterpriseConfig';
import './EnterpriseHeader.css';

function readEnterpriseGlobals() {
  if (typeof window === 'undefined') return { navigate: null, currentPage: null };
  return {
    navigate: typeof window.enterpriseNavigate === 'function' ? window.enterpriseNavigate : null,
    currentPage: typeof window.enterpriseCurrentPage === 'string' ? window.enterpriseCurrentPage : null,
  };
}

export default function EnterpriseHeader() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const config = getEnterpriseConfig(location.pathname);
  const initial = typeof window !== 'undefined'
    ? readEnterpriseGlobals()
    : { navigate: null, currentPage: null };
  const [currentPage, setLocalCurrentPage] = useState(initial.currentPage);
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
  }, [location.pathname, currentPage]);

  // Periodically resync currentPage so header active styling tracks the child
  // app's internal state (cheap; this fires every render frame anyway via child re-renders).
  useEffect(() => {
    let raf;
    const tick = () => {
      const g = readEnterpriseGlobals();
      setLocalCurrentPage((prev) => (prev === g.currentPage ? prev : g.currentPage));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  // Close mobile menu on any navigation event
  useEffect(() => { setMenuOpen(false); }, [location.pathname, currentPage]);

  if (!config) return null;

  const handleNav = (key) => {
    const g = readEnterpriseGlobals();
    if (g.navigate) {
      g.navigate(key);
    } else {
      routerNavigate('/subsidiaries/' + config.slug);
    }
    setMenuOpen(false);
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
        <Link to="/" className="apg-parent-badge" title="Return to Alpha Premier Group Main Site">
          <span className="apg-badge-chevron">‹</span>
          <span className="apg-badge-text">APG Main Site</span>
          <img src="/assets/images/viber1.png" alt="Alpha Premier Group" className="apg-badge-logo" />
        </Link>
        <div className="enterprise-header-logo">
          <button type="button" onClick={() => handleNav('home')} aria-label={config.logoAlt}>
            <img src={config.logoSrc} alt={config.logoAlt} />
          </button>
        </div>
      </div>
      <div
        className="enterprise-mobile-menu-icon"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
      >
        <i className={'fa-solid ' + (menuOpen ? 'fa-xmark' : 'fa-bars')}></i>
      </div>
      <nav className={'enterprise-nav ' + (menuOpen ? 'is-open' : '')}>
        <ul>
          {config.navItems.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={currentPage === item.key ? 'is-active' : ''}
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
