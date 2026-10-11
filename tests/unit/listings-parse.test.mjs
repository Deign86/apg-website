import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// toListing is module-private; tests/support/unit-loader.mjs exports it for this suite only.
import { toListing, isNewListing } from '../../src/hooks/useListings.ts';

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

  it('normalises missing / wrong-typed fields', () => {
    const l = toListing({ ref: 'APR-000001', deal: 'rent', featured: 'yes', terms: null });
    assert.equal(l.title, '');
    assert.equal(l.deal, '');
    assert.equal(l.featured, false);
    assert.deepEqual(l.terms, []);
    assert.deepEqual(l.photos, []);
    assert.deepEqual(toListing(row({ terms: [1, 'two'] })).terms, ['1', 'two']);
  });

  it('flags listings added in the last 14 days as new', () => {
    assert.equal(isNewListing(toListing(row({ added: new Date().toISOString() }))), true);
    assert.equal(isNewListing(toListing(row({ added: '2020-01-01T00:00:00Z' }))), false);
    assert.equal(isNewListing(toListing(row({ added: '' }))), false);
  });

  const fixture = new URL('../../api/data/listings.generated.json', import.meta.url);
  it('every row of the local listings feed parses', { skip: !fs.existsSync(fixture) && 'api/data/listings.generated.json not present (run drive-sync or the QA fixture)' }, () => {
    const feed = JSON.parse(fs.readFileSync(fixture, 'utf8'));
    assert.ok(feed.listings.length > 0);
    for (const r of feed.listings) assert.ok(toListing(r), r.ref);
  });
});
