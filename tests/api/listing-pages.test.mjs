// Crawler HTML for the Realty listing and browse pages (api/properties-page.php, served to bots at
// /properties[/APR-… | /{type}-for-{deal}[/{area}]] by .htaccess rule 0) and the live listings sitemap
// (api/listings-sitemap.php = /sitemap-listings.xml). Hits PHP directly: the .htaccess rewrites need Apache.
// Expectations use the local QA fixture listings; the last three refs are toggled by admin-listings.test.mjs
// in parallel, so set comparisons leave them out. No fixture browse page has the 3 listings that make it
// indexable, so that path runs the same scripts over a synthetic feed (last describe).
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client, as } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';
import { php } from '../support/stack.mjs';

const FEED = `${ROOT}/api/data/listings.generated.json`;
const fixture = fs.existsSync(FEED) && fs.readFileSync(FEED, 'utf8').includes('"APR-A0A000"');
const skip = !fixture && 'needs the local QA listings fixture (APR-A0A000..09) in api/data/listings.generated.json';
const REALTY = 'https://realty.alphapremiergroup.com';
const PAGE = '/api/properties-page.php';
const DEFAULTS = { hidden: false, featured: false, sort_order: null, price_override: null, note: null };
const HIDE_REF = 'APR-A0A004';
const CRAFTED_REF = 'APR-A0A002';
const web = new Client();
let editor;
let touched = new Set();

