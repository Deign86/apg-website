import type { JobPosition } from '../types';
import { ENTERPRISES } from '../data/enterprises';
import { ROOT_DOMAIN, enterpriseOrigin } from './enterpriseHost';

// Each job opening has its own page, https://alphapremiergroup.com/careers/{id}-{title-slug}, whose JobPosting
// JSON-LD puts it in Google's job search. Crawlers get the same title, description and JSON-LD rendered
// server-side by api/careers-page.php from api/lib/JobPages.php, so a change here must be made there too
// (tests/unit/job-seo.test.mjs compares the two).

const SITE = `https://${ROOT_DOMAIN}`;
const MAX_DESCRIPTION = 160;

/** An opening as views/CareersView maps a GET /api/careers.php row; created_at is Manila time, "YYYY-MM-DD HH:MM:SS". */
export type JobOpening = JobPosition & { created_at?: string };

/** The apex careers page's own metadata (RedesignShell), also used by a job page whose opening could not be loaded. */
export const CAREERS_SEO = {
  path: '/careers',
  title: 'Careers | Alpha Premier Group',
  description: 'Explore job openings across Alpha Premier Group companies in real estate, construction, facility services, outsourcing, and more. Apply online.',
};

/** "Marketing Intern" → "marketing-intern": ASCII letters and digits in lowercase, every other run a single '-'. */
export const jobSlug = (title: string) => title.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();

/** The opening's own path: /careers/39-marketing-intern (/careers/39 when the title has no letters or digits). */
export function jobPath(job: Pick<JobOpening, 'id' | 'title'>): string {
  const slug = jobSlug(job.title);
  return `/careers/${job.id}${slug ? `-${slug}` : ''}`;
}

/** The opening id of a job page path (/careers/39, /careers/039-any-slug, a trailing slash allowed), else null. */
export function jobIdFromPath(pathname: string): string | null {
  const match = /^\/careers\/(\d+)(?:-[^/]*)?\/?$/.exec(pathname);
  return match ? match[1].replace(/^0+(?=\d)/, '') : null;
}

// Logos as ENTERPRISE_META in components/Seo.tsx (a .tsx module, which the unit tests cannot import).
const LOGOS = new Map([
  ['virtual-office', '/assets/images/logo2025.png'],
  ['realty', '/images/realty-banner-logo.png'],
  ['luxe-prime', '/assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png'],
  ['swiftclear', '/images/swiftclear-logo.png'],
  ['88prime', '/assets/images/sstcompany-88prime11.png'],
  ['alta-venture', '/assets/images/3. Alta Venture - Logo.png'],
  ['dynamic-tree', '/assets/dynamic-tree/Dynamic_Tree_Logo-1.png'],
  ['construction', '/assets/images/construction.png'],
]);

/** The hiring company: its name (data/enterprises.js), site and logo; 'corporate' or an unknown slug is the group. */
export function hiringOrganization(slug = 'corporate') {
  const logo = LOGOS.get(slug);
  const name = ENTERPRISES.find((e) => e.slug === slug)?.name;
  if (!logo || !name) {
    return { '@type': 'Organization', name: 'Alpha Premier Group of Companies', sameAs: `${SITE}/`, logo: `${SITE}/favicon.png` };
  }
  return { '@type': 'Organization', name, sameAs: `${enterpriseOrigin(slug)}/`, logo: `${SITE}${encodeURI(logo)}` };
}

// The group's office (as ADDRESS in components/Seo.tsx): the place of work of every opening in Ortigas or Pasig.
const HEADQUARTERS = {
  '@type': 'PostalAddress',
  streetAddress: 'Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center',
  addressLocality: 'Pasig City',
  addressRegion: 'Metro Manila',
  addressCountry: 'PH',
};

const EMPLOYMENT_TYPES: [RegExp, string][] = [
  [/full/i, 'FULL_TIME'],
  [/part/i, 'PART_TIME'],
  [/intern|ojt/i, 'INTERN'],
  [/contract|project/i, 'CONTRACTOR'],
  [/temp/i, 'TEMPORARY'],
];

/** As PHP htmlspecialchars(ENT_QUOTES) escapes it. */
const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

/** Line breaks, tabs and repeated spaces become one space; no leading or trailing space. */
const oneLine = (text: string) => text.replace(/[ \t\r\n]+/g, ' ').replace(/^ | $/g, '');

/** At most 160 characters (code points), cut at a word with an ellipsis. */
function truncate(text: string): string {
  const chars = [...text];
  if (chars.length <= MAX_DESCRIPTION) return text;
  const cut = chars.slice(0, MAX_DESCRIPTION - 1).join('');
  const space = cut.lastIndexOf(' ');
  return `${space === -1 ? cut : cut.slice(0, space)}…`;
}

/** "<h3>Heading</h3><ul><li>…</li></ul>" of the non-blank items, or '' when there are none. */
function htmlList(heading: string, items: string[] = []): string {
  const lines = items.map(oneLine).filter(Boolean);
  return lines.length ? `<h3>${heading}</h3><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>` : '';
}

/**
 * `<Seo>` props for an opening's page: canonical path, title, description (≤ 160 characters) and JobPosting JSON-LD.
 * Properties that do not apply are undefined, which the JSON-LD (JSON.stringify) leaves out.
 */
export function jobSeo(job: JobOpening) {
  const org = hiringOrganization(job.enterprise_slug);
  const summary = oneLine(job.description) || `${job.title} at ${org.name}, ${job.location}.`;
  const created = job.created_at ?? '';
  const types = EMPLOYMENT_TYPES.filter(([pattern]) => pattern.test(job.type)).map(([, type]) => type);
  const remote = /remote|work from home|wfh/i.test(job.location);
  const address = /ortigas|pasig/i.test(job.location)
    ? HEADQUARTERS
    : remote ? undefined : { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: 'PH' };
  return {
    path: jobPath(job),
    title: `${job.title} – ${org.name} | Careers`,
    description: truncate(summary),
    jsonLd: [{
      '@type': 'JobPosting',
      title: job.title,
      description: `<p>${escapeHtml(summary)}</p>${htmlList('Responsibilities', job.responsibilities)}${htmlList('Requirements', job.requirements)}`,
      identifier: { '@type': 'PropertyValue', name: org.name, value: String(job.id) },
      datePosted: /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(created) ? `${created.replace(' ', 'T')}+08:00` : undefined,
      employmentType: types.length > 1 ? types : types[0],
      hiringOrganization: org,
      jobLocation: address && { '@type': 'Place', address },
      jobLocationType: remote ? 'TELECOMMUTE' : undefined,
      applicantLocationRequirements: remote ? { '@type': 'Country', name: 'Philippines' } : undefined,
      directApply: true,
    }],
  };
}
