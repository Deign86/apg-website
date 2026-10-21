// Crawler HTML for the job opening pages (api/careers-page.php, served to bots at /careers[/{id}-{slug}] by .htaccess
// rule 0) and the jobs sitemap (api/jobs-sitemap.php = /sitemap-jobs.xml). Hits PHP directly: the .htaccess rewrites
// need Apache. Openings are created through the admin API and deleted afterwards; other files add and remove openings
// in parallel, so list checks look only at this file's openings.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as, uid } from '../support/http.mjs';

const PAGE = '/api/careers-page.php';
const SITEMAP = '/api/jobs-sitemap.php';
const SITE = 'https://alphapremiergroup.com';
const HQ = {
  '@type': 'PostalAddress',
  streetAddress: 'Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center',
  addressLocality: 'Pasig City',
  addressRegion: 'Metro Manila',
  addressCountry: 'PH',
};
const web = new Client();
let sa;
const created = [];

before(async () => { sa = await as('superadmin'); });
after(async () => { for (const id of created) await sa.delete(`/api/admin/careers.php?id=${id}`); });

/** Creates an active opening (admin API); resolves to it with its id, page segment and canonical URL. */
async function opening(over = {}) {
  const body = {
    title: `QA Marketing Intern ${uid()}`, enterprise_slug: 'realty', location: 'Ortigas Center, Pasig City', type: 'Internship',
    description: 'Support the marketing team.', responsibilities: ['Create posts'], requirements: ['Good English'], ...over,
  };
  const res = await sa.post('/api/admin/careers.php', { json: body });
  assert.equal(res.status, 201, res.text);
  created.push(res.data.id);
  const slug = body.title.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  const segment = `${res.data.id}${slug ? `-${slug}` : ''}`;
  return { ...body, id: res.data.id, segment, url: `${SITE}/careers/${segment}` };
}
const setStatus = async (job, status) => {
  const res = await sa.put('/api/admin/careers.php', { json: { ...job, status } });
  assert.equal(res.status, 200, res.text);
};
const adminRow = async (id) => (await sa.get('/api/admin/careers.php')).data.data.find((j) => j.id === id);

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const headOf = (html) => html.slice(0, html.indexOf('</head>'));
const bodyOf = (html) => html.slice(html.indexOf('<div id="prerender">'));
const titleOf = (html) => decode(html.match(/<title>([^<]*)<\/title>/)[1]);
const metaOf = (html, attr, key) => {
  const m = html.match(new RegExp(`<meta data-rh="true" ${attr}="${key}" content="([^"]*)" />`));
  return m && decode(m[1]);
};
const jsonLdOf = (html) => {
  const m = html.match(/<script data-rh="true" type="application\/ld\+json">(.*?)<\/script>/s);
  return m && JSON.parse(m[1]);
};
const jobLinks = (html) => [...html.matchAll(/<a href="https:\/\/alphapremiergroup\.com\/careers\/(\d+)[^"]*">/g)].map((m) => Number(m[1]));

describe('job pages for crawlers', () => {
  it('opening: SPA shell with the content in #prerender, the shared head contract and its JobPosting', async () => {
    const job = await opening({ salary: 'PHP 15,000 allowance' });
    const res = await web.get(`${PAGE}?job=${job.segment}`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'no-cache');
    assert.match(res.headers.get('vary') || '', /User-Agent/);

    const head = headOf(res.text);
    const title = `${job.title} – Alpha Premier Realty | Careers`;
    assert.equal(titleOf(head), title);
    assert.equal((head.match(/<title>/g) || []).length, 1);
    assert.equal((head.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(head.includes(`<link data-rh="true" rel="canonical" href="${job.url}" />`));
    const expected = {
      'name|description': 'Support the marketing team.', 'property|og:title': title, 'property|og:description': 'Support the marketing team.',
      'property|og:url': job.url, 'property|og:image': `${SITE}/og-image.jpg`, 'property|og:image:width': '1376', 'name|twitter:card': 'summary_large_image',
      'name|twitter:title': title, 'name|robots': null,
    };
    for (const [k, value] of Object.entries(expected)) assert.equal(metaOf(head, ...k.split('|')), value, k);
    // The shell's site-wide defaults are gone; every page tag is marked for react-helmet-async.
    assert.equal((head.match(/name="description"/g) || []).length, 1);
    for (const tag of head.match(/<(meta|link|script)[^>]*>/g)) {
      if (/og:|twitter:|name="description"|rel="canonical"|ld\+json/.test(tag)) assert.ok(tag.includes('data-rh="true"'), tag);
    }

    const ld = jsonLdOf(head);
    assert.equal(ld['@context'], 'https://schema.org');
    assert.equal(ld['@graph'].length, 1);
    const { created_at } = await adminRow(job.id);
    assert.deepEqual(ld['@graph'][0], {
      '@type': 'JobPosting',
      title: job.title,
      description: '<p>Support the marketing team.</p><h3>Responsibilities</h3><ul><li>Create posts</li></ul><h3>Requirements</h3><ul><li>Good English</li></ul>',
      identifier: { '@type': 'PropertyValue', name: 'Alpha Premier Realty', value: String(job.id) },
      datePosted: `${created_at.replace(' ', 'T')}+08:00`,
      employmentType: 'INTERN',
      hiringOrganization: { '@type': 'Organization', name: 'Alpha Premier Realty', sameAs: 'https://realty.alphapremiergroup.com/', logo: `${SITE}/images/realty-banner-logo.png` },
      jobLocation: { '@type': 'Place', address: HQ },
      directApply: true,
    });

    const body = bodyOf(res.text);
    assert.ok(body.startsWith('<div id="prerender"><main><nav aria-label="Breadcrumb"><ol><li><a href="/careers">Careers</a></li>'));
    assert.ok(res.text.includes('<div id="root" style="visibility:hidden;position:absolute;top:0;left:0;right:0"></div>'));
    assert.ok(body.includes(`<article><p>Alpha Premier Realty</p><h1>${job.title}</h1>`));
    assert.ok(body.includes('<dt>Location</dt><dd>Ortigas Center, Pasig City</dd><dt>Employment type</dt><dd>Internship</dd><dt>Salary</dt><dd>PHP 15,000 allowance</dd>'));
    assert.equal(body.split(`<a href="/careers/apply?job=${job.id}">Apply for this position</a>`).length, 3, 'apply link above and below');
    assert.ok(body.includes('<h2>About the role</h2><p>Support the marketing team.</p>'));
    assert.ok(body.includes('<h2>Responsibilities</h2><ul><li>Create posts</li></ul>') && body.includes('<h2>Requirements</h2><ul><li>Good English</li></ul>'));
  });

  it('an opening saved without location or type gets the SPA defaults; a corporate one names the group', async () => {
    const job = await opening({ enterprise_slug: 'corporate', location: '', type: '', description: '', responsibilities: [], requirements: [] });
    const res = await web.get(`${PAGE}?job=${job.segment}`);
    assert.equal(res.status, 200);
    assert.equal(titleOf(res.text), `${job.title} – Alpha Premier Group of Companies | Careers`);
    const description = `${job.title} at Alpha Premier Group of Companies, Ortigas Center, Pasig City.`;
    assert.equal(metaOf(res.text, 'name', 'description'), description);
    const posting = jsonLdOf(res.text)['@graph'][0];
    assert.equal(posting.description, `<p>${description}</p>`);
    assert.equal(posting.employmentType, 'FULL_TIME');
    assert.deepEqual(posting.hiringOrganization, { '@type': 'Organization', name: 'Alpha Premier Group of Companies', sameAs: `${SITE}/`, logo: `${SITE}/favicon.png` });
    assert.deepEqual(posting.jobLocation, { '@type': 'Place', address: HQ });
    const body = bodyOf(res.text);
    assert.ok(body.includes('<dd>Ortigas Center, Pasig City</dd><dt>Employment type</dt><dd>Full-time</dd></dl>'));
    assert.ok(!body.includes('About the role') && !body.includes('<h2>Responsibilities'));
  });

  it('a remote opening elsewhere: telecommute, no street address', async () => {
    const job = await opening({ enterprise_slug: 'alta-venture', location: 'Remote / Work from home', type: 'Part-time' });
    const posting = jsonLdOf((await web.get(`${PAGE}?job=${job.segment}`)).text)['@graph'][0];
    assert.equal(posting.jobLocationType, 'TELECOMMUTE');
    assert.deepEqual(posting.applicantLocationRequirements, { '@type': 'Country', name: 'Philippines' });
    assert.equal('jobLocation' in posting, false);
    assert.equal(posting.employmentType, 'PART_TIME');
    assert.equal(posting.hiringOrganization.logo, `${SITE}/assets/images/3.%20Alta%20Venture%20-%20Logo.png`);
  });

  it('index: the careers page head and a link to every active opening', async () => {
    const [job, closed] = [await opening(), await opening()];
    await setStatus(closed, 'closed');
    const res = await web.get(PAGE);
    assert.equal(res.status, 200);
    const head = headOf(res.text);
    assert.equal(titleOf(head), 'Careers | Alpha Premier Group');
    assert.ok(head.includes(`<link data-rh="true" rel="canonical" href="${SITE}/careers" />`));
    assert.equal(metaOf(head, 'name', 'description'), 'Explore job openings across Alpha Premier Group companies in real estate, construction, facility services, outsourcing, and more. Apply online.');
    assert.equal(jsonLdOf(head), null, 'no JobPosting on the list page');
    const body = bodyOf(res.text);
    assert.ok(body.startsWith('<div id="prerender"><main><h1>Careers at Alpha Premier Group</h1>'));
    assert.ok(body.includes(`<li><a href="${job.url}">${job.title}</a> · Alpha Premier Realty · Ortigas Center, Pasig City · Internship</li>`));
    assert.ok(!jobLinks(body).includes(closed.id), 'closed opening not listed');
    assert.ok(body.includes('<a href="/careers/apply?job=general">send a general application</a>'));
  });

  it('a missing, outdated or padded slug is a 301 to the opening URL', async () => {
    const job = await opening();
    const [, slug] = job.segment.split(/-(.*)/);
    for (const segment of [String(job.id), `${job.id}-old-title`, `${job.segment}/`, `0${job.segment}`, `${job.id}-${slug.toUpperCase()}`, `${job.id}-`]) {
      const res = await web.get(`${PAGE}?job=${encodeURIComponent(segment)}`);
      assert.equal(res.status, 301, segment);
      assert.equal(res.headers.get('location'), job.url, segment);
    }
  });

  it('a closed opening is 410 noindex listing the open ones; an unknown or malformed id 404; a write 405', async () => {
    const [open, job] = [await opening(), await opening()];
    await setStatus(job, 'closed');
    const gone = await web.get(`${PAGE}?job=${job.segment}`);
    assert.equal(gone.status, 410);
    assert.equal(metaOf(gone.text, 'name', 'robots'), 'noindex, follow');
    assert.ok(!gone.text.includes('rel="canonical"') && metaOf(gone.text, 'property', 'og:url') === null);
    assert.equal(jsonLdOf(gone.text), null);
    assert.ok(bodyOf(gone.text).includes('<h1>This position is no longer open</h1>'));
    assert.ok(jobLinks(gone.text).includes(open.id) && !jobLinks(gone.text).includes(job.id));
    assert.equal((await web.get(`${PAGE}?job=${job.id}`)).status, 410, 'closed with any slug');

    for (const q of ['job=2147483000-nope', 'job=99999999999', 'job=abc', 'job=', `job=${open.id}abc`, `job=-${open.id}`, `job=${open.id}-x/y`, `job[]=${open.id}`]) {
      const res = await web.get(`${PAGE}?${q}`);
      assert.equal(res.status, 404, q);
      assert.equal(metaOf(res.text, 'name', 'robots'), 'noindex, follow', q);
      assert.ok(res.text.includes('This position is no longer open'), q);
    }
    assert.equal((await web.post(PAGE, { json: {} })).status, 405);
    assert.equal((await web.post(SITEMAP, { json: {} })).status, 405);
  });

  it('escapes opening text in the body, the head attributes and the JSON-LD', async () => {
    const crafted = `</script><script>alert("x")</script> & 'q' <b>`;
    const job = await opening({ title: `QA ${crafted} ${uid()}`, description: crafted, location: `Makati ${crafted}`, requirements: [crafted] });
    const res = await web.get(`${PAGE}?job=${job.segment}`);
    assert.equal(res.status, 200, res.text.slice(0, 300));
    assert.ok(!res.text.includes('<script>alert') && !res.text.includes('<b>'));
    assert.ok(res.text.includes('&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#039;q&#039; &lt;b&gt;'));
    const posting = jsonLdOf(res.text)['@graph'][0];
    assert.equal(posting.title, job.title);
    assert.equal(posting.jobLocation.address.addressLocality, `Makati ${crafted}`);
    assert.ok(posting.description.includes('<li>&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)'));
    assert.equal(metaOf(res.text, 'name', 'description'), crafted);
    assert.ok(jobLinks((await web.get(PAGE)).text).includes(job.id), 'listed on the index');
  });

  it('sitemap: well-formed urlset with one dated url per active opening', async () => {
    const [job, closed] = [await opening(), await opening()];
    await setStatus(closed, 'closed');
    const res = await web.get(SITEMAP);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/xml; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'public, max-age=900');
    assert.match(res.text, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\n(  <url><loc>https:\/\/alphapremiergroup\.com\/careers\/\d+(-[a-z0-9-]+)?<\/loc><lastmod>\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\+08:00<\/lastmod><\/url>\n)*<\/urlset>\n$/);
    const locs = [...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.equal(new Set(locs).size, locs.length, 'no duplicates');
    const { updated_at } = await adminRow(job.id);
    assert.ok(res.text.includes(`<url><loc>${job.url}</loc><lastmod>${updated_at.replace(' ', 'T')}+08:00</lastmod></url>`));
    assert.ok(!locs.some((loc) => loc.startsWith(`${SITE}/careers/${closed.id}-`)), 'closed opening left out');
  });
});
