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
  // Other enterprises will be added here by your co-devs:
  // 'realty': { ... },
  // 'construction': { ... },
  // 'swiftclear': { ... },
  // 'dynamic-tree': { ... },
  // 'alta-venture': { ... },
  // '88prime': { ... },
};

/**
 * Returns the enterprise config for the current location, or null if not on
 * an enterprise route. Determined by the first two segments of pathname.
 * Example: '/subsidiaries/luxe-prime/anything' -> ENTERPRISE_CONFIGS['luxe-prime']
 */
export function getEnterpriseConfig(pathname) {
  const match = /^\/subsidiaries\/([a-z0-9-]+)/i.exec(pathname || '');
  if (!match) return null;
  return ENTERPRISE_CONFIGS[match[1]] || null;
}
