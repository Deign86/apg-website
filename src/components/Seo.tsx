import { Helmet } from 'react-helmet-async';
import { ENTERPRISES } from '../data/enterprises';
import { ROOT_DOMAIN, enterpriseOrigin } from '../lib/enterpriseHost';

// Single source of per-page head metadata (title, description, canonical, Open Graph,
// Twitter, robots, JSON-LD). Canonicals are absolute and fixed per page: apex pages use
// https://alphapremiergroup.com/..., enterprise pages use their own subdomain, so the
// value is identical whether the SPA is reached via the apex path or the subdomain.

const SITE_ORIGIN = `https://${ROOT_DOMAIN}`;
const SITE_NAME = 'Alpha Premier Group';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-image.jpg`; // 1376x768
const ORG_ID = `${SITE_ORIGIN}/#organization`;

// Contact data as rendered in the public footers / contact page.
const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center',
  addressLocality: 'Pasig City',
  addressRegion: 'Metro Manila',
  addressCountry: 'PH',
};
const TELEPHONE = '+63 915 888 9482';
const EMAIL = 'contact@alphapremiergroup.com';
const SOCIALS = [
  'https://www.facebook.com/alphapremiergroup',
  'https://www.instagram.com/alphapremiergroup/',
  'https://www.tiktok.com/@alphapremierr',
  'https://www.linkedin.com/company/alpha-premier-group',
];

export type EnterpriseSlug =
  | 'realty' | 'luxe-prime' | 'swiftclear' | '88prime'
  | 'alta-venture' | 'dynamic-tree' | 'construction' | 'virtual-office';
export type EnterprisePage = 'home' | 'services' | 'blogs' | 'careers' | 'inquire';

interface EnterpriseMeta {
  title: string;
  description: string;
  /** Short phrase used in sub-page descriptions. */
  focus: string;
  logo: string;
  /** Sub-pages that have their own URL (others are in-page state and canonicalize to home). */
  routed: EnterprisePage[];
  schemaType: 'RealEstateAgent' | 'Organization';
  sameAs?: string[];
}

const REALTY_SOCIALS = [
  'https://www.facebook.com/alphapremierRealty',
  'https://www.instagram.com/alphapremier_rec/',
  'https://www.tiktok.com/@alphapremierr',
];

const ENTERPRISE_META: Record<EnterpriseSlug, EnterpriseMeta> = {
  realty: {
    title: 'Alpha Premier Realty | Commercial Real Estate & Brokerage',
    description: 'Alpha Premier Realty is a property brokerage and investment advisory firm in the Philippines, specializing in commercial high-rises, logistics warehouses, and luxury residences.',
    focus: 'commercial, industrial, and residential property brokerage',
    logo: '/images/realty-banner-logo.png',
    routed: ['inquire'],
    schemaType: 'RealEstateAgent',
    sameAs: REALTY_SOCIALS,
  },
  'luxe-prime': {
    title: 'Luxe Prime Realty | Luxury Estates & Residences',
    description: 'Luxe Prime Realty — where prestige meets practicality. Co-managed subleasing, end-to-end property administration, and tailored leasing strategies.',
    focus: 'co-managed subleasing and end-to-end property administration',
    logo: '/assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png',
    routed: ['services', 'blogs', 'careers', 'inquire'],
    schemaType: 'RealEstateAgent',
    sameAs: REALTY_SOCIALS,
  },
  swiftclear: {
    title: 'SwiftClear | Facility & Cleaning Services',
    description: 'SwiftClear provides professional facility cleaning, hospital-standard disinfection, pest control management, and aircon maintenance.',
    focus: 'facility cleaning, disinfection, pest control, and aircon maintenance',
    logo: '/images/swiftclear-logo.png',
    routed: ['inquire'],
    schemaType: 'Organization',
  },
  '88prime': {
    title: '88 Prime Consumer Goods Trading | B2B Supplies',
    description: '88 Prime Consumer Goods Trading — Supplying Smarter, Delivering Better. B2B corporate supplies, industrial PVC/WPC panels, and HVAC solutions.',
    focus: 'B2B corporate supplies, PVC/WPC panels, and HVAC solutions',
    logo: '/assets/images/sstcompany-88prime11.png',
    routed: ['services', 'blogs', 'careers', 'inquire'],
    schemaType: 'Organization',
  },
  'alta-venture': {
    title: 'Alta Venture | Global BPO & Offshoring Solutions',
    description: 'Alta Venture Outsourcing — BPO services, fractional CFO, talent & HR, IT, customer experience, back-office operations, and risk & compliance solutions.',
    focus: 'BPO, fractional CFO, talent & HR, IT, and CX operations',
    logo: '/assets/images/3. Alta Venture - Logo.png',
    routed: ['services', 'blogs', 'careers', 'inquire'],
    schemaType: 'Organization',
  },
  'dynamic-tree': {
    title: 'Dynamic Tree | Talent Management & Modeling',
    description: 'Dynamic Tree — talent management, commercial modeling, brand ambassadorship, and creative event hosting under Alpha Premier Group.',
    focus: 'talent management, commercial modeling, and event hosting',
    logo: '/assets/dynamic-tree/Dynamic_Tree_Logo-1.png',
    routed: ['inquire'],
    schemaType: 'Organization',
  },
  construction: {
    title: 'Alpha Premier Construction | Commercial Fit-Outs & Civil Works',
    description: 'Alpha Premier Construction — architectural fit-out, civil works, engineering & MEP, aircon supply & installation, and on-demand material sourcing.',
    focus: 'fit-outs, civil works, MEP, and construction materials supply',
    logo: '/assets/images/construction.png',
    routed: ['inquire'],
    schemaType: 'Organization',
  },
  'virtual-office': {
    title: 'Virtual Office in Ortigas Center | Alpha Premier Group',
    description: 'SEC & DTI compliant business addresses, mail handling, and meeting facilities at Tektite East Tower, Ortigas Center, Pasig City.',
    focus: 'virtual office addresses and meeting facilities',
    logo: '/assets/images/logo2025.png',
    routed: [],
    schemaType: 'Organization',
  },
};

