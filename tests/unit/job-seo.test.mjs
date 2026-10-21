// src/lib/jobSeo.ts (job opening pages + JobPosting JSON-LD) and its server twin api/lib/JobPages.php, which
// renders the same head for crawlers (api/careers-page.php): both must give the same output for the same opening.
import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// enterpriseHost.js reads window.location at import time (MAIN_SITE_HREF): emulate a local dev tab.
globalThis.window ??= { location: { hostname: 'localhost' } };
let jobSeo, jobPath, jobSlug, jobIdFromPath, hiringOrganization, CAREERS_SEO, ENTERPRISES;
before(async () => {
  ({ jobSeo, jobPath, jobSlug, jobIdFromPath, hiringOrganization, CAREERS_SEO } = await import('../../src/lib/jobSeo.ts'));
  ({ ENTERPRISES } = await import('../../src/data/enterprises.js'));
});

const SITE = 'https://alphapremiergroup.com';
const HQ = {
  '@type': 'PostalAddress',
  streetAddress: 'Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center',
  addressLocality: 'Pasig City',
  addressRegion: 'Metro Manila',
  addressCountry: 'PH',
};
// The live Marketing Intern opening (GET /api/careers.php, id 39) as CareersView maps it.
const job = (over = {}) => ({
  id: '39',
  title: 'Marketing Intern',
  location: 'Ortigas Center, Pasig City',
  type: 'Internship',
  description: 'Support the Alpha Premier Realty marketing team in promoting commercial and residential property listings across digital channels.',
  responsibilities: ['Create social media posts and listing graphics for available properties', 'Help write listing descriptions'],
  requirements: ["Familiar with social media platforms; Canva or Adobe tools a plus", 'Available for the required internship (OJT) hours'],
  salary: '',
  enterprise_slug: 'realty',
  created_at: '2026-10-13 06:28:49',
  ...over,
});
/** The JSON-LD as the page carries it (JSON.stringify leaves out the properties that do not apply). */
const emitted = (seo) => JSON.parse(JSON.stringify(seo.jsonLd));
const posting = (over) => emitted(jobSeo(job(over)))[0];
const read = (rel) => fs.readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');

describe('job page URL (src/lib/jobSeo.ts)', () => {
  it('slug: ASCII letters and digits in lowercase, every other run one dash, none at the ends', () => {
    assert.equal(jobSlug('Marketing Intern'), 'marketing-intern');
    assert.equal(jobSlug('  Sr. Accountant (CPA) / Team Lead!  '), 'sr-accountant-cpa-team-lead');
    assert.equal(jobSlug('Señor C++ Developer'), 'se-or-c-developer');
    assert.equal(jobSlug('İnşaat Mühendisi'), 'n-aat-m-hendisi', 'non-ASCII letters are dropped, never lowercased into ASCII');
    assert.equal(jobSlug('★★★'), '');
  });

  it('path: /careers/{id}-{slug}, or /careers/{id} when the title has no letters or digits', () => {
    assert.equal(jobPath(job()), '/careers/39-marketing-intern');
    assert.equal(jobPath({ id: 7, title: '—' }), '/careers/7');
  });

  it('reads the id of a job path, with or without slug or trailing slash; anything else is not a job page', () => {
    assert.equal(jobIdFromPath('/careers/39-marketing-intern'), '39');
    assert.equal(jobIdFromPath('/careers/39'), '39');
    assert.equal(jobIdFromPath('/careers/39-old-title/'), '39');
    assert.equal(jobIdFromPath('/careers/039-x'), '39');
    assert.equal(jobIdFromPath('/careers/0'), '0');
    for (const p of ['/careers', '/careers/', '/careers/apply', '/careers/39abc', '/careers/39-x/apply', '/careers/-39', '/blogs/39', '/careers/x-39']) {
      assert.equal(jobIdFromPath(p), null, p);
    }
  });
});

