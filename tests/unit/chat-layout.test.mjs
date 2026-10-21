// src/lib/chatLayout.ts: chat replies that run several listings together are shown one listing per line.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const { splitListingRun } = await import('../../src/lib/chatLayout.ts');

describe('splitListingRun', () => {
  it('splits a run of listings into an intro, one bullet per listing and a closing paragraph', () => {
    const line = 'Yes, we have several properties available in Valenzuela. Here are some of our current listings: '
      + '(APR-8C9E2B) Office space, 100 sqm, ₱850/sqm/month; (APR-DC8FE8) Office space, 100 sqm, ₱850/sqm/month; '
      + 'and [APR-C11712] Office or commercial space, 25-41 sqm, starting at ₱19,155/month. '
      + 'Prices are subject to confirmation by the team.';
    assert.deepEqual(splitListingRun(line), [
      'Yes, we have several properties available in Valenzuela. Here are some of our current listings:',
      '- (APR-8C9E2B) Office space, 100 sqm, ₱850/sqm/month',
      '- (APR-DC8FE8) Office space, 100 sqm, ₱850/sqm/month',
      '- [APR-C11712] Office or commercial space, 25-41 sqm, starting at ₱19,155/month.',
      '',
      'Prices are subject to confirmation by the team.',
    ]);
  });

  it('handles comma joiners, no intro and no closing sentence', () => {
    assert.deepEqual(splitListingRun('[APR-AAAAAA] Lot, 300 sqm, [APR-BBBBBB] Warehouse, 1,200 sqm'), [
      '- [APR-AAAAAA] Lot, 300 sqm',
      '- [APR-BBBBBB] Warehouse, 1,200 sqm',
    ]);
  });

  it('keeps a listing page link inside its own item', () => {
    const url = 'https://realty.alphapremiergroup.com/properties/APR-AAAAAA';
    assert.deepEqual(splitListingRun(`[APR-AAAAAA] Office, 50 sqm (${url}); [APR-BBBBBB] Lot. See ${url} for photos.`), [
      `- [APR-AAAAAA] Office, 50 sqm (${url})`,
      '- [APR-BBBBBB] Lot.',
      '',
      `See ${url} for photos.`,
    ]);
  });

  it('leaves single listings, plain text and existing list items alone', () => {
    for (const line of [
      'We have one match: [APR-AAAAAA] Office, 50 sqm.',
      'Our office is open Monday to Friday.',
      '- [APR-AAAAAA] Office, 50 sqm; [APR-BBBBBB] Lot',
      '2. [APR-AAAAAA] Office; [APR-BBBBBB] Lot',
      '',
    ]) {
      assert.deepEqual(splitListingRun(line), [line]);
    }
  });
});