function isEnterpriseSlug(slug: string): slug is EnterpriseSlug {
  return Object.prototype.hasOwnProperty.call(ENTERPRISE_META, slug);
}

function enterpriseName(slug: EnterpriseSlug): string {
  return ENTERPRISES.find((e) => e.slug === slug)?.name ?? SITE_NAME;
}

const PAGE_LABEL: Record<Exclude<EnterprisePage, 'home'>, string> = {
  services: 'Services',
  blogs: 'Blogs & News',
  careers: 'Careers',
  inquire: 'Inquire',
};

function enterprisePageDescription(page: EnterprisePage, name: string, focus: string): string {
  switch (page) {
    case 'services': return `Explore ${name} services: ${focus}. An Alpha Premier Group company in Ortigas Center, Pasig City.`;
    case 'blogs': return `News, insights, and updates from ${name}, an Alpha Premier Group company.`;
    case 'careers': return `Open positions and career opportunities at ${name}, part of Alpha Premier Group of Companies.`;
    case 'inquire': return `Contact ${name} to schedule a consultation or ask about ${focus}.`;
    default: return '';
  }
}

const absolute = (src: string) => (src.startsWith('http') ? src : `${SITE_ORIGIN}${encodeURI(src)}`);

export const ORGANIZATION_JSONLD = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Alpha Premier Group of Companies',
  alternateName: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  logo: absolute('/favicon.png'),
  email: EMAIL,
  telephone: TELEPHONE,
  address: ADDRESS,
  sameAs: SOCIALS,
  subOrganization: (Object.keys(ENTERPRISE_META) as EnterpriseSlug[]).map((slug) => ({
    '@type': ENTERPRISE_META[slug].schemaType,
    '@id': `${enterpriseOrigin(slug)}/#organization`,
    name: enterpriseName(slug),
    url: `${enterpriseOrigin(slug)}/`,
  })),
};

export const WEBSITE_JSONLD = {
  '@type': 'WebSite',
  '@id': `${SITE_ORIGIN}/#website`,
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-PH',
};

function enterpriseJsonLd(slug: EnterpriseSlug) {
  const meta = ENTERPRISE_META[slug];
  return {
    '@type': meta.schemaType,
    '@id': `${enterpriseOrigin(slug)}/#organization`,
    name: enterpriseName(slug),
    description: meta.description,
    url: `${enterpriseOrigin(slug)}/`,
    logo: absolute(meta.logo),
    ...(meta.schemaType === 'RealEstateAgent' ? { image: absolute(meta.logo) } : {}),
    email: EMAIL,
    telephone: TELEPHONE,
    address: ADDRESS,
    parentOrganization: { '@id': ORG_ID, name: 'Alpha Premier Group of Companies', url: `${SITE_ORIGIN}/` },
    ...(meta.sameAs ? { sameAs: meta.sameAs } : {}),
  };
}

interface SeoProps {
  title: string;
  description: string;
  /** Path on the canonical host, e.g. '/blogs'. Defaults to '/'. */
  path?: string;
  /** Enterprise subdomain that owns the page; omit for apex (corporate) pages. */
  enterprise?: EnterpriseSlug;
  image?: string;
  noindex?: boolean;
  /** Schema.org nodes; emitted as one @graph block. */
  jsonLd?: object[];
}

export default function Seo({ title, description, path = '/', enterprise, image, noindex, jsonLd }: SeoProps) {
  const origin = enterprise ? enterpriseOrigin(enterprise) : SITE_ORIGIN;
  const url = `${origin}${path}`;
  const img = image ? absolute(image) : DEFAULT_IMAGE;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : <link rel="canonical" href={url} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_PH" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {!noindex && <meta property="og:url" content={url} />}
      <meta property="og:image" content={img} />
      {!image && <meta property="og:image:width" content="1376" />}
      {!image && <meta property="og:image:height" content="768" />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {jsonLd && jsonLd.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLd })}
        </script>
      )}
    </Helmet>
  );
}

/** Metadata for an enterprise page. Sub-pages without their own URL canonicalize to the enterprise home. */
export function EnterpriseSeo({ slug, page = 'home' }: { slug: string; page?: EnterprisePage }) {
  if (!isEnterpriseSlug(slug)) return null;
  const meta = ENTERPRISE_META[slug];
  const name = enterpriseName(slug);
  if (page === 'home' || !(page in PAGE_LABEL)) {
    return <Seo enterprise={slug} title={meta.title} description={meta.description} jsonLd={[enterpriseJsonLd(slug)]} />;
  }
  return (
    <Seo
      enterprise={slug}
      path={meta.routed.includes(page) ? `/${page}` : '/'}
      title={`${PAGE_LABEL[page]} | ${name}`}
      description={enterprisePageDescription(page, name, meta.focus)}
    />
  );
}
