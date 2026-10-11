// The stack builds the test DB the way a fresh production install does (api/schema.sql, then
// api/migrate.php). These checks pin that path: it must succeed and be safe to re-run.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, TEST_DB, env } from '../support/env.mjs';

describe('fresh install: schema.sql + migrate.php', () => {
  it('the stack\'s migrate run reported no failures', () => {
    const log = fs.readFileSync(path.join(ROOT, 'test-results/migrate.log'), 'utf8');
    assert.match(log, /Migration complete with no failures\./, log.slice(-1500));
    assert.doesNotMatch(log, /\bWARN\b|\bFAILED\b|ERROR/);
  });

  it('migrate.php is idempotent (second run on the same DB: no failures)', () => {
    const run = spawnSync(env('PHP_BINARY', 'php'), ['api/migrate.php'], {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, DB_NAME: TEST_DB, SMTP_HOST: '127.0.0.1', SMTP_PORT: '9', GEMINI_API_KEY: '' },
    });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /Migration complete with no failures\./, run.stdout.slice(-1500));
    assert.match(run.stdout, /present\s+admins\.session_version/);
  });

  it('refuses to reset a database that is not a *_test database', () => {
    const run = spawnSync(env('PHP_BINARY', 'php'), ['tests/support/reset-db.php', 'create'], {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, DB_NAME: 'apg_website' },
    });
    assert.equal(run.status, 2);
    assert.match(run.stderr, /Refusing/);
  });
});