before(async () => {
  if (skip) return;
  editor = await as('editor');
  touched = new Set(JSON.parse(fs.readFileSync(FEED, 'utf8')).listings.slice(-3).map((l) => l.ref));
});
after(async () => {
  for (const ref of [HIDE_REF, CRAFTED_REF]) await editor?.put('/api/admin/listings.php', { json: { ref, ...DEFAULTS } });
});

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const headOf = (html) => html.slice(0, html.indexOf('</head>'));
const titleOf = (html) => decode(html.match(/<title>([^<]*)<\/title>/)[1]);
const metaOf = (html, attr, key) => {
  const m = html.match(new RegExp(`<meta data-rh="true" ${attr}="${key}" content="([^"]*)" />`));
  return m && decode(m[1]);
};
const jsonLdOf = (html) => JSON.parse(html.match(/<script data-rh="true" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
const stable = (refs) => [...new Set(refs)].filter((r) => !touched.has(r)).sort();
const linkedRefs = (html) => [...html.matchAll(/href="https:\/\/realty\.alphapremiergroup\.com\/properties\/(APR-[0-9A-F]{6})"/g)].map((m) => m[1]);
const hubLinks = (html) => [...html.matchAll(/<li><a href="(\/properties\/[^"]+)">/g)].map((m) => m[1]);
const bodyOf = (html) => html.slice(html.indexOf('<div id="prerender">'));
const crumbsOf = (html) => jsonLdOf(html)['@graph'].find((n) => n['@type'] === 'BreadcrumbList').itemListElement.map((i) => [i.position, i.name, i.item]);
const publicRefs = async () => (await web.get('/api/listings.php')).data.data.map((l) => l.ref);
const setOverride = async (ref, patch) => {
  const res = await editor.put('/api/admin/listings.php', { json: { ref, ...DEFAULTS, ...patch } });
  assert.equal(res.status, 200, res.text);
};

describe('listing pages for crawlers', { skip }, () => {
  it('index: SPA shell with the content in #prerender, an <h1> and a link to every public listing', async () => {
    const res = await web.get(PAGE);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'no-cache');
    assert.match(res.headers.get('vary') || '', /User-Agent/);
    assert.ok(res.text.includes('<div id="root" data-server-page></div><div id="prerender"><main><h1>Available Properties</h1>'));
    assert.deepEqual(stable(linkedRefs(res.text)), stable(await publicRefs()));
    const head = headOf(res.text);
    assert.equal(titleOf(head), 'Available Properties for Lease & Sale | Alpha Premier Realty');
    assert.ok(head.includes(`<link data-rh="true" rel="canonical" href="${REALTY}/properties" />`));
    assert.equal(metaOf(head, 'property', 'og:image'), 'https://alphapremiergroup.com/og-image.jpg');
    assert.equal(metaOf(head, 'property', 'og:image:width'), '1376');
    const graph = jsonLdOf(head)['@graph'];
    assert.equal(graph.length, 1);
    assert.deepEqual(graph[0].itemListElement.map((i) => [i.position, i.name, i.item]), [
      [1, 'Alpha Premier Realty', `${REALTY}/`], [2, 'Available Properties', `${REALTY}/properties`],
    ]);
    assert.ok(!res.text.includes('Browse by type and area'), 'no fixture browse page is indexable');
  });

  it('listing: the shared head contract, JSON-LD and content', async () => {
    const url = `${REALTY}/properties/APR-A0A000`;
    const description = 'Warehouse for Lease in Valenzuela, 1,000 sqm. Rate: ₱180/sqm/month. Min. 2 years lease. '
      + '3 months deposit, 3 months advance. 24/7 security, loading bay for…';
    const res = await web.get(`${PAGE}?listing=APR-A0A000`);
    assert.equal(res.status, 200);
    const head = headOf(res.text);
    const title = 'Warehouse for Lease in Valenzuela (1,000 sqm) | Alpha Premier Realty';
    assert.equal(titleOf(head), title);
    assert.equal((head.match(/<title>/g) || []).length, 1);
    assert.ok(head.includes(`<link data-rh="true" rel="canonical" href="${url}" />`));
    const expected = {
      'name|description': description, 'property|og:site_name': 'Alpha Premier Group', 'property|og:locale': 'en_PH',
      'property|og:type': 'website', 'property|og:title': title, 'property|og:description': description, 'property|og:url': url,
      'property|og:image': `${REALTY}/uploads/drive/qa-0.webp`, 'name|twitter:card': 'summary_large_image',
      'name|twitter:title': title, 'name|twitter:description': description, 'name|twitter:image': `${REALTY}/uploads/drive/qa-0.webp`,
    };
    for (const [k, value] of Object.entries(expected)) assert.equal(metaOf(head, ...k.split('|')), value, k);
    assert.equal(metaOf(head, 'property', 'og:image:width'), null, 'size only for the default image');
    // The shell's site-wide defaults are gone; every page tag is marked for react-helmet-async.
    assert.equal((head.match(/name="description"/g) || []).length, 1);
    assert.ok(!head.includes('Alpha Premier Group is a Philippine business group'));
    for (const tag of head.match(/<(meta|link|script)[^>]*>/g)) {
      if (/og:|twitter:|name="description"|rel="canonical"|ld\+json/.test(tag)) assert.ok(tag.includes('data-rh="true"'), tag);
    }

    const [listing, crumbs] = jsonLdOf(head)['@graph'];
    assert.equal(jsonLdOf(head)['@context'], 'https://schema.org');
    assert.equal(listing['@type'], 'RealEstateListing');
    assert.equal(listing['@id'], `${url}#listing`);
    assert.equal(listing.url, url);
    assert.equal(listing.name, 'Warehouse for Lease in Valenzuela');
    assert.equal(listing.description, description);
    assert.equal(listing.identifier, 'APR-A0A000');
    assert.equal(listing.image.length, 4);
    assert.ok(listing.image.every((src) => src.startsWith(`${REALTY}/uploads/drive/`)));
    assert.equal(listing.datePosted, '2026-10-11T12:55:06.775937+00:00');
    assert.deepEqual(listing.contentLocation, {
      '@type': 'Place', name: 'Valenzuela', address: { '@type': 'PostalAddress', addressLocality: 'Valenzuela', addressCountry: 'PH' },
    });
    assert.deepEqual(listing.offers, {
      '@type': 'Offer', businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut', description: 'Rate: ₱180/sqm/month',
      availability: 'https://schema.org/InStock', seller: { '@id': `${REALTY}/#organization`, name: 'Alpha Premier Realty' },
    });
    assert.deepEqual(crumbs.itemListElement.map((i) => [i.position, i.name, i.item]), [
      [1, 'Alpha Premier Realty', `${REALTY}/`], [2, 'Available Properties', `${REALTY}/properties`],
      [3, 'Warehouse for Lease in Valenzuela', url],
    ]);

    const body = res.text.slice(res.text.indexOf('<div id="prerender">'));
    assert.ok(body.includes('<h1>Warehouse for Lease in Valenzuela</h1><p>For Lease</p>'));
    assert.ok(body.includes('<img src="/uploads/drive/qa-3.jpg" alt="Warehouse for Lease in Valenzuela, photo 4" loading="lazy" />'));
    assert.ok(body.includes('Exact location and viewing schedule are shared by our team after you inquire.'));
    assert.ok(body.includes('Ref APR-A0A000') && body.includes('<a href="/inquire">Inquire about this property</a>'));
    assert.ok(body.includes('<p><a href="/properties/warehouse-for-lease">More Warehouses for Lease</a></p>'), 'its area page is not indexable');
    const others = linkedRefs(body.slice(body.indexOf('Other available properties')));
    assert.ok(others.length > 0 && others.length <= 8 && !others.includes('APR-A0A000'));
    assert.ok(!res.text.includes('local-qa'), 'never the staff-only Drive folder');
  });

  it('listing without deal, size or photos: no size in the title, no businessFunction, default image', async () => {
    const noDeal = await web.get(`${PAGE}?listing=APR-A0A006`);
    assert.equal(titleOf(noDeal.text), 'Office Space in Quezon City | Alpha Premier Realty');
    assert.ok(noDeal.text.includes('<p>Available</p>'));
    assert.equal('businessFunction' in jsonLdOf(noDeal.text)['@graph'][0].offers, false);
    assert.ok(!noDeal.text.includes('">More '), 'no browse page without a deal');
    const noPhotos = await web.get(`${PAGE}?listing=APR-A0A003`);
    assert.equal(metaOf(noPhotos.text, 'property', 'og:image'), 'https://alphapremiergroup.com/og-image.jpg');
    assert.equal(metaOf(noPhotos.text, 'property', 'og:image:height'), '768');
    assert.equal('image' in jsonLdOf(noPhotos.text)['@graph'][0], false);
  });

  it('a listing hidden by an admin is 410 and leaves the index and the sitemap', async () => {
    try {
      await setOverride(HIDE_REF, { hidden: true });
      const res = await web.get(`${PAGE}?listing=${HIDE_REF}`);
      assert.equal(res.status, 410);
      assert.ok(res.text.includes('<meta data-rh="true" name="robots" content="noindex" />'));
      assert.ok(res.text.includes('This property is no longer available') && res.text.includes('href="/properties"'));
      assert.ok(!linkedRefs((await web.get(PAGE)).text).includes(HIDE_REF));
      assert.ok(!(await web.get('/api/listings-sitemap.php')).text.includes(HIDE_REF));
    } finally {
      await setOverride(HIDE_REF, {});
    }
    assert.equal((await web.get(`${PAGE}?listing=${HIDE_REF}`)).status, 200);
  });

  it('unknown ref is 410 noindex, a malformed one 404, a write 405', async () => {
    const gone = await web.get(`${PAGE}?listing=APR-FFFFFF`);
    assert.equal(gone.status, 410);
    assert.ok(gone.text.includes('<meta data-rh="true" name="robots" content="noindex" />'));
    assert.ok(!gone.text.includes('rel="canonical"'));
    for (const q of ['listing=APR-12', 'listing=apr-a0a000', 'listing=', 'listing=..%2Findex', 'listing[]=APR-A0A000']) {
      const res = await web.get(`${PAGE}?${q}`);
      assert.equal(res.status, 404, q);
      assert.ok(res.text.includes('This property is no longer available'), q);
    }
    assert.equal((await web.post(PAGE, { json: {} })).status, 405);
  });

  it('browse page: exactly its listings, the hub head contract, noindex below 3 listings', async () => {
    const hub = (await web.get('/api/listings.php')).data.hubs.find((h) => h.path === '/properties/warehouse-for-lease');
    assert.equal(hub.indexable, false);
    const res = await web.get(`${PAGE}?listing=warehouse-for-lease`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
    const head = headOf(res.text);
    assert.equal(titleOf(head), 'Warehouses for Lease | Alpha Premier Realty');
    assert.equal(titleOf(head), hub.title);
    assert.ok(head.includes('<meta data-rh="true" name="robots" content="noindex, follow" />'));
    assert.ok(!head.includes('rel="canonical"') && metaOf(head, 'property', 'og:url') === null, 'no canonical or og:url when noindex');
    const expected = {
      'name|description': hub.description, 'property|og:title': hub.title, 'property|og:description': hub.description,
      'property|og:image': 'https://alphapremiergroup.com/og-image.jpg', 'property|og:image:width': '1376', 'property|og:image:height': '768',
      'name|twitter:card': 'summary_large_image', 'name|twitter:title': hub.title, 'name|twitter:description': hub.description,
      'name|twitter:image': 'https://alphapremiergroup.com/og-image.jpg',
    };
    for (const [k, value] of Object.entries(expected)) assert.equal(metaOf(head, ...k.split('|')), value, k);
    assert.equal(jsonLdOf(head)['@graph'].length, 1);
    assert.deepEqual(crumbsOf(head), [
      [1, 'Alpha Premier Realty', `${REALTY}/`], [2, 'Available Properties', `${REALTY}/properties`],
      [3, 'Warehouses for Lease', `${REALTY}/properties/warehouse-for-lease`],
    ]);
    const body = bodyOf(res.text);
    assert.ok(body.includes('<li aria-current="page">Warehouses for Lease</li></ol></nav>\n<h1>Warehouses for Lease</h1>'));
    const refs = linkedRefs(body);
    assert.ok(refs.every((r) => ['APR-A0A000', 'APR-A0A008'].includes(r)), refs.join());
    assert.deepEqual(stable(refs), ['APR-A0A000']);
    assert.ok(!body.includes('<h2>'), 'no indexable area page to link');
  });

  it('area browse page: breadcrumb through its type + deal page, which it links back to', async () => {
    const res = await web.get(`${PAGE}?listing=warehouse-for-lease/valenzuela`);
    assert.equal(res.status, 200);
    assert.equal(titleOf(res.text), 'Warehouses for Lease in Valenzuela | Alpha Premier Realty');
    assert.equal(metaOf(res.text, 'name', 'robots'), 'noindex, follow');
    assert.deepEqual(crumbsOf(res.text), [
      [1, 'Alpha Premier Realty', `${REALTY}/`], [2, 'Available Properties', `${REALTY}/properties`],
      [3, 'Warehouses for Lease', `${REALTY}/properties/warehouse-for-lease`],
      [4, 'Warehouses for Lease in Valenzuela', `${REALTY}/properties/warehouse-for-lease/valenzuela`],
    ]);
    const body = bodyOf(res.text);
    assert.ok(body.includes('<li><a href="/properties/warehouse-for-lease">Warehouses for Lease</a></li><li aria-current="page">Warehouses for Lease in Valenzuela</li>'));
    assert.deepEqual(linkedRefs(body), ['APR-A0A000']);
    assert.deepEqual(hubLinks(body.slice(body.indexOf('<h2>Related properties</h2>'))), ['/properties/warehouse-for-lease']);
  });

  it('a path that is no browse page is 404 noindex', async () => {
    for (const q of ['castle-for-lease', 'warehouse-for-rent', 'Warehouse-For-Lease', 'office-for-lease', 'warehouse-for-lease/atlantis',
      'office-space-for-lease/quezon-city', 'warehouse-for-lease/valenzuela/x', 'warehouse-for-lease/', '/properties/warehouse-for-lease']) {
      const res = await web.get(`${PAGE}?listing=${encodeURIComponent(q)}`);
      assert.equal(res.status, 404, q);
      assert.ok(res.text.includes('<meta data-rh="true" name="robots" content="noindex" />') && !res.text.includes('rel="canonical"'), q);
    }
  });

  it('legacy ?ref= links redirect permanently to the listing URL', async () => {
    const res = await web.get(`${PAGE}?ref=APR-A0A001`);
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), `${REALTY}/properties/APR-A0A001`);
    for (const q of ['ref=bogus', 'ref[]=APR-A0A001']) {
      const index = await web.get(`${PAGE}?${q}`);
      assert.equal(index.status, 200, q);
      assert.ok(index.text.includes('<h1>Available Properties</h1>'), q);
    }
  });

  it('sitemap: well-formed urlset with one dated url per public listing', async () => {
    const res = await web.get('/api/listings-sitemap.php');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/xml; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'public, max-age=900');
    assert.match(res.text, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\n(  <url><loc>[^<&]+<\/loc><lastmod>\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d<\/lastmod><\/url>\n)*<\/urlset>\n$/);
    const locs = [...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.equal(new Set(locs).size, locs.length, 'no duplicates');
    assert.ok(locs.every((loc) => /^https:\/\/realty\.alphapremiergroup\.com\/properties\/APR-[0-9A-F]{6}$/.test(loc)), 'no fixture browse page is indexable');
    assert.deepEqual(stable(locs.map((loc) => loc.split('/').pop())), stable(await publicRefs()));
    assert.ok(res.text.includes('<lastmod>2026-10-11T20:55:06+08:00</lastmod>'), 'feed time as a W3C datetime');
  });

  it('escapes listing text in the body, the head attributes and the JSON-LD', async () => {
    const crafted = `</script><script>alert("x")</script> & 'q' <b>`;
    try {
      await setOverride(CRAFTED_REF, { price_override: crafted });
      for (const url of [`${PAGE}?listing=${CRAFTED_REF}`, PAGE, `${PAGE}?listing=commercial-space-for-sale`]) {
        const res = await web.get(url);
        assert.equal(res.status, 200, url);
        assert.ok(!res.text.includes('<script>alert') && !res.text.includes('<b>'), url);
        assert.ok(res.text.includes('&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#039;q&#039; &lt;b&gt;'), url);
      }
      const page = (await web.get(`${PAGE}?listing=${CRAFTED_REF}`)).text;
      assert.equal(jsonLdOf(page)['@graph'][0].offers.description, crafted);
      assert.ok(metaOf(page, 'name', 'description').includes(crafted));
    } finally {
      await setOverride(CRAFTED_REF, {});
    }
  });
});

