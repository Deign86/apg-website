# Official APG Subsidiary Website Integration Guide

This document serves as the master technical specification for co-developers integrating subsidiary websites (e.g., Swift Clear, AltaVenture, 88 Prime, Realty, Construction, Dynamic Tree, Luxe Prime) into the unified **Alpha Premier Group (APG)** platform.

---

## 1. Architecture Overview

All subsidiary websites are wrapped inside the shared `<EnterpriseShell />` component (`src/components/EnterpriseShell.jsx`), which automatically provides:
- **Unified Header Navbar (`<EnterpriseHeader />`)**: Sticky glassmorphic scroll shrink (80px → 64px), active page indicators, theme-aware text contrast, and high-emphasis CTA buttons.
- **Unified Footer (`<EnterpriseFooter />`)**: APG two-column brand footer with social links and contact details.
- **Viewport-Fixed AI Concierge Chatbot (`<EnterpriseChatbot />`)**: Sticky floating chatbot (`bottom: 24px, right: 24px, z-index: 999999`) automatically styled in the subsidiary's accent colors and brand persona.

---

## 2. Step-by-Step Integration Guide for Co-Developers

### Step 1: Register Brand Config in `src/data/enterpriseConfig.js`

Add your subsidiary entry to `ENTERPRISE_CONFIGS` in `src/data/enterpriseConfig.js`:

```javascript
'your-subsidiary-slug': {
  slug: 'your-subsidiary-slug',
  name: 'Your Subsidiary Name',
  logoSrc: '/assets/your-subsidiary/logo.png',
  logoAlt: 'Your Subsidiary Logo',
  navItems: [
    { key: 'home',     label: 'Home' },
    { key: 'services', label: 'Services' },
    { key: 'blogs',    label: 'Blogs' },
    { key: 'careers',  label: 'Careers' },
  ],
  inquireLabel: 'Inquire',
  inquireKey: 'inquire',
  accentColor: '#YOUR_ACCENT_HEX',       // e.g., #C49A2A (Gold) or #C84A72 (Rose)
  navTextColor: '#YOUR_TEXT_HEX',        // #FFFFFF for Dark Themes, #1C1814 for Light Themes
  scrolledBg: 'rgba(..., 0.95)',         // Solid/frosted header background when scrolled
  mobileNavBg: 'rgba(..., 0.98)',        // Mobile drawer background
  footer: {
    logoSrc: '/assets/your-subsidiary/logo.png',
    logoAlt: 'Your Subsidiary Logo',
    blurb: 'Your subsidiary company blurb...',
    navItemKeys: ['home', 'services', 'blogs', 'careers'],
    connect: {
      email: 'contact@alphapremier.com',
      phone: '0915 888 9482 / 02 8 650 2540',
      addressLines: [
        'Unit 3104, Philippine Stock Exchange Centre,',
        'Tektite East Tower, Exchange Road,',
        'Ortigas Center, Pasig City',
      ],
    },
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/alphapremierRealty', icon: 'fa-facebook-f' },
      { label: 'Instagram', href: 'https://www.instagram.com/alphapremier_rec/', icon: 'fa-instagram' },
      { label: 'TikTok', href: 'https://www.tiktok.com/@alphapremierr', icon: 'fa-tiktok' },
    ],
    copyright: '© 2026 Alpha Premier Group of Companies OPC. All rights reserved.',
  },
}
```

---

### Step 2: Organize Source Code & Assets

1. **Brand Assets**: Place logos and images in `public/assets/your-subsidiary-slug/` and `src/imports/`.
2. **App Source Code**: Place page views (`Home.tsx`, `Services.tsx`, `Blogs.tsx`, `Careers.tsx`, `Inquire.tsx`) under `src/routes/subsidiaries/your-subsidiary-slug/`.

---

### Step 3: Create the Route Wrapper (`src/routes/subsidiaries/YourSubsidiary.jsx`)

Expose `window.enterpriseNavigate` & `window.enterpriseCurrentPage` so `EnterpriseHeader` and `EnterpriseFooter` drive internal page switching:

```jsx
import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import SubsidiaryApp from './your-subsidiary-slug/app/App';
import './your-subsidiary-slug/styles/index.css';

export default function YourSubsidiary() {
  const [page, setPage] = useState('home');

  const navigate = useCallback((p) => {
    setPage(p);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.enterpriseNavigate = navigate;
      window.enterpriseCurrentPage = page;
    }
    return () => {
      if (typeof window !== 'undefined') {
        if (window.enterpriseNavigate === navigate) window.enterpriseNavigate = undefined;
        if (window.enterpriseCurrentPage === page) window.enterpriseCurrentPage = undefined;
      }
    };
  }, [navigate, page]);

  return (
    <>
      <Helmet>
        <title>Your Subsidiary | Alpha Premier Group</title>
        <meta name="description" content="Your subsidiary page description." />
      </Helmet>
      <SubsidiaryApp page={page} setPage={navigate} />
    </>
  );
}
```

---

### Step 4: Mount under `<EnterpriseShell />` in `src/App.jsx`

Register your routes inside the `<EnterpriseShell />` route block in `src/App.jsx`:

```jsx
{/* === Enterprise routes === */}
<Route element={<EnterpriseShell />}>
  <Route path="subsidiaries/your-subsidiary-slug" element={<YourSubsidiary />} />
  <Route path="your-subsidiary-slug" element={<YourSubsidiary />} />
</Route>
```

---

### Step 5: Verify Build

Run the production build check from the repository root:
```bash
npm run build
```
Ensure all modules compile cleanly with exit code 0.
