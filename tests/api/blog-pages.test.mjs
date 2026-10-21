// Crawler HTML for the apex blog pages (api/blog-page.php, served to bots at /blogs[/{slug}] by .htaccess
// rule 0) and the live sitemap of every article (api/blogs-sitemap.php = /sitemap-blogs.xml). Hits PHP
// directly: the .htaccess rewrites need Apache. Uses its own posts (created through the admin API, deleted
// after); admin-blogs.test.mjs adds and removes "qa-" posts in parallel, so list comparisons leave those out.
// The head is checked against src/lib/blogSeo.ts itself (what the SPA renders), loaded with the unit hooks.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as, uid } from '../support/http.mjs';

const SITE = 'https://alphapremiergroup.com';
const PAGE = '/api/blog-page.php';
const DEFAULT_IMAGE = `${SITE}/og-image.jpg`;
const BODY = [
  '<script>alert(1)</script> Opening **bold** and *italic* words.',
  'Second line of the same paragraph.',
  '',
  '## Section <b>two</b>',
  '- First & item',
  '- Second <img src=x onerror=alert(1)>',
  '### Detail',
  'Closing paragraph.',
].join('\n');
const BODY_HTML = '<p>&lt;script&gt;alert(1)&lt;/script&gt; Opening <strong>bold</strong> and <em>italic</em> words. Second line of the same paragraph.</p>\n'
  + '<h2>Section &lt;b&gt;two&lt;/b&gt;</h2>\n<ul><li>First &amp; item</li><li>Second &lt;img src=x onerror=alert(1)&gt;</li></ul>\n'
  + '<h3>Detail</h3>\n<p>Closing paragraph.</p>\n';

const web = new Client();
let editor;
let sa;
let blogSeo;
const ids = [];
let full; // published, swiftclear, every field set
let bare; // published, corporate, no excerpt / cover / read time
let draft;

async function create(body) {
  const res = await editor.post('/api/admin/blogs.php', { json: { category: 'QA News', status: 'published', ...body } });
  assert.equal(res.status, 201, res.text);
  ids.push(res.data.id);
  return (await editor.get(`/api/admin/blogs.php?id=${res.data.id}`)).data.data;
}

before(async () => {
  globalThis.window ??= { location: { hostname: 'localhost' } }; // enterpriseHost.js reads it at import time
  await import('../support/unit-register.mjs');
  ({ blogSeo } = await import('../../src/lib/blogSeo.ts'));
  [editor, sa] = await Promise.all([as('editor'), as('superadmin')]);
  full = await create({
    title: `QA Blog Page ${uid()}`, excerpt: 'QA excerpt with <tags> & "quotes"', content: BODY, enterprise_slug: 'swiftclear',
    published_at: '2025-03-04 05:06:07', cover_image_url: '/assets/alpha-construction/QA Cover.avif', read_time: '7 min read',
  });
  bare = await create({
    title: `QA Bare Page ${uid()}`, excerpt: '', enterprise_slug: 'corporate',
    content: `# Heading\n\n${'Plain **body** words for the description fallback. '.repeat(5)}`,
  });
  draft = await create({ title: `QA Draft Page ${uid()}`, content: 'Draft body.', status: 'draft' });
});
after(async () => {
  for (const id of ids) await sa?.delete(`/api/admin/blogs.php?id=${id}`);
});

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const headOf = (html) => html.slice(0, html.indexOf('</head>'));
/** #prerender only (the shell's own scripts follow it). */
const bodyOf = (html) => {
  const start = html.indexOf('<div id="prerender">');
  return html.slice(start, html.indexOf('</main></div>', start) + '</main></div>'.length);
};
const titleOf = (html) => decode(html.match(/<title>([^<]*)<\/title>/)[1]);
const metaOf = (html, attr, key) => {
  const m = html.match(new RegExp(`<meta data-rh="true" ${attr}="${key}" content="([^"]*)" />`));
  return m && decode(m[1]);
};
const canonicalOf = (html) => html.match(/<link data-rh="true" rel="canonical" href="([^"]*)" \/>/)?.[1] ?? null;
const jsonLdOf = (html) => JSON.parse(html.match(/<script data-rh="true" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
const linkedSlugs = (html) => [...html.matchAll(/<a href="\/blogs\/([a-z0-9-]+)">/g)].map((m) => m[1]);
const stable = (slugs) => [...new Set(slugs)].filter((s) => !s.startsWith('qa-')).sort();
/** The post as the SPA gets it (/api/blogs.php?slug=), shaped as blogSeo() takes it. */
async function articleRow(slug) {
  const row = (await web.get(`/api/blogs.php?slug=${slug}`)).data.data;
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v == null ? '' : String(v)]));
}

