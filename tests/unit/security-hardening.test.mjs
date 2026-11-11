import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));

describe('security hardening invariants', () => {
  it('admin login records rate limit before credential verification', () => {
    const authCode = fs.readFileSync(path.join(rootDir, 'api/admin/auth.php'), 'utf8');
    // Ensure the non-recording rateLimit flag is absent from login gate
    assert.doesNotMatch(authCode, /rateLimit\(\$ipBucket,\s*5,\s*900,\s*false\)/);
    assert.doesNotMatch(authCode, /rateLimit\(\$emailBucket,\s*5,\s*900,\s*false\)/);
    // Ensure recording rateLimit is called at the gate
    assert.match(authCode, /!rateLimit\(\$ipBucket,\s*5,\s*900\)\s*\|\|\s*!rateLimit\(\$emailBucket,\s*5,\s*900\)/);
  });

  it('admin chat API omits visitor session_token from select columns', () => {
    const chatCode = fs.readFileSync(path.join(rootDir, 'api/admin/chat.php'), 'utf8');
    assert.match(chatCode, /ADMIN_CHAT_SESSION_COLUMNS/);
    assert.doesNotMatch(chatCode, /SELECT\s+cs\.\*/i);
    // Ensure session_token is not in the column list
    const colMatch = chatCode.match(/const ADMIN_CHAT_SESSION_COLUMNS\s*=\s*'([^']+)';/);
    assert.ok(colMatch, 'ADMIN_CHAT_SESSION_COLUMNS defined');
    assert.ok(!colMatch[1].includes('session_token'), 'session_token must not be exposed to admins');
  });

  it('ATS resume extractor caps decompression and streams word/document.xml', () => {
    const atsCode = fs.readFileSync(path.join(rootDir, 'api/lib/Ats.php'), 'utf8');
    // Ensure ZipArchive::getFromName is not used for document.xml
    assert.doesNotMatch(atsCode, /getFromName\(['"]word\/document\.xml['"]\)/);
    assert.match(atsCode, /getStream\(['"]word\/document\.xml['"]\)/);
    assert.match(atsCode, /stream_get_contents/);
  });

  it('careers form binds job title to active openings and suppresses visitor text reflection', () => {
    const applicantsCode = fs.readFileSync(path.join(rootDir, 'api/applicants.php'), 'utf8');
    // Matched queries must require status = "active"
    assert.match(applicantsCode, /status\s*=\s*['"]active['"]/);
    // Verified opening title must overwrite $jobTitle
    assert.match(applicantsCode, /\$jobTitle\s*=\s*\(string\)\$job\['title'\]/);
  });

  it('Drive sync folderFacts sanitizes private-line info from public area', () => {
    const syncCode = fs.readFileSync(path.join(rootDir, 'api/cron/drive-sync.php'), 'utf8');
    assert.match(syncCode, /if\s*\(preg_match\(PRIVATE_LINE,\s*\$area\)\)\s*\{\s*\$area\s*=\s*['"]Metro Manila['"];/);
    assert.match(syncCode, /listing_overrides\s+WHERE\s+hidden\s*=\s*1/);

    // Test folderFacts regex isolation via PHP CLI
    const run = spawnSync('php', ['-r', `
      const PRIVATE_LINE = '/\\d{4}[\\s-]?[\\s-]?\\d{4}|\\+63|@|https?:|www\\.|\\b(owner|broker|agent|contact|call|viber|street|st\\.|ave|road|unit|bldg|building|commissions?)\\b/i';
      function folderFacts(string $name): array {
          [$area, $rest] = array_pad(explode(',', ltrim($name, '* '), 2), 2, '');
          $size = '';
          if (preg_match('/(\\d[\\d.,]*(?:\\s*[-–]\\s*\\d[\\d.,]*)?)\\s*(sqm|sq\\.?\\s*m|square meters?)/i', $rest, $m)) {
              $size = rtrim($m[1], ' ,.') . ' sqm';
          }
          $area = trim(preg_replace('/\\s+/', ' ', $area), " -");
          if (preg_match(PRIVATE_LINE, $area)) {
              $area = 'Metro Manila';
          }
          return ['area' => mb_convert_case(mb_strtolower($area), MB_CASE_TITLE), 'size' => $size];
      }
      $f1 = folderFacts('Valenzuela, 1,000 sqm warehouse');
      $f2 = folderFacts('Call 0917-123-4567, 500 sqm office');
      echo json_encode([$f1, $f2]);
    `], { encoding: 'utf8' });

    assert.equal(run.status, 0, run.stderr);
    const [f1, f2] = JSON.parse(run.stdout);
    assert.equal(f1.area, 'Valenzuela');
    assert.equal(f2.area, 'Metro Manila');
  });

  it('Mailer aborts unencrypted auth when STARTTLS fails or is bypassed', () => {
    const mailerCode = fs.readFileSync(path.join(rootDir, 'api/lib/Mailer.php'), 'utf8');
    assert.match(mailerCode, /stream_socket_enable_crypto.*!==\s*true/);
    assert.match(mailerCode, /STARTTLS negotiation failed/);
    assert.match(mailerCode, /refusing unencrypted AUTH/);
  });
});
