// Enterprise subdomains: <slug>.alphapremiergroup.com serves the same SPA as the apex.
// The router keeps the in-app paths (/subsidiaries/<slug>/..., /virtual-office) that every
// enterprise component already links to and checks; only the address bar is clean.
// Any other host (Vercel previews, localhost) keeps plain path-based routing.
import { ENTERPRISE_SLUGS } from '../data/enterprises';

export const ROOT_DOMAIN = 'alphapremiergroup.com';
const SUBDOMAIN_SLUGS = ENTERPRISE_SLUGS.filter((slug) => slug !== 'corporate');

export function basePathFor(slug) {
  return slug === 'virtual-office' ? '/virtual-office' : `/subsidiaries/${slug}`;
}

/** Enterprise slug served by this hostname, or null on the apex/www/other hosts. */
export function hostEnterprise(hostname = window.location.hostname) {
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return null;
  const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
  return SUBDOMAIN_SLUGS.includes(sub) ? sub : null;
}

export function isProductionHost(hostname = window.location.hostname) {
  return hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`);
}

/** Splits an in-app path into { slug, rest } when it belongs to an enterprise, else null. */
export function enterpriseFromPath(pathname) {
  for (const slug of SUBDOMAIN_SLUGS) {
    const base = basePathFor(slug);
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      return { slug, rest: pathname.slice(base.length) || '/' };
    }
  }
  return null;
}

/** Link target for "back to the APG main site" — the apex when on an enterprise subdomain. */
export const MAIN_SITE_HREF = hostEnterprise() ? `https://${ROOT_DOMAIN}/` : '/';

export function enterpriseOrigin(slug) {
  return `https://${slug}.${ROOT_DOMAIN}`;
}
