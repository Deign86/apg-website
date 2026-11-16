import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

// The sync script runs on load, so only its top-level consts and functions are taken (functions start and end at column 0).
const source = fs.readFileSync(new URL('../../api/cron/drive-sync.php', import.meta.url), 'utf8');
const declarations = source.match(/^const [A-Z_]+ = [^\n]*|^function \w+\([\s\S]*?\n\}/gm).join('\n');

function php(code) {
  const run = spawnSync('php', [], { input: `<?php\n${declarations}\n${code}`, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  return JSON.parse(run.stdout);
}

describe('Drive sync folder names (api/cron/drive-sync.php)', () => {
  it('reads area and size whether or not the comma follows the city', () => {
    const names = [
      'Valenzuela, 1,000 Lingunan',
      'Manila City, 43.59-408.76 Paco',
      'Makati City 80 Legazpi Village',
      'Davao City 2,355, Toril',
      'NUEVA ECIJA 390, Eugenio Street corner Curamen Street',
      'Angeles City 2,000sqm',
      'Call 0917-123-4567, 500 sqm office',
    ];
    assert.deepEqual(php(`echo json_encode(array_map('folderFacts', ${JSON.stringify(names)}));`), [
      { area: 'Valenzuela', size: '1,000 sqm' },
      { area: 'Manila City', size: '43.59-408.76 sqm' },
      { area: 'Makati City', size: '80 sqm' },
      { area: 'Davao City', size: '2,355 sqm' },
      { area: 'Nueva Ecija', size: '390 sqm' },
      { area: 'Angeles City', size: '2,000 sqm' },
      { area: 'Metro Manila', size: '500 sqm' },
    ]);
  });

  it('lists a folder missing the comma when it holds the listing doc, and walks into numbered category folders', () => {
    const listings = php(`
      $folder = fn(string $id, string $name) => ['id' => $id, 'name' => $name, 'mimeType' => FOLDER_MIME];
      $doc = fn(string $id) => ['id' => $id, 'name' => 'doc', 'mimeType' => DOC_MIME];
      $tree = [
          'root' => [$folder('c', 'COMMERCIAL SPACE'), $folder('vo', 'Virtual Office for posting')],
          'c' => [$folder('lease', 'For lease')],
          'lease' => [$folder('a', 'Makati City, 25 Pio del Pilar'), $folder('b', 'Makati City 80 Legazpi Village'), $folder('batch', 'Batch 2')],
          'a' => [$doc('ad')],
          'b' => [$doc('bd')],
          'batch' => [$folder('p', 'Pasig, 120 Kapitolyo')],
          'vo' => [$folder('v', '2026 NEW VIRTUAL OFFICE')],
          'v' => [$doc('vd'), $folder('vl', 'Taguig, 30 BGC')],
      ];
      $out = [];
      if (!walk(fn(string $id) => $tree[$id] ?? [], fn(array $d) => ['rate ' . $d['id']], 'root', [], $out)) {
          exit(1);
      }
      echo json_encode(array_map(fn($l) => [$l['name'], implode(' > ', $l['path']), $l['public'], $l['terms']], $out));
    `);
    assert.deepEqual(listings, [
      ['Makati City, 25 Pio del Pilar', 'COMMERCIAL SPACE > For lease', true, ['rate ad']],
      ['Makati City 80 Legazpi Village', 'COMMERCIAL SPACE > For lease', true, ['rate bd']],
      ['Pasig, 120 Kapitolyo', 'COMMERCIAL SPACE > For lease > Batch 2', true, []],
      ['Taguig, 30 BGC', 'Virtual Office for posting > 2026 NEW VIRTUAL OFFICE', false, []],
    ]);
  });
});
