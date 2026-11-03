// api/lib/Listings.php splitListingPrice(): which line of a listing's Drive doc is shown as its price.
// A missed price shows "Rate on request" on the Realty site, so common peso formats must be picked up.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CASES = [
  // [doc terms, expected price]
  [['Parking: P5,000/month', 'Rental: Php450/sqm exclusive of CUSA', 'CUSA P80/sqm'], 'Rental: Php450/sqm exclusive of CUSA'],
  [['2 months deposit', 'CUSA P80/sqm', 'P450/sqm'], 'P450/sqm'],
  [['Security deposit P100,000', 'Lease Rates: negotiable'], 'Lease Rates: negotiable'],
  [['Selling Price ₱25M'], 'Selling Price ₱25M'],
  [['PHP 50,000 per month, VAT inclusive'], 'PHP 50,000 per month, VAT inclusive'],
  [['Warm shell', 'Minimum lease 2 years'], ''],
];

describe('listing price from the Drive doc (api/lib/Listings.php splitListingPrice)', () => {
  const probe = spawnSync('php', ['-v'], { encoding: 'utf8' });
  it('picks the rate over dues, deposits and parking, and takes it out of the terms', { skip: probe.status !== 0 && 'php CLI not available' }, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apg-listing-price-'));
    const file = path.join(dir, 'probe.php');
    const lib = fileURLToPath(new URL('../../api/lib/Listings.php', import.meta.url));
    fs.writeFileSync(file, `<?php require ${JSON.stringify(lib)};
      $cases = json_decode(stream_get_contents(fopen('php://stdin', 'r')), true);
      echo json_encode(array_map('splitListingPrice', $cases), JSON_UNESCAPED_UNICODE);`);
    try {
      const run = spawnSync('php', [file], { input: JSON.stringify(CASES.map(([terms]) => terms)), encoding: 'utf8' });
      assert.equal(run.status, 0, run.stderr);
      JSON.parse(run.stdout).forEach(([price, rest], i) => {
        const [terms, want] = CASES[i];
        assert.equal(price, want, terms.join(' | '));
        assert.deepEqual(rest, terms.filter((t) => t !== want));
      });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