// The same scripts, copied to a temp dir with a synthetic feed and run as GET requests from the PHP CLI
// (no database: no overrides), so browse pages reach the 3 listings that make them indexable.
const AREA = 'Lipa & "Sto." <b>Tomas</b>';
const SYNTHETIC = [
  ['APR-B0B000', 'warehouse', 'Warehouse', 'lease', 'Cavite', '2026-10-01'],
  ['APR-B0B001', 'warehouse', 'Warehouse', 'lease', 'Cavite City', '2026-10-03'],
  ['APR-B0B002', 'warehouse', 'Warehouse', 'lease', 'Cavite', '2026-10-02'],
  ['APR-B0B003', 'warehouse', 'Warehouse', 'lease', 'Laguna', '2026-10-09'],
  ['APR-B0B004', 'office', 'Office Space', 'lease', 'Cavite', '2026-10-04'],
  ['APR-B0B005', 'office', 'Office Space', 'lease', 'Cavite', '2026-10-05'],
  ['APR-B0B006', 'office', 'Office Space', 'lease', 'Cavite', '2026-10-06'],
  ['APR-B0B007', 'lot', 'Lot', 'sale', AREA, '2026-10-07'],
].map(([ref, type, label, deal, area, day]) => ({
  ref, title: `${label} for ${deal} in ${area}`, type, type_label: label, deal, area, size: '100 sqm', price: '', terms: [], photos: [],
  added: `${day}T00:00:00+00:00`, updated: `${day}T00:00:00+00:00`,
}));
let site;
const render = (script, query = '') => {
  const res = php([`${site}/run.php`, `${site}/api/${script}`, query], { DB_NAME: 'apg_no_such_database' });
  assert.equal(res.status, 0, res.stderr);
  return res.stdout;
};

