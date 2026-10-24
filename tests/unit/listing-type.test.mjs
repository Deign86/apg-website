// api/lib/Listings.php listingType(): a listing's type is the APR Drive folder it is filed under, so the
// /properties type filters match the Drive. Paths are the real APR LISTING folder names.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CASES = [
  [['OFFICE SPACE', 'FOR LEASE / RENT'], 'office', 'Office Space', 'office-space'],
  [['OFFICE SPACE', 'FOR SALE', 'Office Space'], 'office', 'Office Space', 'office-space'],
  [['COMMERCIAL SPACE', 'For lease'], 'commercial', 'Commercial Space', 'commercial-space'],
  [['COMMERCIAL SPACE', 'For Sale'], 'commercial', 'Commercial Space', 'commercial-space'],
  [['WAREHOUSE', 'FOR LEASE/RENT'], 'warehouse', 'Warehouse', 'warehouse'],
  [['WAREHOUSE', 'FOR SALE'], 'warehouse', 'Warehouse', 'warehouse'],
  // Building folders under a top folder (listing folders without a size) never change its type.
  [['OFFICE SPACE', 'FOR LEASE / RENT', 'Makati, (Mid-Rise Zone) RCBC PLAZA Yuchengco Tower'], 'office', 'Office Space', 'office-space'],
  [['OFFICE SPACE', 'FOR LEASE / RENT', 'Robinsons Commercial Center'], 'office', 'Office Space', 'office-space'],
  [['COMMERCIAL SPACE', 'For lease', 'Ayala Office Tower'], 'commercial', 'Commercial Space', 'commercial-space'],
  // The residential folder is split by its subfolders; "HOUSE AND LOT" in its name must not make everything a Lot.
  [['CONDO / HOUSE AND LOT', 'FOR LEASE/ FOR RENT', 'CONDO / HOUSE'], 'condo', 'Condo / House', 'condo-house'],
  [['CONDO / HOUSE AND LOT', 'FOR LEASE/ FOR RENT', 'LOT'], 'lot', 'Lot', 'lot'],
  [['CONDO / HOUSE AND LOT', 'FOR SALE', 'Condo/House'], 'condo', 'Condo / House', 'condo-house'],
  [['CONDO / HOUSE AND LOT', 'FOR SALE', 'House & Lot'], 'house-lot', 'House and Lot', 'house-and-lot'],
  [['CONDO / HOUSE AND LOT', 'FOR SALE', 'Lot'], 'lot', 'Lot', 'lot'],
  [['LOT'], 'lot', 'Lot', 'lot'],
  [['Contents'], 'property', 'Property', 'property'],
  [[], 'property', 'Property', 'property'],
];

describe('listing type from the APR Drive folders (api/lib/Listings.php listingType)', () => {
  const probe = spawnSync('php', ['-v'], { encoding: 'utf8' });
  it('each Drive category folder is one type, with a browse-page plural and URL slug', { skip: probe.status !== 0 && 'php CLI not available' }, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apg-listing-type-'));
    const file = path.join(dir, 'probe.php');
    const lib = fileURLToPath(new URL('../../api/lib/Listings.php', import.meta.url));
    fs.writeFileSync(file, `<?php require ${JSON.stringify(lib)};
      $paths = json_decode(stream_get_contents(fopen('php://stdin', 'r')), true);
      echo json_encode(array_map(static function (array $path): array {
          [$key, $label] = listingType($path);
          return [$key, $label, HUB_TYPE_PLURALS[$key] ?? null, listingSlug($label)];
      }, $paths), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);`);
    try {
      const run = spawnSync('php', [file], { input: JSON.stringify(CASES.map(([p]) => p)), encoding: 'utf8' });
      assert.equal(run.status, 0, run.stderr);
      const php = JSON.parse(run.stdout);
      CASES.forEach(([folders, key, label, slug], i) => {
        const [gotKey, gotLabel, plural, gotSlug] = php[i];
        assert.deepEqual([gotKey, gotLabel, gotSlug], [key, label, slug], folders.join(' > '));
        // Every real type gets browse pages (/properties/<slug>-for-lease); the 'property' fallback gets none.
        assert.equal(plural !== null, key !== 'property', `${folders.join(' > ')} plural`);
      });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