describe('job page head + JobPosting JSON-LD (src/lib/jobSeo.ts)', () => {
  it('the live Marketing Intern opening: canonical path, title, description and the whole JobPosting', () => {
    const seo = jobSeo(job());
    assert.equal(seo.path, '/careers/39-marketing-intern');
    assert.equal(seo.title, 'Marketing Intern – Alpha Premier Realty | Careers');
    assert.equal(seo.description, job().description);
    assert.equal(seo.jsonLd.length, 1);
    assert.deepEqual(emitted(seo)[0], {
      '@type': 'JobPosting',
      title: 'Marketing Intern',
      description: `<p>${job().description}</p>`
        + '<h3>Responsibilities</h3><ul><li>Create social media posts and listing graphics for available properties</li><li>Help write listing descriptions</li></ul>'
        + '<h3>Requirements</h3><ul><li>Familiar with social media platforms; Canva or Adobe tools a plus</li><li>Available for the required internship (OJT) hours</li></ul>',
      identifier: { '@type': 'PropertyValue', name: 'Alpha Premier Realty', value: '39' },
      datePosted: '2026-10-13T06:28:49+08:00',
      employmentType: 'INTERN',
      hiringOrganization: {
        '@type': 'Organization', name: 'Alpha Premier Realty', sameAs: 'https://realty.alphapremiergroup.com/', logo: `${SITE}/images/realty-banner-logo.png`,
      },
      jobLocation: { '@type': 'Place', address: HQ },
      directApply: true,
    });
    assert.ok(!('baseSalary' in seo.jsonLd[0]) && !('validThrough' in seo.jsonLd[0]));
  });

  it('employment type from the free-text type; several matches give a list, none leaves it out', () => {
    const cases = {
      'Full-Time': 'FULL_TIME', 'full time': 'FULL_TIME', 'Part-time': 'PART_TIME', Internship: 'INTERN', OJT: 'INTERN',
      Contractual: 'CONTRACTOR', 'Project-based': 'CONTRACTOR', Temporary: 'TEMPORARY', 'Full-Time / Contract': ['FULL_TIME', 'CONTRACTOR'],
    };
    for (const [type, expected] of Object.entries(cases)) assert.deepEqual(posting({ type }).employmentType, expected, type);
    assert.equal('employmentType' in posting({ type: 'Freelance' }), false);
  });

  it('place of work: the group office for Ortigas/Pasig, the locality elsewhere, telecommute when remote', () => {
    assert.deepEqual(posting({ location: 'Pasig' }).jobLocation, { '@type': 'Place', address: HQ });
    assert.deepEqual(posting({ location: 'Makati City' }).jobLocation, {
      '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Makati City', addressCountry: 'PH' },
    });
    for (const p of [posting({ location: 'Ortigas Center, Pasig City' }), posting({ location: 'Makati City' })]) {
      assert.equal('jobLocationType' in p, false);
      assert.equal('applicantLocationRequirements' in p, false);
    }
    const remote = posting({ location: 'Remote (Work From Home)' });
    assert.equal(remote.jobLocationType, 'TELECOMMUTE');
    assert.deepEqual(remote.applicantLocationRequirements, { '@type': 'Country', name: 'Philippines' });
    assert.equal('jobLocation' in remote, false, 'no street address for a fully remote job');
    const hybrid = posting({ location: 'Ortigas Center, Pasig City / WFH' });
    assert.deepEqual([hybrid.jobLocation.address, hybrid.jobLocationType], [HQ, 'TELECOMMUTE']);
  });

  it('hiring organization: each enterprise by name, site and the logo its pages use; corporate or unknown is the group', () => {
    const group = { '@type': 'Organization', name: 'Alpha Premier Group of Companies', sameAs: `${SITE}/`, logo: `${SITE}/favicon.png` };
    for (const slug of ['corporate', 'nowhere', 'toString', undefined]) assert.deepEqual(hiringOrganization(slug), group, String(slug));
    const seo = read('src/components/Seo.tsx');
    const meta = seo.slice(seo.indexOf('const ENTERPRISE_META'));
    for (const { slug, name } of ENTERPRISES.filter((e) => e.slug !== 'corporate')) {
      const org = hiringOrganization(slug);
      assert.equal(org.name, name);
      assert.equal(org.sameAs, `https://${slug}.alphapremiergroup.com/`);
      const block = meta.slice(meta.search(new RegExp(`\\n  '?${slug}'?: \\{`)));
      assert.equal(org.logo, `${SITE}${encodeURI(block.match(/logo: '([^']+)'/)[1])}`, `${slug}: the logo in Seo.tsx ENTERPRISE_META`);
    }
    assert.equal(hiringOrganization('alta-venture').logo, `${SITE}/assets/images/3.%20Alta%20Venture%20-%20Logo.png`);
    assert.ok(seo.includes(HQ.streetAddress), 'the group office as in Seo.tsx ADDRESS');
  });

  it('corporate opening: the group name in the title and identifier', () => {
    const seo = jobSeo(job({ enterprise_slug: 'corporate' }));
    assert.equal(seo.title, 'Marketing Intern – Alpha Premier Group of Companies | Careers');
    assert.equal(seo.jsonLd[0].identifier.name, 'Alpha Premier Group of Companies');
  });

  it('description: one line, cut at a word to 160 characters; the JSON-LD keeps the whole text', () => {
    const long = `${'Lead site teams across Metro Manila projects. '.repeat(5)}\n\nReport weekly.`;
    const seo = jobSeo(job({ description: long }));
    assert.ok([...seo.description].length <= 160);
    assert.ok(seo.description.endsWith('…') && !seo.description.includes('\n'));
    assert.equal(seo.description, `${'Lead site teams across Metro Manila projects. '.repeat(3)}Lead site teams…`);
    assert.ok(seo.jsonLd[0].description.startsWith(`<p>${'Lead site teams across Metro Manila projects. '.repeat(5)}Report weekly.</p>`));
    const exact = 'x'.repeat(160);
    assert.equal(jobSeo(job({ description: exact })).description, exact);
    assert.equal(jobSeo(job({ description: 'y'.repeat(200) })).description, `${'y'.repeat(159)}…`, 'no space: a hard cut');
  });

  it('an opening without a description is described by its title, company and location', () => {
    const seo = jobSeo(job({ description: ' \n ' }));
    assert.equal(seo.description, 'Marketing Intern at Alpha Premier Realty, Ortigas Center, Pasig City.');
    assert.ok(seo.jsonLd[0].description.startsWith('<p>Marketing Intern at Alpha Premier Realty, Ortigas Center, Pasig City.</p>'));
  });

  it('escapes the text in the JSON-LD description HTML (the meta description stays plain text) and drops blank list items', () => {
    const crafted = `</script><script>alert("x")</script> & 'q' <b>`;
    const seo = jobSeo(job({ description: crafted, responsibilities: [crafted, '  ', ''], requirements: [] }));
    const escaped = '&lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#039;q&#039; &lt;b&gt;';
    assert.equal(seo.jsonLd[0].description, `<p>${escaped}</p><h3>Responsibilities</h3><ul><li>${escaped}</li></ul>`);
    assert.equal(seo.description, crafted);
  });

  it('datePosted only for a well-formed created_at', () => {
    for (const created_at of ['', undefined, '2026-10-13', '2026-10-13T06:28:49Z']) assert.equal('datePosted' in posting({ created_at }), false, String(created_at));
  });

  it('the careers page keeps its metadata', () => {
    assert.deepEqual(CAREERS_SEO, {
      path: '/careers',
      title: 'Careers | Alpha Premier Group',
      description: 'Explore job openings across Alpha Premier Group companies in real estate, construction, facility services, outsourcing, and more. Apply online.',
    });
    assert.ok(read('api/careers-page.php').includes(`'${CAREERS_SEO.description}'`), 'api/careers-page.php serves the same description');
  });
});

