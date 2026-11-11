import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// toListing is module-private; tests/support/unit-loader.mjs exports it for this suite only.
import { toListing, isNewListing, isUpdatedListing, isRecentlyUpdatedListing, listingDateLabel, priceParts, groupTerms } from '../../src/hooks/useListings.ts';

const row = (over = {}) => ({
  ref: 'APR-A0A00F', title: 'Office', type: 'office', type_label: 'Office Space', deal: 'lease', area: 'Pasig',
  size: '100 sqm', price: '₱1', terms: ['a'], photos: ['/uploads/drive/a.webp'], added: '', updated: '', featured: false, ...over,
});

describe('useListings feed parsing (toListing)', () => {
  it('keeps a well-formed row', () => {
    const l = toListing(row({ featured: true }));
    assert.equal(l.ref, 'APR-A0A00F');
    assert.equal(l.featured, true);
    assert.deepEqual(l.photos, ['/uploads/drive/a.webp']);
  });

  it('drops rows without a valid APR-XXXXXX ref', () => {
    for (const ref of [undefined, '', 'APR-a0a00f', 'APR-A0A00', 'APR-A0A00G', 'APR-A0A0000', ' APR-A0A00F', 'apr-A0A00F', 'XAPR-A0A00F']) {
      assert.equal(toListing(row({ ref })), null, String(ref));
    }
  });

  it('keeps only same-origin /uploads/drive/ photos', () => {
    const l = toListing(row({ photos: ['/uploads/drive/ok.jpg', 'https://evil.test/x.jpg', '//evil.test/x.jpg', '/uploads/other/x.jpg', 'javascript:alert(1)', '/uploads/drive2/x.jpg'] }));
    assert.deepEqual(l.photos, ['/uploads/drive/ok.jpg']);
    assert.deepEqual(toListing(row({ photos: 'not-a-list' })).photos, []);
  });

  it('pairs each photo with its card copy, falling back to the photo itself', () => {
    const l = toListing(row({
      photos: ['https://evil.test/x.jpg', '/uploads/drive/a.jpg', '/uploads/drive/b.jpg', '/uploads/drive/c.jpg'],
      cards: ['/uploads/drive/x-card.jpg', '/uploads/drive/a-card.jpg', 'https://evil.test/b-card.jpg'],
    }));
    assert.deepEqual(l.photos, ['/uploads/drive/a.jpg', '/uploads/drive/b.jpg', '/uploads/drive/c.jpg']);
    assert.deepEqual(l.cards, ['/uploads/drive/a-card.jpg', '/uploads/drive/b.jpg', '/uploads/drive/c.jpg']);
    assert.deepEqual(toListing(row()).cards, ['/uploads/drive/a.webp'], 'a feed from before card copies');
  });

  it('normalises missing / wrong-typed fields', () => {
    const l = toListing({ ref: 'APR-000001', deal: 'rent', featured: 'yes', terms: null });
    assert.equal(l.title, '');
    assert.equal(l.deal, '');
    assert.equal(l.featured, false);
    assert.deepEqual(l.terms, []);
    assert.deepEqual(l.photos, []);
    assert.deepEqual(toListing(row({ terms: [1, 'two'] })).terms, ['1', 'two']);
  });

  it('keeps a lowercase area slug (what browse-page paths use); anything else becomes ""', () => {
    assert.equal(toListing(row({ area_slug: 'san-fernando-pampanga' })).area_slug, 'san-fernando-pampanga');
    for (const area_slug of [undefined, null, '', 'Cavite', 'las piñas', '../x', 'a/b', ' cavite']) {
      assert.equal(toListing(row({ area_slug })).area_slug, '', String(area_slug));
    }
  });

  it('flags listings added in the last 14 days as new', () => {
    assert.equal(isNewListing(toListing(row({ added: new Date().toISOString() }))), true);
    assert.equal(isNewListing(toListing(row({ added: '2020-01-01T00:00:00Z' }))), false);
    assert.equal(isNewListing(toListing(row({ added: '' }))), false);
  });

  // Real lines from the live feed (Drive docs typed by staff, often pasted from social posts).
  it('cleans emoji, invisible characters and styled letters out of the text', () => {
    const l = toListing(row({
      title: '﻿Condo / House for Lease in Quezon City (Stylish 2Br Unit At Circulo Verde',
      price: '💰 ₱13,000/month + VAT (exclusive of utilities)',
      terms: ['📆 Minimum of 1-year lease', '🏠𝑩𝒂𝒓𝒆 𝑼𝒏𝒊𝒕: Php 43,500.00', '1️⃣ unit left', '   ', '💼 Rent is inclusive of VAT and CUSA'],
    }));
    assert.equal(l.title, 'Condo / House for Lease in Quezon City (Stylish 2Br Unit At Circulo Verde)');
    assert.equal(l.price, '₱13,000/month + VAT (exclusive of utilities)');
    assert.deepEqual(l.terms, ['Minimum of 1-year lease', 'Bare Unit: Php 43,500.00', '1 unit left', 'Rent is inclusive of VAT and CUSA']);
  });

  it("drops the doc's title line from the top of the terms, and as the price", () => {
    const l = toListing(row({
      price: '﻿COMMERCIAL SPACE FOR RENT in Legazpi City, Albay',
      terms: ['﻿OFFICE SPACE FOR RENT/LEASE IN QUEZON CITY, METRO MANILA', 'Lease Terms:', '2 Months Advance', 'Not for sale to minors'],
    }));
    assert.equal(l.price, '');
    assert.deepEqual(l.terms, ['Lease Terms:', '2 Months Advance', 'Not for sale to minors']);
    // A line with a number in it is a rate, not a title.
    assert.equal(toListing(row({ price: 'Office for lease: ₱500/sqm' })).price, 'Office for lease: ₱500/sqm');
  });

  it('drops repeated term lines and the price line repeated among the terms', () => {
    const l = toListing(row({
      price: '₱300 / SQM fixed rate 2 months advance 2 months deposits',
      terms: ['CUSA :10 per sqm', '₱300 / SQM fixed rate 2 months advance 2 months deposits', 'CUSA :10 per sqm'],
    }));
    assert.deepEqual(l.terms, ['CUSA :10 per sqm']);
  });

  it('joins a bare price label with the first term that has a number', () => {
    const l = toListing(row({ price: '💰 Rental Rate:', terms: ['Fully furnished (TV not included)', 'PHP 40,000/month (inclusive of association dues)', 'Minimum 1-year lease'] }));
    assert.equal(l.price, 'Rental Rate: PHP 40,000/month (inclusive of association dues)');
    assert.deepEqual(l.terms, ['Fully furnished (TV not included)', 'Minimum 1-year lease']);
    assert.equal(toListing(row({ price: 'Monthly Rent:', terms: ['Gross vat', 'No advance rent'] })).price, '');
  });

  it('switches from Listed since to Last updated when updated at least 24h after added', () => {
    const initial = toListing(row({ added: '2026-10-11T12:00:00Z', updated: '2026-10-11T14:00:00Z' }));
    assert.equal(isUpdatedListing(initial), false);
    assert.deepEqual(listingDateLabel(initial), {
      label: 'Listed since',
      date: 'Oct 11, 2026',
      iso: '2026-10-11T12:00:00Z',
    });

    const recentIso = new Date().toISOString();
    const updated = toListing(row({ added: '2026-09-01T00:00:00Z', updated: recentIso }));
    assert.equal(isUpdatedListing(updated), true);
    assert.equal(isRecentlyUpdatedListing(updated), true);
    assert.equal(listingDateLabel(updated).label, 'Last updated');
    assert.equal(listingDateLabel(updated).iso, recentIso);

    assert.equal(listingDateLabel(toListing(row({ added: '', updated: '' }))), null);
  });

  const fixture = new URL('../../api/data/listings.generated.json', import.meta.url);
  it('every row of the local listings feed parses', { skip: !fs.existsSync(fixture) && 'api/data/listings.generated.json not present (run drive-sync or the QA fixture)' }, () => {
    const feed = JSON.parse(fs.readFileSync(fixture, 'utf8'));
    assert.ok(feed.listings.length > 0);
    for (const r of feed.listings) assert.ok(toListing(r), r.ref);
  });
});

