// Crawler HTML for the Realty listing pages (api/properties-page.php, served to bots at /properties[/APR-…]
// by .htaccess rule 0) and the live listings sitemap (api/listings-sitemap.php = /sitemap-listings.xml).
// Hits PHP directly: the .htaccess rewrites need Apache. Expectations use the local QA fixture listings;
// the last three refs are toggled by admin-listings.test.mjs in parallel, so set comparisons leave them out.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Client, as } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';

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
    assert.ok(res.text.includes('<div id="root" style="visibility:hidden;position:absolute;top:0;left:0;right:0"></div><div id="prerender"><main><h1>Available Properties</h1>'));
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
    const others = linkedRefs(body.slice(body.indexOf('Other available properties')));
    assert.ok(others.length > 0 && others.length <= 8 && !others.includes('APR-A0A000'));
    assert.ok(!res.text.includes('local-qa'), 'never the staff-only Drive folder');
  });

  it('listing without deal, size or photos: no size in the title, no businessFunction, default image', async () => {
    const noDeal = await web.get(`${PAGE}?listing=APR-A0A006`);
    assert.equal(titleOf(noDeal.text), 'Office Space in Quezon City | Alpha Premier Realty');
    assert.ok(noDeal.text.includes('<p>Available</p>'));
    assert.equal('businessFunction' in jsonLdOf(noDeal.text)['@graph'][0].offers, false);
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
    assert.ok(locs.every((loc) => /^https:\/\/realty\.alphapremiergroup\.com\/properties\/APR-[0-9A-F]{6}$/.test(loc)));
    assert.deepEqual(stable(locs.map((loc) => loc.split('/').pop())), stable(await publicRefs()));
    assert.ok(res.text.includes('<lastmod>2026-10-11T20:55:06+08:00</lastmod>'), 'feed time as a W3C datetime');
  });

  it('escapes listing text in the body, the head attributes and the JSON-LD', async () => {
    const crafted = `</script><script>alert("x")</script> & 'q' <b>`;
    try {
      await setOverride(CRAFTED_REF, { price_override: crafted });
      for (const path of [`${PAGE}?listing=${CRAFTED_REF}`, PAGE]) {
        const res = await web.get(path);
        assert.equal(res.status, 200, path);
        assert.ok(!res.text.includes('<script>alert') && !res.text.includes('<b>'), path);
        assert.ok(res.text.includes('&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#039;q&#039; &lt;b&gt;'), path);
      }
      const page = (await web.get(`${PAGE}?listing=${CRAFTED_REF}`)).text;
      assert.equal(jsonLdOf(page)['@graph'][0].offers.description, crafted);
      assert.ok(metaOf(page, 'name', 'description').includes(crafted));
    } finally {
      await setOverride(CRAFTED_REF, {});
    }
  });
});
