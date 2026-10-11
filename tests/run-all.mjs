// `npm test`: unit, API and browser suites in order. Each suite runs even when an earlier one fails,
// so one run reports everything; the exit code is non-zero if any suite failed.
import { spawnSync } from 'node:child_process';
import { ROOT } from './support/env.mjs';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const results = [];
for (const suite of ['test:unit', 'test:api', 'test:e2e']) {
  const started = Date.now();
  const run = spawnSync(npm, ['run', suite], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  results.push({ suite, ok: run.status === 0, seconds: Math.round((Date.now() - started) / 1000) });
}
console.log('\nSummary');
for (const r of results) console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.suite.padEnd(9)} ${r.seconds}s`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
