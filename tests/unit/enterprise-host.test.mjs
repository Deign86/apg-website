import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// The module reads window.location at import time (MAIN_SITE_HREF): emulate a local dev tab.
globalThis.window ??= { location: { hostname: 'localhost' } };
let host;
let ENTERPRISE_SLUGS;
before(async () => {
  host = await import('../../src/lib/enterpriseHost.js');
  ({ ENTERPRISE_SLUGS } = await import('../../src/data/enterprises.js'));
});

const SITES = ['virtual-office', 'realty', 'luxe-prime', 'swiftclear', '88prime', 'alta-venture', 'dynamic-tree', 'construction'];

describe('enterpriseHost (src/lib/enterpriseHost.js)', () => {
  it('maps each enterprise subdomain to its slug', () => {
    for (const slug of SITES) assert.equal(host.hostEnterprise(`${slug}.alphapremiergroup.com`), slug);
  });

  it('returns null for the apex, www, corporate, unknown and look-alike hosts', () => {
    for (const h of ['alphapremiergroup.com', 'www.alphapremiergroup.com', 'corporate.alphapremiergroup.com',
      'blog.alphapremiergroup.com', 'evilrealty.alphapremiergroup.com', 'realty.alphapremiergroup.com.evil.test',
      'realty-alphapremiergroup.com', 'localhost', 'apg-website.vercel.app']) {
      assert.equal(host.hostEnterprise(h), null, h);
    }
  });

  it('only the apex and its subdomains are production hosts', () => {
    assert.equal(host.isProductionHost('alphapremiergroup.com'), true);
    assert.equal(host.isProductionHost('realty.alphapremiergroup.com'), true);
    assert.equal(host.isProductionHost('localhost'), false);
    assert.equal(host.isProductionHost('xalphapremiergroup.com'), false);
  });

  it('splits enterprise paths into slug + rest', () => {
    assert.deepEqual(host.enterpriseFromPath('/subsidiaries/realty'), { slug: 'realty', rest: '/' });
    assert.deepEqual(host.enterpriseFromPath('/subsidiaries/realty/properties'), { slug: 'realty', rest: '/properties' });
    assert.deepEqual(host.enterpriseFromPath('/virtual-office'), { slug: 'virtual-office', rest: '/' });
    assert.deepEqual(host.enterpriseFromPath('/subsidiaries/alta-venture/careers'), { slug: 'alta-venture', rest: '/careers' });
    for (const p of ['/', '/careers', '/subsidiaries/realtyx', '/subsidiaries', '/admin', '/virtual-officex']) {
      assert.equal(host.enterpriseFromPath(p), null, p);
    }
  });

  it('builds base paths and origins', () => {
    assert.equal(host.basePathFor('virtual-office'), '/virtual-office');
    assert.equal(host.basePathFor('88prime'), '/subsidiaries/88prime');
    assert.equal(host.enterpriseOrigin('luxe-prime'), 'https://luxe-prime.alphapremiergroup.com');
    assert.equal(host.MAIN_SITE_HREF, '/'); // not on an enterprise subdomain
  });

  it('enterprise slugs match the server list in api/config.php enterpriseSlugs()', () => {
    const php = fs.readFileSync(new URL('../../api/config.php', import.meta.url), 'utf8');
    const block = php.match(/function enterpriseSlugs\(\)\s*\{\s*return \[([^\]]+)\]/)[1];
    const serverSlugs = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    assert.deepEqual(ENTERPRISE_SLUGS, serverSlugs);
  });
});