describe('browse pages with indexable hubs (synthetic feed)', () => {
  before(() => {
    site = fs.mkdtempSync(path.join(os.tmpdir(), 'apg-hubs-'));
    for (const file of ['config.php', 'db.php', 'lib/Listings.php', 'lib/CrawlerPage.php', 'properties-page.php', 'listings-sitemap.php']) {
      fs.mkdirSync(path.dirname(`${site}/api/${file}`), { recursive: true });
      fs.copyFileSync(`${ROOT}/api/${file}`, `${site}/api/${file}`);
    }
    fs.mkdirSync(`${site}/api/data`);
    fs.writeFileSync(`${site}/api/data/listings.generated.json`, JSON.stringify({ synced_at: '2026-10-10T00:00:00+00:00', listings: SYNTHETIC }));
    fs.writeFileSync(`${site}/run.php`, "<?php\n$_SERVER['REQUEST_METHOD'] = 'GET';\nparse_str($argv[2], $_GET);\nrequire $argv[1];\n");
  });
  after(() => site && fs.rmSync(site, { recursive: true, force: true }));

  it('sitemap: every listing plus each indexable browse page, dated by its newest listing', () => {
    const urls = [...render('listings-sitemap.php').matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)].map((m) => [m[1], m[2]]);
    assert.deepEqual(urls.filter(([loc]) => loc.includes('/APR-')).map(([loc]) => loc), SYNTHETIC.map((l) => `${REALTY}/properties/${l.ref}`));
    assert.deepEqual(Object.fromEntries(urls.filter(([loc]) => !loc.includes('/APR-'))), {
      [`${REALTY}/properties/warehouse-for-lease`]: '2026-10-09T08:00:00+08:00',
      [`${REALTY}/properties/office-space-for-lease`]: '2026-10-06T08:00:00+08:00',
      [`${REALTY}/properties/warehouse-for-lease/cavite`]: '2026-10-03T08:00:00+08:00',
      [`${REALTY}/properties/office-space-for-lease/cavite`]: '2026-10-06T08:00:00+08:00',
    });
  });

  it('indexable area page: canonical, four breadcrumbs, exactly its listings, related pages', () => {
    const html = render('properties-page.php', 'listing=warehouse-for-lease/cavite');
    const head = headOf(html);
    const url = `${REALTY}/properties/warehouse-for-lease/cavite`;
    const description = '3 warehouses for lease in Cavite from Alpha Premier Realty, with sizes, rates and photos. Inquire for a viewing.';
    assert.equal(titleOf(head), 'Warehouses for Lease in Cavite | Alpha Premier Realty');
    assert.ok(head.includes(`<link data-rh="true" rel="canonical" href="${url}" />`));
    assert.equal(metaOf(head, 'name', 'robots'), null);
    for (const [k, value] of Object.entries({ 'name|description': description, 'property|og:url': url, 'property|og:description': description })) {
      assert.equal(metaOf(head, ...k.split('|')), value, k);
    }
    assert.deepEqual(crumbsOf(head), [
      [1, 'Alpha Premier Realty', `${REALTY}/`], [2, 'Available Properties', `${REALTY}/properties`],
      [3, 'Warehouses for Lease', `${REALTY}/properties/warehouse-for-lease`], [4, 'Warehouses for Lease in Cavite', url],
    ]);
    const body = bodyOf(html);
    assert.deepEqual(linkedRefs(body).sort(), ['APR-B0B000', 'APR-B0B001', 'APR-B0B002']);
    assert.deepEqual(hubLinks(body.slice(body.indexOf('<h2>Related properties</h2>'))), ['/properties/warehouse-for-lease', '/properties/office-space-for-lease/cavite']);
  });

  it('type + deal page links its indexable area pages', () => {
    const html = render('properties-page.php', 'listing=warehouse-for-lease');
    assert.ok(html.includes(`<link data-rh="true" rel="canonical" href="${REALTY}/properties/warehouse-for-lease" />`));
    const body = bodyOf(html);
    assert.deepEqual(linkedRefs(body).sort(), ['APR-B0B000', 'APR-B0B001', 'APR-B0B002', 'APR-B0B003']);
    assert.deepEqual(hubLinks(body.slice(body.indexOf('<h2>Browse by area</h2>'))), ['/properties/warehouse-for-lease/cavite'], 'Laguna has 1 listing');
  });

  it('index links every indexable browse page, type + deal pages first', () => {
    const body = bodyOf(render('properties-page.php'));
    const links = hubLinks(body.slice(body.indexOf('<section><h2>Browse by type and area</h2>')));
    assert.deepEqual(links.slice(0, 2).sort(), ['/properties/office-space-for-lease', '/properties/warehouse-for-lease']);
    assert.deepEqual(links.slice(2).sort(), ['/properties/office-space-for-lease/cavite', '/properties/warehouse-for-lease/cavite']);
  });

  it('listing page: "More …" goes to its area page once indexable, else its type + deal page', () => {
    assert.ok(render('properties-page.php', 'listing=APR-B0B001').includes('<p><a href="/properties/warehouse-for-lease/cavite">More Warehouses for Lease in Cavite</a></p>'));
    assert.ok(render('properties-page.php', 'listing=APR-B0B003').includes('<p><a href="/properties/warehouse-for-lease">More Warehouses for Lease</a></p>'));
  });

  it('escapes the Drive area name on browse pages', () => {
    const html = render('properties-page.php', 'listing=lot-for-sale/lipa-sto-b-tomas-b');
    const h1 = `Lots for Sale in ${AREA}`;
    assert.ok(!html.includes('<b>'));
    assert.equal(titleOf(html), `${h1} | Alpha Premier Realty`);
    assert.equal(metaOf(html, 'property', 'og:title'), `${h1} | Alpha Premier Realty`);
    assert.equal(crumbsOf(html).at(-1)[1], h1);
    assert.ok(html.includes('<h1>Lots for Sale in Lipa &amp; &quot;Sto.&quot; &lt;b&gt;Tomas&lt;/b&gt;</h1>'));
  });
});
