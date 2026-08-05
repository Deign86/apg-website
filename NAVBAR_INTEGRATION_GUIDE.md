# Standard Navbar Integration & Glassmorphic Scroll Effect Guide

This document serves as the official reference implementation guide for integrating the standard **Alpha Premier Group (APG) Glassmorphic & Dynamic Scroll Navbar** across all subsidiary websites and branch platforms.

---

## 1. Overview of Navbar Features & Effects

The APG Navbar standard provides a luxury, state-of-the-art user experience through the following design & functional effects:

1. **APG Parent Site Navigation Pill (`< APG MAIN SITE`)**: A clean, text-only glassmorphic back button pill placed in the upper-left corner of all subsidiary web headers, allowing visitors to return directly to the main APG portal (`/`).
2. **Glassmorphism Backdrop Blur**: Utilizes CSS `backdrop-filter: blur(12px)` to create a sleek frosted-glass effect over hero banners and scrolling content.
3. **Scroll-Driven Elevation & Shrink**: Smoothly transitions header height (e.g., `80px` to `64px`), increases background opacity (`0.85` to `0.95`), and displays an accent border & shadow upon scrolling down.
4. **Active Page Indicator**: Highlights the currently active route with a sleek bottom border and color transition using enterprise theme tokens (`var(--enterprise-accent)`).
5. **Smooth Responsive Mobile Drawer**: An expandable mobile menu drawer with dynamic max-height/opacity transitions and auto-close behavior on route change.
6. **High-Contrast Call to Action (CTA)**: A high-emphasis solid CTA button (e.g. "INQUIRE") designed for quick conversions.

---

## 2. Architecture & Design Tokens

Ensure your branch project includes the necessary CSS Custom Properties (variables) in your global stylesheet (e.g., `index.css` or `styles.css`):

```css
:root {
  --header-height-default: 80px;
  --header-height-scrolled: 64px;
  --header-bg-initial: rgba(0, 0, 0, 0.85);
  --header-bg-scrolled: rgba(10, 10, 10, 0.95);
  --accent: #C49A2A; /* Default Gold Accent */
  --enterprise-accent: var(--accent);
  --font-family-nav: 'Montserrat', sans-serif;
}
```

---

## 3. Implementation: React / JSX Component

Below is the production-tested React implementation matching the shared `EnterpriseHeader.jsx` and `Header.jsx` components.

### `EnterpriseHeader.jsx`

```jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getEnterpriseConfig } from '../data/enterpriseConfig';
import './EnterpriseHeader.css';

export default function EnterpriseHeader() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const config = getEnterpriseConfig(location.pathname);
  const [currentPage, setLocalCurrentPage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 20 || document.documentElement.scrollTop > 20;
      setScrolled(isScrolled);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!config) return null;

  return (
    <header
      className={'enterprise-header ' + (scrolled ? 'is-scrolled' : '')}
      style={{
        '--enterprise-accent': config.accentColor,
        '--enterprise-nav-text': config.navTextColor || '#1C1814',
      }}
    >
      {/* Brand Group — APG Main Site Back Button */}
      <div className="enterprise-brand-group">
        <Link to="/" className="apg-parent-badge" title="Return to Alpha Premier Group Main Site">
          <span className="apg-badge-chevron">‹</span>
          <span className="apg-badge-text">APG MAIN SITE</span>
        </Link>
      </div>

      {/* Mobile Hamburger Icon */}
      <div
        className="enterprise-mobile-menu-icon"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <i className={'fa-solid ' + (menuOpen ? 'fa-xmark' : 'fa-bars')}></i>
      </div>

      {/* Navigation Items */}
      <nav className={'enterprise-nav ' + (menuOpen ? 'is-open' : '')}>
        <ul>
          {config.navItems.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={currentPage === item.key ? 'is-active' : ''}
                onClick={() => routerNavigate('/subsidiaries/' + config.slug)}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li className="enterprise-nav-cta">
            <button type="button" onClick={() => routerNavigate('/subsidiaries/' + config.slug + '/inquire')}>
              {config.inquireLabel}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

---

## 4. CSS Styling (`EnterpriseHeader.css`)

```css
.enterprise-brand-group {
  display: flex;
  align-items: center;
}

.apg-parent-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--enterprise-nav-text, #F5F0E8);
  font-family: 'Montserrat', sans-serif !important;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none !important;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.apg-parent-badge:hover {
  background: var(--enterprise-accent, #C49A2A) !important;
  color: #FFFFFF !important;
  border-color: var(--enterprise-accent, #C49A2A) !important;
  box-shadow: 0 0 20px var(--enterprise-accent, rgba(196, 154, 42, 0.4));
  transform: translateX(-2px);
}

.apg-badge-chevron {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
  transition: transform 0.2s ease;
}

.apg-parent-badge:hover .apg-badge-chevron {
  transform: translateX(-4px);
}

@media (max-width: 576px) {
  .apg-parent-badge {
    padding: 4px 9px;
    font-size: 0.65rem;
  }
  .apg-badge-text {
    display: none;
  }
  .apg-badge-chevron::after {
    content: " APG";
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem;
  }
}
```

---

## 5. Enterprise Verification Checkpoints

When adding or integrating a new subsidiary website:
1. Verify `<Link to="/" className="apg-parent-badge">‹ APG MAIN SITE</Link>` is present in the top-left header bar.
2. Confirm clicking the back button returns to `/` (APG Main Portal).
3. Test mobile view (`< 576px`) to ensure the badge scales to `‹ APG` without crowding the navigation bar.
