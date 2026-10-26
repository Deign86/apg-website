// Every public route the browser suites visit. In local/dev routing an enterprise site lives under
// its base path (production serves the same paths from <slug>.alphapremiergroup.com).
export const ENTERPRISE_SITES = [
  { slug: 'virtual-office', name: 'Virtual Office', base: '/virtual-office', sections: [] },
  { slug: 'realty', name: 'Alpha Premier Realty', base: '/subsidiaries/realty', sections: ['services', 'blogs', 'careers', 'inquire', 'properties'] },
  { slug: 'luxe-prime', name: 'Luxe Prime Realty', base: '/subsidiaries/luxe-prime', sections: ['services', 'blogs', 'careers', 'inquire'] },
  { slug: 'swiftclear', name: 'SwiftClear', base: '/subsidiaries/swiftclear', sections: ['services', 'blogs', 'careers', 'inquire'] },
  { slug: '88prime', name: '88 Prime', base: '/subsidiaries/88prime', sections: ['services', 'blogs', 'careers', 'inquire'] },
  { slug: 'alta-venture', name: 'Alta Venture', base: '/subsidiaries/alta-venture', sections: ['services', 'blogs', 'careers', 'inquire'] },
  { slug: 'dynamic-tree', name: 'Dynamic Tree', base: '/subsidiaries/dynamic-tree', sections: ['services', 'blogs', 'careers', 'inquire'] },
  { slug: 'construction', name: 'Alpha Premier Construction', base: '/subsidiaries/construction', sections: ['services', 'blogs', 'careers', 'inquire'] },
];

export const APEX_ROUTES = [
  '/', '/enterprises', '/careers', '/careers/apply?job=general', '/blogs', '/inquire', '/contact', '/pay', '/privacy', '/terms',
];

/** Unknown paths render the 404 page (with its own h1), not a blank screen. */
export const NOT_FOUND_ROUTES = ['/no-such-page-qa', '/subsidiaries/no-such-company'];

export const PUBLIC_ROUTES = [
  ...APEX_ROUTES,
  ...ENTERPRISE_SITES.flatMap((s) => [s.base, ...s.sections.map((section) => `${s.base}/${section}`)]),
];

/** Checked on the Vite dev server too (dev-only module loading and the /api proxy rules). */
export const DEV_ROUTES = ['/', '/subsidiaries/realty', '/subsidiaries/alta-venture/careers', '/virtual-office'];
PUBLIC_ROUTES.push('/blogs/realty-strategic-leasing-guide-2026'); // a blog article's own page (post seeded by api/schema.sql)