describe('blog pages for crawlers', () => {
  it('article: the SPA head (src/lib/blogSeo.ts) exactly, every tag marked for react-helmet-async', async () => {
    for (const post of [full, bare]) {
      const res = await web.get(`${PAGE}?slug=${post.slug}`);
      assert.equal(res.status, 200, post.slug);
      assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
      assert.equal(res.headers.get('cache-control'), 'no-cache');
      assert.match(res.headers.get('vary') || '', /User-Agent/);
      const head = headOf(res.text);
      const seo = blogSeo(await articleRow(post.slug));
      assert.equal(titleOf(head), seo.title);
      assert.equal((head.match(/<title>/g) || []).length, 1);
      assert.equal(canonicalOf(head), `${SITE}${seo.path}`);
      const image = seo.image ?? DEFAULT_IMAGE;
      const expected = {
        'name|description': seo.description, 'property|og:site_name': 'Alpha Premier Group', 'property|og:locale': 'en_PH',
        'property|og:type': 'website', 'property|og:title': seo.title, 'property|og:description': seo.description,
        'property|og:url': `${SITE}${seo.path}`, 'property|og:image': image, 'name|twitter:card': 'summary_large_image',
        'name|twitter:title': seo.title, 'name|twitter:description': seo.description, 'name|twitter:image': image,
      };
      for (const [k, value] of Object.entries(expected)) assert.equal(metaOf(head, ...k.split('|')), value, `${post.slug} ${k}`);
      assert.equal(metaOf(head, 'property', 'og:image:width'), seo.image ? null : '1376', 'size only for the default image');
      assert.deepEqual(jsonLdOf(head), { '@context': 'https://schema.org', '@graph': seo.jsonLd });
      assert.equal((head.match(/name="description"/g) || []).length, 1, 'the shell defaults are gone');
      for (const tag of head.match(/<(meta|link|script)[^>]*>/g)) {
        if (/og:|twitter:|name="description"|rel="canonical"|ld\+json/.test(tag)) assert.ok(tag.includes('data-rh="true"'), tag);
      }
    }
  });

  it('article head values: company title, excerpt, encoded cover, Manila dates, author; body-text description without an excerpt', async () => {
    const head = headOf((await web.get(`${PAGE}?slug=${full.slug}`)).text);
    assert.equal(titleOf(head), `${full.title} | SwiftClear`);
    assert.equal(metaOf(head, 'name', 'description'), 'QA excerpt with <tags> & "quotes"');
    assert.equal(metaOf(head, 'property', 'og:image'), `${SITE}/assets/alpha-construction/QA%20Cover.avif`);
    const [posting, crumbs] = jsonLdOf(head)['@graph'];
    assert.equal(posting['@type'], 'BlogPosting');
    assert.equal(posting.headline, full.title);
    assert.deepEqual(posting.image, [`${SITE}/assets/alpha-construction/QA%20Cover.avif`]);
    assert.equal(posting.datePublished, '2025-03-04T05:06:07+08:00');
    assert.equal(posting.dateModified, `${full.updated_at.replace(' ', 'T')}+08:00`);
    assert.deepEqual(posting.author, { '@type': 'Organization', name: 'SwiftClear', url: 'https://swiftclear.alphapremiergroup.com/' });
    assert.deepEqual(posting.publisher, { '@id': `${SITE}/#organization` });
    assert.equal(posting.mainEntityOfPage, `${SITE}/blogs/${full.slug}`);
    assert.equal(posting.articleSection, 'QA News');
    assert.deepEqual(crumbs.itemListElement.map((i) => [i.position, i.name, i.item]), [
      [1, 'Alpha Premier Group', `${SITE}/`], [2, 'Blogs', `${SITE}/blogs`], [3, full.title, `${SITE}/blogs/${full.slug}`],
    ]);

    const bareHead = headOf((await web.get(`${PAGE}?slug=${bare.slug}`)).text);
    assert.equal(titleOf(bareHead), `${bare.title} | Alpha Premier Group`);
    const description = metaOf(bareHead, 'name', 'description');
    assert.ok(description.startsWith('Heading Plain body words for the description fallback. Plain body'), description);
    assert.ok([...description].length <= 160 && description.endsWith('…'), description);
    assert.equal(metaOf(bareHead, 'property', 'og:image'), DEFAULT_IMAGE);
    assert.equal('image' in jsonLdOf(bareHead)['@graph'][0], false);
  });

  it('article content: h1, company/date/read time, cover, the body as escaped HTML in the allowed tags, related posts', async () => {
    const body = bodyOf((await web.get(`${PAGE}?slug=${full.slug}`)).text);
    assert.ok(body.startsWith('<div id="prerender"><main><nav aria-label="Breadcrumb">'));
    assert.ok(body.includes(`<h1>${esc(full.title)}</h1><p>SwiftClear · March 4, 2025 · 7 min read</p>`));
    assert.ok(body.includes(`<img src="/assets/alpha-construction/QA Cover.avif" alt="${esc(full.title)}" />`));
    assert.ok(body.includes(BODY_HTML), 'body converted like BlogBody.tsx');
    assert.ok(!/<script|<b>|<[^>]*\son\w+=/i.test(body), 'no markup from the post survives');
    const tags = new Set([...body.slice(body.indexOf('<article>'), body.indexOf('</article>')).matchAll(/<([a-z0-9]+)[\s>]/g)].map((m) => m[1]));
    assert.deepEqual([...tags].filter((t) => !['article', 'h1', 'p', 'h2', 'h3', 'ul', 'li', 'strong', 'em', 'img', 'a'].includes(t)), []);
    assert.ok(body.includes('<a href="/blogs">All articles</a>'));

    // Related: the same company's latest published posts first (this one is older than the seeded SwiftClear posts).
    const sameCompany = (await web.get('/api/blogs.php?enterprise=swiftclear&summary=1')).data.data.map((p) => p.slug).filter((s) => s !== full.slug);
    assert.ok(sameCompany.length >= 3, 'the seeded database has SwiftClear posts');
    const related = linkedSlugs(body.slice(body.indexOf('<h2>More articles</h2>')));
    assert.deepEqual(related, sameCompany.slice(0, 3));
  });

  it('index: h1, the /blogs head, a link to every published post with its company, date and excerpt', async () => {
    const res = await web.get(PAGE);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'no-cache');
    const head = headOf(res.text);
    assert.equal(titleOf(head), 'Blogs & News | Alpha Premier Group');
    assert.equal(canonicalOf(head), `${SITE}/blogs`);
    assert.equal(metaOf(head, 'name', 'description'), 'News, real estate insights, and company updates from Alpha Premier Group of Companies and its enterprises.');
    assert.equal(metaOf(head, 'property', 'og:image:width'), '1376');
    assert.ok(!head.includes('ld+json'), 'the SPA list page has no JSON-LD');
    const body = bodyOf(res.text);
    assert.ok(body.startsWith('<div id="prerender"><main><h1>Blogs &amp; News</h1>'));
    const published = (await web.get('/api/blogs.php?summary=1')).data.data.map((p) => p.slug);
    assert.deepEqual(stable(linkedSlugs(body)), stable(published));
    assert.ok(body.includes(`<li><a href="/blogs/${full.slug}">${esc(full.title)}</a> · SwiftClear · March 4, 2025<p>${esc(full.excerpt)}</p></li>`));
    assert.ok(linkedSlugs(body).includes(bare.slug));
    assert.ok(!linkedSlugs(body).includes(draft.slug), 'never a draft');
  });

  it('unknown, draft or malformed slug: 404 noindex without a canonical; writes are 405', async () => {
    for (const q of ['slug=no-such-post-qa', `slug=${draft.slug}`, `slug=${full.slug.toUpperCase()}`, 'slug=', 'slug=..%2Findex', `slug[]=${full.slug}`]) {
      const res = await web.get(`${PAGE}?${q}`);
      assert.equal(res.status, 404, q);
      assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8', q);
      assert.ok(res.text.includes('<meta data-rh="true" name="robots" content="noindex" />'), q);
      assert.equal(canonicalOf(res.text), null, q);
      assert.ok(res.text.includes('<h1>This article isn&#039;t available</h1>') && res.text.includes('href="/blogs"'), q);
    }
    assert.equal((await web.post(PAGE, { json: {} })).status, 405);
    assert.equal((await web.post('/api/blogs-sitemap.php', { json: {} })).status, 405);
  });

  it('sitemap: every published article URL with its last edit as lastmod, never a draft', async () => {
    const res = await web.get('/api/blogs-sitemap.php');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/xml; charset=utf-8');
    assert.ok(res.text.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    const locs = [...res.text.matchAll(/<loc>https:\/\/alphapremiergroup\.com\/blogs\/([a-z0-9-]+)<\/loc>/g)].map((m) => m[1]);
    const published = (await web.get('/api/blogs.php?summary=1')).data.data.map((p) => p.slug);
    assert.deepEqual(stable(locs), stable(published));
    assert.ok(res.text.includes(`<url><loc>${SITE}/blogs/${full.slug}</loc><lastmod>${full.updated_at.replace(' ', 'T')}+08:00</lastmod></url>`));
    assert.ok(locs.includes(bare.slug) && !locs.includes(draft.slug));
    assert.equal((res.text.match(/<url>/g) || []).length, (res.text.match(/<lastmod>/g) || []).length, 'every URL has a lastmod');
  });
});
