import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

// enterpriseHost.js reads window.location at import time (MAIN_SITE_HREF): emulate a local dev tab.
globalThis.window ??= { location: { hostname: 'localhost' } };
let blogSeo, blogCompany, blogArticleUrl, ENTERPRISES;
before(async () => {
  ({ blogSeo, blogCompany, blogArticleUrl } = await import('../../src/lib/blogSeo.ts'));
  ({ ENTERPRISES } = await import('../../src/data/enterprises.js'));
});

const SITE = 'https://alphapremiergroup.com';
const URL_A = `${SITE}/blogs/strategic-leasing`;
const post = (over = {}) => ({
  slug: 'strategic-leasing', title: 'Strategic Office Leasing in Ortigas', excerpt: 'Lease terms for 2026 tenants.',
  content: 'Body.', category: 'Real Estate', enterprise_slug: 'realty', published_at: '2026-10-09 19:06:03',
  updated_at: '2026-10-12 08:00:00', cover_image_url: '/uploads/blogs/cover.webp', read_time: '5 min read', ...over,
});
const codePoints = (s) => [...s].length;

describe('blog article metadata (src/lib/blogSeo.ts)', () => {
  it('canonical path and URL, "{title} | {company}" title, absolute cover image', () => {
    const seo = blogSeo(post());
    assert.equal(seo.path, '/blogs/strategic-leasing');
    assert.equal(blogArticleUrl('strategic-leasing'), URL_A);
    assert.equal(seo.title, 'Strategic Office Leasing in Ortigas | Alpha Premier Realty');
    assert.equal(seo.image, `${SITE}/uploads/blogs/cover.webp`);
  });

  it('company: names from src/data/enterprises.js, own site origin; corporate and unknown slugs are the group', () => {
    for (const { slug, name } of ENTERPRISES.filter((e) => e.slug !== 'corporate')) {
      assert.deepEqual(blogCompany(slug), { name, url: `https://${slug}.alphapremiergroup.com/` }, slug);
    }
    for (const slug of ['corporate', '', 'nowhere']) {
      assert.deepEqual(blogCompany(slug), { name: 'Alpha Premier Group', url: `${SITE}/` }, slug);
    }
    assert.equal(blogSeo(post({ enterprise_slug: 'corporate' })).title, 'Strategic Office Leasing in Ortigas | Alpha Premier Group');
    assert.equal(blogSeo(post({ enterprise_slug: 'swiftclear' })).title, 'Strategic Office Leasing in Ortigas | SwiftClear');
  });

  it('description: the excerpt, else the body as plain prose (markers dropped), else the title', () => {
    assert.equal(blogSeo(post()).description, 'Lease terms for 2026 tenants.');
    const body = '## Why it matters\n\nOffices need **care** and *attention*.\n- Clean desks\n- Fresh  air\r\n\n### Done';
    assert.equal(blogSeo(post({ excerpt: '  ', content: body })).description,
      'Why it matters Offices need care and attention. Clean desks Fresh air Done');
    assert.equal(blogSeo(post({ excerpt: '', content: '' })).description, 'Strategic Office Leasing in Ortigas');
  });

  it('description: at most 160 code points, cut at a word with "…"; headline at most 110', () => {
    const long = `${'Grade-A office leasing ₱ '.repeat(10)}end`;
    const seo = blogSeo(post({ excerpt: long, title: long }));
    assert.ok(codePoints(seo.description) <= 160);
    assert.ok(seo.description.endsWith(' Grade-A…'), seo.description);
    assert.ok(long.startsWith(seo.description.slice(0, -1)));
    const { headline } = seo.jsonLd[0];
    assert.ok(codePoints(headline) <= 110 && headline.endsWith('…'), headline);
    assert.equal(seo.title, `${long} | Alpha Premier Realty`, 'the <title> keeps the full title');
    const exact = 'x'.repeat(160);
    assert.equal(blogSeo(post({ excerpt: exact })).description, exact);
    assert.equal(blogSeo(post({ excerpt: 'y'.repeat(200) })).description, `${'y'.repeat(159)}…`, 'no space: hard cut');
  });

  it('BlogPosting + BreadcrumbList JSON-LD', () => {
    const [posting, crumbs] = blogSeo(post()).jsonLd;
    assert.deepEqual(posting, {
      '@type': 'BlogPosting',
      headline: 'Strategic Office Leasing in Ortigas',
      description: 'Lease terms for 2026 tenants.',
      image: [`${SITE}/uploads/blogs/cover.webp`],
      datePublished: '2026-10-09T19:06:03+08:00',
      dateModified: '2026-10-12T08:00:00+08:00',
      author: { '@type': 'Organization', name: 'Alpha Premier Realty', url: 'https://realty.alphapremiergroup.com/' },
      publisher: { '@id': `${SITE}/#organization` },
      mainEntityOfPage: URL_A,
      articleSection: 'Real Estate',
    });
    assert.deepEqual(crumbs, {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Alpha Premier Group', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${SITE}/blogs` },
        { '@type': 'ListItem', position: 3, name: 'Strategic Office Leasing in Ortigas', item: URL_A },
      ],
    });
  });

  it('dates: Manila time as +08:00; dateModified falls back to datePublished; unparseable dates are left out', () => {
    assert.equal(blogSeo(post({ updated_at: '' })).jsonLd[0].dateModified, '2026-10-09T19:06:03+08:00');
    const undated = blogSeo(post({ published_at: '', updated_at: 'yesterday' })).jsonLd[0];
    assert.equal('datePublished' in undated, false);
    assert.equal('dateModified' in undated, false);
    assert.equal(blogSeo(post({ published_at: '2026-01-02T03:04:05' })).jsonLd[0].datePublished, '2026-01-02T03:04:05+08:00');
  });

  it('cover: site paths encoded like encodeURI, external URLs kept, none = default share image and no JSON-LD image', () => {
    const spaced = blogSeo(post({ cover_image_url: '/assets/alpha-construction/The New Language_blogs.avif' }));
    assert.equal(spaced.image, `${SITE}/assets/alpha-construction/The%20New%20Language_blogs.avif`);
    const external = 'https://images.unsplash.com/photo-1?auto=format&w=1200';
    assert.equal(blogSeo(post({ cover_image_url: external })).image, external);
    const bare = blogSeo(post({ cover_image_url: '' }));
    assert.equal(bare.image, undefined);
    assert.equal('image' in bare.jsonLd[0], false);
  });

  it('category: trimmed; empty leaves articleSection out', () => {
    assert.equal(blogSeo(post({ category: '  Finance ' })).jsonLd[0].articleSection, 'Finance');
    assert.equal('articleSection' in blogSeo(post({ category: '' })).jsonLd[0], false);
  });
});