describe('listing price and terms for display (priceParts, groupTerms)', () => {
  it('splits a price into its label, amount and bracketed note', () => {
    assert.deepEqual(priceParts('Monthly Rent: ₱45,000 (monthly dues included)'), { label: 'Monthly Rent', amount: '₱45,000', note: 'monthly dues included' });
    assert.deepEqual(priceParts('Rate: ₱450 per sqm'), { label: 'Rate', amount: '₱450 per sqm', note: '' });
    assert.deepEqual(priceParts('₱16,500/month'), { label: '', amount: '₱16,500/month', note: '' });
    assert.deepEqual(priceParts('₱13,000/month + VAT (exclusive of utilities)'), { label: '', amount: '₱13,000/month + VAT', note: 'exclusive of utilities' });
    // A unit row is not a label: the part before the colon has a number.
    assert.deepEqual(priceParts('G3-A – 139 sqm: ₱97,300/month'), { label: '', amount: 'G3-A – 139 sqm: ₱97,300/month', note: '' });
    assert.deepEqual(priceParts(''), { label: '', amount: '', note: '' });
  });

  it('groups terms under their "Heading:" lines and drops empty headings', () => {
    assert.deepEqual(groupTerms(['Warm shell', 'Lease Terms:', '2 Months Advance', '2 Months Deposit', 'Parking:', 'Rates:', '₱5,000/slot']), [
      { heading: '', items: ['Warm shell'] },
      { heading: 'Lease Terms', items: ['2 Months Advance', '2 Months Deposit'] },
      { heading: 'Rates', items: ['₱5,000/slot'] },
    ]);
    assert.deepEqual(groupTerms([]), []);
  });
});
