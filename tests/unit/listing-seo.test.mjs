import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

// enterpriseHost.js reads window.location at import time (MAIN_SITE_HREF): emulate a local dev tab.
globalThis.window ??= { location: { hostname: 'localhost' } };
let listingSeo;
before(async () => {
  ({ listingSeo } = await import('../../src/lib/listingSeo.ts'));
});

const ORIGIN = 'https://realty.alphapremiergroup.com';
const URL_A = `${ORIGIN}/properties/APR-A0A000`;
const listing = (over = {}) => ({
  ref: 'APR-A0A000', title: 'Warehouse for Lease in Valenzuela', type: 'warehouse', type_label: 'Warehouse', deal: 'lease',
  area: 'Valenzuela', size: '1,000 sqm', price: 'Rate: ₱180/sqm/month', terms: ['Min. 2 years lease'],
  photos: ['/uploads/drive/a.webp', '/uploads/drive/b.jpg'], added: '2026-10-01T00:00:00+00:00', updated: '2026-10-11T00:00:00+00:00',
  featured: false, ...over,
});
const codePoints = (s) => [...s].length;

describe('listing page metadata (src/lib/listingSeo.ts)', () => {
  it('canonical path, title with and without a size, first photo as the share image', () => {
    const seo = listingSeo(listing());
    assert.equal(seo.path, '/properties/APR-A0A000');
    assert.equal(seo.title, 'Warehouse for Lease in Valenzuela (1,000 sqm) | Alpha Premier Realty');
    assert.equal(seo.image, `${ORIGIN}/uploads/drive/a.webp`);
    const bare = listingSeo(listing({ size: '', photos: [] }));
    assert.equal(bare.title, 'Warehouse for Lease in Valenzuela | Alpha Premier Realty');
    assert.equal(bare.image, undefined);
  });

  it('description: title + size, price (or "Rate on request"), terms; parts trimmed, trailing periods dropped', () => {
    assert.equal(
      listingSeo(listing({ terms: [' Min. 2 years lease. ', '', '3 months deposit...'] })).description,
      'Warehouse for Lease in Valenzuela, 1,000 sqm. Rate: ₱180/sqm/month. Min. 2 years lease. 3 months deposit',
    );
    assert.equal(
      listingSeo(listing({ size: '', price: '', terms: [] })).description,
      'Warehouse for Lease in Valenzuela. Rate on request',
    );
  });

  it('description over 160 code points is cut at the last space within 159 and ends with …', () => {
    const terms = ['₱₱₱ deposit and advance', 'Loading bay for 40-footer trucks with 24/7 security and CCTV', 'Near NLEX Valenzuela exit, PEZA-ready, ideal for logistics and cold storage operators'];
    const full = ['Warehouse for Lease in Valenzuela, 1,000 sqm', 'Rate: ₱180/sqm/month', ...terms].join('. ');
    assert.ok(codePoints(full) > 160);
    const { description } = listingSeo(listing({ terms }));
    assert.ok(codePoints(description) <= 160, String(codePoints(description)));
    assert.ok(description.endsWith('…'));
    const kept = description.slice(0, -1);
    assert.ok(full.startsWith(kept));
    assert.equal(full[kept.length], ' ', 'cut at a word boundary');
    assert.equal(kept, [...full].slice(0, 159).join('').replace(/ [^ ]*$/, ''));
    // Exactly 160 code points is kept whole: ₱ (3 UTF-8 bytes) and 🏢 (2 UTF-16 units) count once each.
    const exact = listing({ title: 'x', size: '', price: `${'₱'.repeat(100)}${'🏢'.repeat(57)}`, terms: [] });
    assert.equal(codePoints(listingSeo(exact).description), 160);
    assert.ok(!listingSeo(exact).description.endsWith('…'));
  });

  it('JSON-LD: RealEstateListing + BreadcrumbList for the listing URL', () => {
    const [node, crumbs] = listingSeo(listing()).jsonLd;
    assert.deepEqual(node, {
      '@type': 'RealEstateListing',
      '@id': `${URL_A}#listing`,
      url: URL_A,
      name: 'Warehouse for Lease in Valenzuela',
      description: 'Warehouse for Lease in Valenzuela, 1,000 sqm. Rate: ₱180/sqm/month. Min. 2 years lease',
      identifier: 'APR-A0A000',
      image: [`${ORIGIN}/uploads/drive/a.webp`, `${ORIGIN}/uploads/drive/b.jpg`],
      datePosted: '2026-10-01T00:00:00+00:00',
      dateModified: '2026-10-11T00:00:00+00:00',
      contentLocation: { '@type': 'Place', name: 'Valenzuela', address: { '@type': 'PostalAddress', addressLocality: 'Valenzuela', addressCountry: 'PH' } },
      offers: {
        '@type': 'Offer',
        businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
        description: 'Rate: ₱180/sqm/month',
        availability: 'https://schema.org/InStock',
        seller: { '@id': `${ORIGIN}/#organization`, name: 'Alpha Premier Realty' },
      },
    });
    assert.deepEqual(crumbs, {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Alpha Premier Realty', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Available Properties', item: `${ORIGIN}/properties` },
        { '@type': 'ListItem', position: 3, name: 'Warehouse for Lease in Valenzuela', item: URL_A },
      ],
    });
    assert.equal(listingSeo(listing({ deal: 'sale' })).jsonLd[0].offers.businessFunction, 'http://purl.org/goodrelations/v1#Sell');
  });

  it('JSON-LD leaves out empty values', () => {
    const [node] = listingSeo(listing({ deal: '', price: '', photos: [], added: '', updated: '', area: '' })).jsonLd;
    for (const key of ['image', 'datePosted', 'dateModified', 'contentLocation']) assert.ok(!(key in node), key);
    assert.ok(!('businessFunction' in node.offers));
    assert.equal(node.offers.description, 'Rate on request');
    assert.ok(!('name' in listingSeo(listing({ title: '' })).jsonLd[0]));
  });
});
