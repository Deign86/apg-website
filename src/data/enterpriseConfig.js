// Per-enterprise config dict.
// Each entry configures the shared EnterpriseHeader and EnterpriseFooter.
// Co-devs adding a new enterprise: add an entry here. The slug MUST match
// the URL path segment under /subsidiaries/<slug>.

export const ENTERPRISE_CONFIGS = {
  'luxe-prime': {
    slug: 'luxe-prime',
    name: 'Luxe Prime Realty',
    botTitle: 'Luxe Prime AI',
    accentColor: '#C49A2A',
    quickPrompts: [
      'Co-Managed Subleasing',
      'End-to-End Property Admin',
      'Private Portfolio',
      'Contact Concierge',
    ],
    logoSrc: '/assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png',
    logoAlt: 'Luxe Prime Realty',
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    navTextColor: '#F5F0E8',
    initialBg: 'rgba(10, 10, 10, 0.88)',
    scrolledBg: 'rgba(10, 10, 10, 0.96)',
    mobileNavBg: 'rgba(10, 10, 10, 0.98)',
    footer: {
      logoSrc: '/assets/luxe-prime/alpha_premier_logo.png',
      logoAlt: 'Alpha Premier Group',
      blurb: 'Luxe Prime Realty — where prestige meets practicality.',
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
  },
  'dynamic-tree': {
    slug: 'dynamic-tree',
    name: 'Dynamic Tree',
    botTitle: 'Dynamic Tree AI',
    accentColor: '#C84A72',
    quickPrompts: [
      'Talent & Modeling',
      'Video Production',
      'Casting Calls',
      'Contact Concierge',
    ],
    logoSrc: '/assets/dynamic-tree/Dynamic_Tree_Logo-1.png',
    logoAlt: 'Dynamic Tree Modeling & Talent',
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    navTextColor: '#1C1814',
    initialBg: 'rgba(255, 255, 255, 0.92)',
    scrolledBg: 'rgba(253, 244, 247, 0.96)',
    mobileNavBg: 'rgba(253, 244, 247, 0.98)',
    footer: {
      logoSrc: '/assets/dynamic-tree/Dynamic_Tree_Logo-1.png',
      logoAlt: 'Dynamic Tree',
      blurb: 'Dynamic Tree — Premier talent management, commercial modeling, and brand ambassadorship.',
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
  },
  'alta-venture': {
    slug: 'alta-venture',
    name: 'Alta Venture Outsourcing',
    botTitle: 'Alta Venture AI',
    accentColor: '#19A48A',
    quickPrompts: [
      'Virtual CFO & Finance',
      'Talent & HR Solutions',
      'IT & CX Operations',
      'Inquire Services',
    ],
    logoSrc: '/assets/images/viber1.png',
    logoAlt: 'Alta Venture Outsourcing',
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    navTextColor: '#F5F0E8',
    initialBg: 'transparent',
    scrolledBg: 'rgba(8, 38, 54, 0.96)',
    mobileNavBg: 'rgba(8, 38, 54, 0.98)',
  },
  'construction': {
    slug: 'construction',
    name: 'Alpha Premier Construction',
    botTitle: 'Construction AI',
    accentColor: '#C5A059',
    quickPrompts: [
      'General Contracting',
      'Materials Supply',
      'Project Portfolio',
      'Contact Team',
    ],
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    navTextColor: '#F5F0E8',
    initialBg: 'transparent',
    scrolledBg: 'rgba(10, 10, 10, 0.95)',
    mobileNavBg: 'rgba(10, 10, 10, 0.98)',
  },
  'realty': {
    slug: 'realty',
    name: 'Alpha Premier Realty',
    botTitle: 'Alpha Realty AI',
    accentColor: '#C5A85C',
    logoSrc: '/images/realty-banner-logo.png',
    logoAlt: 'Alpha Premier Realty',
    quickPrompts: [
      'Residential Property',
      'Commercial Spaces',
      'Industrial Listings',
      'Schedule Callback',
    ],
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    navTextColor: '#F5F0E8',
    initialBg: 'transparent',
    scrolledBg: 'rgba(10, 10, 10, 0.95)',
    mobileNavBg: 'rgba(10, 10, 10, 0.98)',
    footer: {
      logoSrc: '/images/realty-banner-logo.png',
      logoAlt: 'Alpha Premier Realty',
      blurb: 'Alpha Premier Realty — setting standard in premium brokerage, logistics hubs, and commercial investments.',
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
  },
  'swiftclear': {
    slug: 'swiftclear',
    name: 'SwiftClear Facility & Cleaning',
    botTitle: 'SwiftClear AI',
    accentColor: '#00B4D8',
    logoSrc: '/images/swiftclear-logo.png',
    logoAlt: 'SwiftClear Facility & Cleaning Services',
    quickPrompts: [
      'Disinfection & Sanitation',
      'Aircon Cleaning & Repair',
      'Pest Control Service',
      'Post-Construction Clean',
      'Schedule Callback',
    ],
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    navTextColor: '#000F98',
    initialBg: 'transparent',
    scrolledBg: 'rgba(10, 33, 96, 0.94)',
    mobileNavBg: 'rgba(10, 33, 96, 0.98)',
    footer: {
      logoSrc: '/images/swiftclear-logo.png',
      logoAlt: 'SwiftClear Facility & Cleaning Services',
      blurb: 'SwiftClear — professional-grade cleaning, hospital-standard disinfection, pest management, and aircon maintenance.',
      navItemKeys: ['home', 'services', 'blogs', 'careers'],
      connect: {
        email: 'contact@swiftclear.com',
        phone: '0915 888 9482 / 02 8 650 2540',
        addressLines: [
          'Unit 3104, Philippine Stock Exchange Centre,',
          'Tektite East Tower, Exchange Road,',
          'Ortigas Center, Pasig City',
        ],
      },
      socials: [
        { label: 'Facebook', href: 'https://www.facebook.com/alphapremiergroup', icon: 'fa-facebook-f' },
        { label: 'Instagram', href: 'https://www.instagram.com/alphapremiergroup/', icon: 'fa-instagram' },
      ],
      copyright: '© 2026 Alpha Premier Group of Companies OPC. All rights reserved.',
    },
  },
  '88prime': {
    slug: '88prime',
    name: '88 Prime',
    botTitle: '88 Prime AI',
    accentColor: '#D4AF37',
    quickPrompts: [
      'Corporate Services',
      'Business Advisory',
      'Specialized Consulting',
      'Contact Team',
    ],
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    navTextColor: '#F5F0E8',
    initialBg: 'transparent',
    scrolledBg: 'rgba(10, 10, 10, 0.95)',
    mobileNavBg: 'rgba(10, 10, 10, 0.98)',
  },
};

export const DEFAULT_ENTERPRISE_CONFIG = {
  slug: 'apg-main',
  name: 'Alpha Premier Group',
  botTitle: 'Alpha Premier AI',
  accentColor: '#C5A059',
  quickPrompts: [
    'Properties & Realty',
    'Virtual Office Ortigas',
    'Careers & Openings',
    'Contact Details',
  ],
};

/**
 * Returns the enterprise config for the current location, or DEFAULT_ENTERPRISE_CONFIG if on
 * main routes. Determined by pathname matching.
 */
export function getEnterpriseConfig(pathname) {
  const cleanPath = (pathname || '').replace(/\/$/, '');
  const match = /^\/(?:subsidiaries\/)?([a-z0-9-]+)/i.exec(cleanPath);
  if (!match) return DEFAULT_ENTERPRISE_CONFIG;
  return ENTERPRISE_CONFIGS[match[1]] || DEFAULT_ENTERPRISE_CONFIG;
}
