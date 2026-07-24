# Standard Navbar Integration & Glassmorphic Scroll Effect Guide

This document serves as the official reference implementation guide for integrating the standard **Alpha Premier Group (APG) Glassmorphic & Dynamic Scroll Navbar** across all subsidiary websites and branch platforms.

---

## 1. Overview of Navbar Features & Effects

The APG Navbar standard provides a luxury, state-of-the-art user experience through the following design & functional effects:

1. **Glassmorphism Backdrop Blur**: Utilizes CSS `backdrop-filter: blur(10px)` to create a sleek frosted-glass effect over hero banners and scrolling content.
2. **Scroll-Driven Elevation & Shrink**: Smoothly transitions header height (e.g., `80px` to `64px`), increases background opacity (`0.85` to `0.95`), and displays an accent border & shadow upon scrolling down.
3. **Active Page Indicator**: Highlights the currently active route with a sleek bottom border and color transition using theme tokens (`var(--accent)` / `var(--enterprise-accent)`).
4. **Smooth Responsive Mobile Drawer**: An expandable mobile menu drawer with dynamic max-height/opacity transitions and auto-close behavior on route change.
5. **High-Contrast Call to Action (CTA)**: A high-emphasis solid CTA button (e.g. "INQUIRE") designed for quick conversions.

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

Below is the production-tested React implementation matching the main APG / Luxe Prime Realty navbar.

### `Header.jsx` / `EnterpriseHeader.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/virtual-office', label: 'Virtual Office' },
  { to: '/careers', label: 'Careers' },
  { to: '/blogs', label: 'Blogs' },
];

export default function Header({ accentColor }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Scroll detection hook with optimized passive listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Automatically close mobile menu drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`site-header ${scrolled ? 'scrolled' : ''}`}
      style={accentColor ? { '--enterprise-accent': accentColor } : undefined}
    >
      {/* Brand / Branch Logo */}
      <div className="logo">
        <Link to="/" aria-label="Home">
          <img src="/assets/images/logo.png" alt="Branch Logo" className="header-logo" />
        </Link>
      </div>

      {/* Mobile Hamburger Toggle Button */}
      <div 
        className="mobile-menu-icon" 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Navigation Menu"
        aria-expanded={menuOpen}
        role="button"
        tabIndex={0}
      >
        <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </div>

      {/* Navigation Links */}
      <nav id="mainNav" className={menuOpen ? 'open' : ''}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={location.pathname === link.to ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {/* Action CTA */}
          <li className="nav-cta">
            <Link to="/contact" className="cta-button">
              INQUIRE
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

---

## 4. CSS Stylesheet (`Header.css`)

```css
/* Base Header Container */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height-default, 80px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4%;
  z-index: 10000;
  background: var(--header-bg-initial, rgba(0, 0, 0, 0.85));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(197, 160, 89, 0.2);
  box-sizing: border-box;
  transition: background 0.3s ease-in-out, height 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

/* Scrolled Dynamic State */
.site-header.scrolled {
  height: var(--header-height-scrolled, 64px);
  background: var(--header-bg-scrolled, rgba(10, 10, 10, 0.95));
  border-bottom: 1px solid rgba(197, 160, 89, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* Logo Styling */
.logo img.header-logo {
  height: 45px;
  width: auto;
  object-fit: contain;
  transition: height 0.3s ease;
}

.site-header.scrolled .logo img.header-logo {
  height: 38px;
}

/* Mobile Icon */
.mobile-menu-icon {
  display: none;
  color: var(--enterprise-accent, var(--accent));
  font-size: 1.8rem;
  cursor: pointer;
}

/* Navigation List */
nav ul {
  display: flex;
  gap: 35px;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

nav ul li a {
  color: #ffffff;
  text-decoration: none;
  font-family: var(--font-family-nav, sans-serif);
  font-weight: 500;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: color 0.3s ease;
  padding: 4px 0;
}

nav ul li a:hover,
nav ul li a.active {
  color: var(--enterprise-accent, var(--accent)) !important;
}

nav ul li a.active {
  font-weight: 700;
  border-bottom: 2px solid var(--enterprise-accent, var(--accent));
}

/* Solid CTA Button Styling */
nav ul li.nav-cta .cta-button {
  background: var(--enterprise-accent, var(--accent)) !important;
  color: #050505 !important;
  border: 1px solid var(--enterprise-accent, var(--accent)) !important;
  padding: 10px 24px !important;
  font-weight: 700 !important;
  letter-spacing: 0.25em !important;
  border-radius: 0px !important; /* Sharp luxe edges */
  box-shadow: 0 0 20px rgba(196, 154, 42, 0.3);
  transition: background 0.3s ease, box-shadow 0.3s ease !important;
}

nav ul li.nav-cta .cta-button:hover {
  background: #B0881E !important;
  border-color: #B0881E !important;
  box-shadow: 0 0 30px rgba(196, 154, 42, 0.5);
}

/* Mobile Responsiveness Drawer */
@media (max-width: 768px) {
  .mobile-menu-icon {
    display: block;
  }
  nav {
    position: absolute;
    top: var(--header-height-default, 80px);
    left: 0;
    width: 100%;
    background: rgba(10, 10, 10, 0.98);
    height: 0;
    overflow: hidden;
    transition: height 0.4s ease-in-out, top 0.3s ease-in-out;
    border-bottom: 0px solid var(--enterprise-accent, var(--accent));
  }

  .site-header.scrolled nav {
    top: var(--header-height-scrolled, 64px);
  }

  nav.open {
    height: 320px;
    border-bottom: 2px solid var(--enterprise-accent, var(--accent));
  }

  nav ul {
    flex-direction: column;
    align-items: center;
    padding: 24px 0;
    gap: 20px;
  }

  nav ul li a {
    font-size: 1rem;
  }
}
```

---

## 5. Vanilla HTML / CSS / JS Version

For branch sites using standard HTML static files:

```html
<header id="siteHeader" class="site-header">
  <div class="logo">
    <a href="/"><img src="logo.png" alt="Logo" class="header-logo" /></a>
  </div>
  <div id="mobileMenuBtn" class="mobile-menu-icon">
    <i class="fa-solid fa-bars"></i>
  </div>
  <nav id="mainNav">
    <ul>
      <li><a href="/" class="active">Home</a></li>
      <li><a href="/properties">Properties</a></li>
      <li><a href="/services">Services</a></li>
      <li class="nav-cta"><a href="/contact" class="cta-button">INQUIRE</a></li>
    </ul>
  </nav>
</header>

<script>
  (function() {
    const header = document.getElementById('siteHeader');
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mainNav');

    // Scroll effect toggle
    window.addEventListener('scroll', function() {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });

    // Mobile drawer toggle
    menuBtn.addEventListener('click', function() {
      const isOpen = nav.classList.toggle('open');
      const icon = menuBtn.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-bars';
      }
    });
  })();
</script>
```

---

## 6. Integration Checklist for Other Branches

When implementing this Navbar on a new branch website:

- [ ] Include standard CSS variables (`--accent`, `--header-height-default`).
- [ ] Ensure FontAwesome or your icon set is loaded for the mobile menu toggle icons (`fa-bars` and `fa-xmark`).
- [ ] Use `passive: true` on scroll event listeners to maintain 60 FPS scrolling performance.
- [ ] Ensure content containers have a top padding equal to `--header-height-default` (`80px`) so content is never hidden behind the fixed header.
- [ ] Test on mobile devices (width < 768px) to verify smooth drawer open/close behavior.
