import { ENTERPRISES } from '../data/enterprises';
import { ROOT_DOMAIN, enterpriseOrigin } from './enterpriseHost';

// Head metadata for a blog article's own page, https://alphapremiergroup.com/blogs/{slug} (every
// company's posts live on the apex). Crawlers get the same title, description, image and JSON-LD
// from api/blog-page.php, so a change here must be made there too.

const SITE = `https://${ROOT_DOMAIN}`;
const MAX_DESCRIPTION = 160;
const MAX_HEADLINE = 110;

/** A published post as /api/blogs.php?slug= returns it, missing values as ''. */
export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  enterprise_slug: string;
  published_at: string;
  updated_at: string;
  cover_image_url: string;
  read_time: string;
}

type JsonLd = string | number | JsonLd[] | { [key: string]: JsonLd };

export const blogArticleUrl = (slug: string) => `${SITE}/blogs/${slug}`;

/** The company a post belongs to, named as in src/data/enterprises.js; an unknown slug is the group. */
export function blogCompany(slug: string): { name: string; url: string } {
  const company = ENTERPRISES.find((e) => e.slug === slug);
  return company && company.slug !== 'corporate'
    ? { name: company.name, url: `${enterpriseOrigin(company.slug)}/` }
    : { name: 'Alpha Premier Group', url: `${SITE}/` };
}

/** Admin text as one line of prose: heading / "- " markers and **bold** / *italic* marks dropped. */
const plain = (text: string) => text
  .replace(/^[ \t]*(?:#{1,3}|-) /gm, '')
  .replace(/\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g, '$1$2')
  .replace(/[ \t\r\n]+/g, ' ')
  .replace(/^ | $/g, '');

/** At most `max` characters (code points), cut at a word with '…'. */
function clip(text: string, max: number): string {
  const chars = [...text];
  if (chars.length <= max) return text;
  const cut = chars.slice(0, max - 1).join('');
  const space = cut.lastIndexOf(' ');
  return `${space === -1 ? cut : cut.slice(0, space)}…`;
}

/** A stored date-time ("2026-10-09 19:06:03", Manila wall-clock time) as ISO 8601 +08:00; '' otherwise. */
const manilaIso = (value: string) => {
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/.exec(value);
  return m ? `${m[1]}T${m[2]}+08:00` : '';
};

/** Same rule as Seo.tsx: site paths become absolute on the apex. */
const absolute = (src: string) => (src.startsWith('http') ? src : `${SITE}${encodeURI(src)}`);

/** Leaves out keys whose value is empty ('' or []). */
const compact = (node: Record<string, JsonLd>): Record<string, JsonLd> =>
  Object.fromEntries(Object.entries(node).filter(([, v]) => v !== '' && !(Array.isArray(v) && v.length === 0)));

/** `<Seo>` props for an article: canonical path, title, description, cover image, BlogPosting + BreadcrumbList. */
export function blogSeo(a: BlogArticle) {
  const url = blogArticleUrl(a.slug);
  const company = blogCompany(a.enterprise_slug);
  const description = clip(plain(a.excerpt) || plain(a.content) || a.title, MAX_DESCRIPTION);
  const image = a.cover_image_url ? absolute(a.cover_image_url) : undefined; // none: the default og-image
  const published = manilaIso(a.published_at);
  const crumbs: [string, string][] = [['Alpha Premier Group', `${SITE}/`], ['Blogs', `${SITE}/blogs`], [a.title, url]];
  return {
    path: `/blogs/${a.slug}`,
    title: `${a.title} | ${company.name}`,
    description,
    image,
    jsonLd: [
      compact({
        '@type': 'BlogPosting',
        headline: clip(a.title, MAX_HEADLINE),
        description,
        image: image ? [image] : [],
        datePublished: published,
        dateModified: manilaIso(a.updated_at) || published,
        author: { '@type': 'Organization', name: company.name, url: company.url },
        publisher: { '@id': `${SITE}/#organization` },
        mainEntityOfPage: url,
        articleSection: a.category.trim(),
      }),
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
      },
    ],
  };
}
