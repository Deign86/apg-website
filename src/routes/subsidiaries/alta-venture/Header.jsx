import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../../components/Header.css';
import './av-header.css';

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
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
      <div className="logo">
        <Link to="/">
          <img
            src="/assets/images/viber1.png"
            alt="Alpha Premier Group"
            className="header-logo"
          />
        </Link>
      </div>
      <div className="mobile-menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
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
