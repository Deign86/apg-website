// Per-enterprise config dict.
// Each entry configures the shared EnterpriseHeader and EnterpriseFooter.
// Co-devs adding a new enterprise: add an entry here. The slug MUST match
// the URL path segment under /subsidiaries/<slug>.

export const ENTERPRISE_CONFIGS = {
  'luxe-prime': {
    slug: 'luxe-prime',
    name: 'Luxe Prime Realty',
    logoSrc: '/assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png',
    logoAlt: 'Luxe Prime Realty',
    // Internal page keys the Figma App uses. Each Label = a button in the header.
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    accentColor: '#C49A2A',
    navTextColor: '#FFFFFF',
    scrolledBg: 'rgba(10, 10, 10, 0.95)',
    mobileNavBg: 'rgba(10, 10, 10, 0.98)',
    // Footer config
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
    accentColor: '#C84A72',
    navTextColor: '#1C1814',
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
    name: 'Alta Venture',
    logoSrc: '/assets/images/viber1.png',
    logoAlt: 'Alpha Premier Group',
    // Override behavior for the navbar logo click. By default EnterpriseHeader
    // treats the logo as the enterprise's own and navigates to the 'home' key.
    // For Alta Venture we keep the APG logo in the navbar (per the brand's
    // earlier decision) and route the click to the APG home route ('/').
    // Set logoOnClick to a literal URL; EnterpriseHeader will use
    // window.location.href = logoOnClick when this field is present and non-empty.
    logoOnClick: '/',
    navItems: [
      { key: 'home',     label: 'Home' },
      { key: 'services', label: 'Services' },
      { key: 'blogs',    label: 'Blogs' },
      { key: 'careers',  label: 'Careers' },
      { key: 'inquire',  label: 'Inquire' },
    ],
    inquireLabel: 'Inquire',
    inquireKey: 'inquire',
    accentColor: '#19a48a',
    navTextColor: '#FFFFFF',
    scrolledBg: 'rgba(8, 31, 42, 0.96)',
    mobileNavBg: 'rgba(8, 31, 42, 0.98)',
    footer: {
      logoSrc: '/assets/alta-venture/3._Alta_Venture_-_Logo.png',
      logoAlt: 'Alta Venture Outsourcing',
      blurb: 'Alta Venture Outsourcing — premier BPO services: fractional CFO, talent & HR, IT, customer experience, back-office operations, and risk & compliance for growing businesses.',
      navItemKeys: ['home', 'services', 'blogs', 'careers', 'inquire'],
      connect: {
        email: 'hello@altaventureoutsourcing.com',
        phone: '+1 (800) ALTA-BIZ',
        addressLines: [
          'Ortigas Center, Pasig City,',
          'Metro Manila, Philippines',
        ],
      },
      socials: [
        { label: 'Facebook',  href: '#', icon: 'fa-facebook-f' },
        { label: 'Instagram', href: '#', icon: 'fa-instagram' },
        { label: 'TikTok',    href: '#', icon: 'fa-tiktok' },
      ],
      copyright: '© 2026 Alta Venture Outsourcing. All rights reserved.',
    },
  },
};

/**
 * Returns the enterprise config for the current location, or null if not on
 * an enterprise route. Tries both forms:
 *   - '/subsidiaries/<slug>/...'         (preferred, e.g. /subsidiaries/luxe-prime)
 *   - '/<slug>' or '/<slug>/...'         (short-form, e.g. /luxe-prime /alta-venture)
 *
 * Example:
 *   '/subsidiaries/alta-venture/services' -> ENTERPRISE_CONFIGS['alta-venture']
 *   '/alta-venture'                       -> ENTERPRISE_CONFIGS['alta-venture']
 */
export function getEnterpriseConfig(pathname) {
  if (typeof pathname !== 'string') return null;
  // Prefer the /subsidiaries/<slug> form.
  let m = /^\/subsidiaries\/([a-z0-9-]+)/i.exec(pathname);
  if (m) return ENTERPRISE_CONFIGS[m[1]] || null;
  // Fallback to bare /<slug> (must NOT collide with APG main routes).
  m = /^\/([a-z0-9-]+)(?:[/?#]|$)/i.exec(pathname);
  if (m) return ENTERPRISE_CONFIGS[m[1]] || null;
  return null;
}
