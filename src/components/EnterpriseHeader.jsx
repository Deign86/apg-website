import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getEnterpriseConfig } from '../data/enterpriseConfig';
import './EnterpriseHeader.css';

// EnterpriseHeader — visual layout mirrors APG's Header (dark bar, logo top-left,
// horizontal nav, mobile hamburger). Content/logo/nav links come from the per-enterprise
// config (ENTERPRISE_CONFIGS[slug]). Clicking a nav link delegates to the
// currently-mounted enterprise child via window.enterpriseNavigate (set by the
// child route element), so the Figma app's internal page-switching state can drive
// the navigation without coupling to React context across component boundaries.

function readEnterpriseGlobals() {
  if (typeof window === 'undefined') return { navigate: null, currentPage: null };
  return {
    navigate: typeof window.enterpriseNavigate === 'function' ? window.enterpriseNavigate : null,
    currentPage: typeof window.enterpriseCurrentPage === 'string' ? window.enterpriseCurrentPage : null,
  };
}

export default function EnterpriseHeader() {
  const location = useLocation();
  const config = getEnterpriseConfig(location.pathname);
  const initial = typeof window !== 'undefined'
    ? readEnterpriseGlobals()
    : { navigate: null, currentPage: null };
  const [currentPage, setLocalCurrentPage] = useState(initial.currentPage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
  }, []);

  // Close mobile menu on any navigation event
  useEffect(() => { setMenuOpen(false); }, [location.pathname, currentPage]);

  if (!config) return null;

  const handleNav = (key) => {
    const g = readEnterpriseGlobals();
    if (g.navigate) {
      g.navigate(key);
    } else {
      // Navigate is not yet attached — fall back to a React Router push to the
      // bare subsidiary path so the URL still reflects the user trying to navigate.
      window.location.href = '/subsidiaries/' + config.slug;
    }
    setMenuOpen(false);
  };

  return (
    <header
      className={'enterprise-header ' + (scrolled ? 'is-scrolled' : '')}
      style={{
        '--enterprise-accent': config.accentColor,
        '--enterprise-nav-text': config.navTextColor || '#1C1814',
        '--enterprise-scrolled-bg': config.scrolledBg || 'rgba(253, 244, 247, 0.96)',
        '--enterprise-mobile-bg': config.mobileNavBg || 'rgba(253, 244, 247, 0.98)',
      }}
    >
      <div className="enterprise-header-logo">
        <button type="button" onClick={() => handleNav('home')} aria-label={config.logoAlt}>
          <img src={config.logoSrc} alt={config.logoAlt} />
        </button>
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
}