describe('api/lib/JobPages.php renders the same head as src/lib/jobSeo.ts', () => {
  const probe = spawnSync('php', ['-v'], { encoding: 'utf8' });
  it('same URL, title, description and JSON-LD for the same opening', { skip: probe.status !== 0 && 'php CLI not available' }, () => {
    const long = 'Ünïcödé description with “quotes” and emoji 🚀 '.repeat(6);
    const openings = [
      job(),
      job({ id: '40', title: 'IT Intern', enterprise_slug: 'corporate', created_at: '' }),
      job({ id: '41', title: '★', type: 'Full-Time / Contract', location: 'Remote', salary: 'PHP 30,000', description: long }),
      job({ id: '42', title: "Site Engineer (Civil) – Sr.", type: 'Freelance', location: 'Makati City / WFH', enterprise_slug: 'alta-venture', description: '' }),
      job({ id: '43', description: `</script><script>alert("x")</script> & 'q' <b>\n\nline two`, responsibilities: ['  a\tb  ', ''], requirements: [] }),
      ...ENTERPRISES.map((e, i) => job({ id: String(100 + i), title: `${e.name} Associate`, enterprise_slug: e.slug, type: 'Part-time' })),
    ];
    // Rows as job_openings stores them: list columns are JSON text, numeric id. A number item is text on both sides
    // (CareersView maps list items with String()); the PHP side drops a nested list.
    const rows = openings.map((o) => ({
      ...o, id: Number(o.id), status: 'active',
      requirements: o.requirements.length ? JSON.stringify([...o.requirements, 7, ['x']]) : null,
      responsibilities: o.responsibilities.length ? JSON.stringify(o.responsibilities) : '',
    }));
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apg-job-seo-'));
    const file = path.join(dir, 'probe.php');
    const lib = fileURLToPath(new URL('../../api/lib/JobPages.php', import.meta.url));
    fs.writeFileSync(file, `<?php require ${JSON.stringify(lib)};
      $rows = json_decode(stream_get_contents(fopen('php://stdin', 'r')), true);
      echo json_encode(array_map(fn(array $row): array => jobPageSeo(jobOpening($row)), $rows), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);`);
    try {
      const run = spawnSync('php', [file], { input: JSON.stringify(rows), encoding: 'utf8' });
      assert.equal(run.status, 0, run.stderr);
      const php = JSON.parse(run.stdout);
      assert.equal(php.length, openings.length);
      openings.forEach((o, i) => {
        const ts = jobSeo({ ...o, requirements: o.requirements.length ? [...o.requirements, '7'] : [] });
        assert.deepEqual(php[i], { url: `${SITE}${ts.path}`, title: ts.title, description: ts.description, graph: emitted(ts) }, `opening ${o.id}`);
      });
      assert.equal(php[2].url, `${SITE}/careers/41`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
