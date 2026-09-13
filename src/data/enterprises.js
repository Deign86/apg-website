// Single source of truth for enterprise slugs.
//
// A slug here MUST satisfy all three of these, or blog scoping breaks:
//   1. It is the URL path segment under /subsidiaries/<slug> (see src/App.jsx).
//   2. It is the key used in ENTERPRISE_CONFIGS (src/data/enterpriseConfig.js).
//   3. It is the value stored in blog_posts.enterprise_slug (api/schema.sql).
//
// Before this file existed, five divergent lists were in circulation
// (ApplicantsManager.jsx used `swift-clear`/`88-prime`/`general`, companyData.ts
// used `swift-clear`/`88-prime`, enterpriseConfig.js used `swiftclear`/`88prime`).
// Import from here instead of declaring a new array.

export const CORPORATE_SLUG = 'corporate';

export const ENTERPRISES = [
  { slug: 'corporate',      name: 'Alpha Premier Group' },
  { slug: 'virtual-office', name: 'Virtual Office' },
  { slug: 'realty',         name: 'Alpha Premier Realty' },
  { slug: 'luxe-prime',     name: 'Luxe Prime Realty' },
  { slug: 'swiftclear',     name: 'SwiftClear' },
  { slug: '88prime',        name: '88 Prime' },
  { slug: 'alta-venture',   name: 'Alta Venture' },
  { slug: 'dynamic-tree',   name: 'Dynamic Tree' },
  { slug: 'construction',   name: 'Alpha Premier Construction' },
];

export const ENTERPRISE_SLUGS = ENTERPRISES.map((e) => e.slug);

// Admin list views get a leading pseudo-entry that matches every enterprise.
export const ENTERPRISE_TABS = [
  { slug: 'all', name: 'All Enterprises' },
  ...ENTERPRISES,
];

export function isValidEnterprise(slug) {
  return ENTERPRISE_SLUGS.includes(slug);
}
