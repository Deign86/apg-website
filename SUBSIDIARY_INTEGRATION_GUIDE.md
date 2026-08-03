# Official APG Subsidiary Website Integration Guide

This document serves as the master technical specification for co-developers integrating subsidiary websites (e.g., SwiftClear, AltaVenture, 88 Prime, Realty, Construction, Dynamic Tree, Luxe Prime) into the unified **Alpha Premier Group (APG)** platform.

---

## 1. Architecture Overview

All subsidiary websites are wrapped inside standard layouts (`<EnterpriseShell />` or `<Layout />`), which automatically provide:
- **APG Parent Navigation Button (`< APG MAIN SITE`)**: A clean text-only glassmorphic back button pill placed in the top-left of all headers that links directly back to `/` (Main APG Portal).
- **Unified Header Navbar (`<EnterpriseHeader />` / `<Header />`)**: Sticky glassmorphic scroll shrink (80px → 64px), active page indicators, theme-aware text contrast, and high-emphasis CTA buttons.
- **Unified Footer (`<EnterpriseFooter />` / `<Footer />`)**: APG two-column brand footer with social links and contact details.
- **Universal Enterprise AI Concierge Chatbot (`<EnterpriseChatbot />`)**: Sticky floating chatbot (`bottom: 24px, right: 24px, z-index: 999999`) automatically styled in the subsidiary's accent colors and brand persona, complete with PDF conversation transcript export (`jsPDF`).

---

## 2. Step-by-Step Integration Guide for Co-Developers

### Step 1: Register Brand Config in `src/data/enterpriseConfig.js`

Add your subsidiary entry to `ENTERPRISE_CONFIGS` in `src/data/enterpriseConfig.js`:

```javascript
'your-subsidiary-slug': {
  slug: 'your-subsidiary-slug',
  name: 'Your Subsidiary Name',
  botTitle: 'Your Subsidiary AI',
  accentColor: '#YOUR_ACCENT_HEX',       // e.g., #C49A2A (Gold), #C84A72 (Rose), #19A48A (Teal)
  quickPrompts: [
    'Quick Prompt Option 1',
    'Quick Prompt Option 2',
    'Quick Prompt Option 3',
    'Contact Concierge',
  ],
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
  navTextColor: '#YOUR_TEXT_HEX',        // #FFFFFF for Dark Themes, #1C1814 for Light Themes
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
        <meta name="description" content="Your Subsidiary description..." />
      </Helmet>
      <SubsidiaryApp page={page} setPage={navigate} />
    </>
  );
}
```

---

### Step 4: Verify Header & Chatbot Unification

Ensure the newly mounted route inherits:
1. **`< APG MAIN SITE`** back button in the header top-left.
2. **Universal AI Chatbot** launcher with dynamic accent colors, quick prompts, and PDF download button.
