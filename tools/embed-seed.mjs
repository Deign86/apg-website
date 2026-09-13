#!/usr/bin/env node
/**
 * Injects the seed payloads into api/migrate.php.
 *
 * Why this exists: a Hostinger deploy ships only dist/ + api/ + .htaccess, so the
 * migration cannot read tools/*.json at runtime. Embedding keeps api/migrate.php
 * a single self-contained file that runs from CLI, SSH, or a browser request.
 *
 * Run after regenerating any seed:
 *   node tools/extract-blog-seed.mjs    > tools/blog-seed.json
 *   node tools/extract-content-seed.mjs > tools/content-seed.json
 *   node tools/embed-seed.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = path.join(ROOT, 'api', 'migrate.php');

const BLOCKS = [
  {
    name: 'blog',
    seed: path.join(ROOT, 'tools', 'blog-seed.json'),
    start: '// >>> EMBEDDED_BLOG_SEED_START',
    end: '// <<< EMBEDDED_BLOG_SEED_END',
    constant: 'EMBEDDED_BLOG_SEED_JSON',
    isEmpty: (data) => !Array.isArray(data) || data.length === 0,
    describe: (data) => `${data.length} articles`,
  },
  {
    name: 'content',
    seed: path.join(ROOT, 'tools', 'content-seed.json'),
    start: '// >>> EMBEDDED_CONTENT_SEED_START',
    end: '// <<< EMBEDDED_CONTENT_SEED_END',
    constant: 'EMBEDDED_CONTENT_SEED_JSON',
    isEmpty: (data) => Array.isArray(data)
      ? data.length === 0
      : Object.keys(data ?? {}).length === 0,
    describe: (data) => `${(data.careers ?? []).length} jobs, ${(data.services ?? []).length} services`,
  },
];

/**
 * A nowdoc (<<<'JSON') does not interpolate, so `$` inside content is safe. Guard
 * anyway: a line reading exactly `JSON` would terminate the nowdoc early.
 */
function assertNowdocSafe(data, name) {
  const json = JSON.stringify(data, null, 2);
  if (/^JSON;?$/m.test(json)) {
    console.error(`Refusing to embed ${name}: payload contains a bare "JSON" line.`);
    process.exit(1);
  }
  return json;
}

let php = fs.readFileSync(TARGET, 'utf8');
const summary = [];

for (const block of BLOCKS) {
  if (!fs.existsSync(block.seed)) {
    console.error(`Seed not found: ${block.seed}`);
    console.error('Generate it with the matching tools/extract-*-seed.mjs script first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(block.seed, 'utf8'));
  if (block.isEmpty(data)) {
    console.error(`${path.basename(block.seed)} is empty. Refusing to embed.`);
    process.exit(1);
  }

  const payload = assertNowdocSafe(data, block.name);
  const replacement = `${block.start}\nconst ${block.constant} = <<<'JSON'\n${payload}\nJSON;\n${block.end}`;

  const startAt = php.indexOf(block.start);
  const endAt = php.indexOf(block.end);
  if (startAt < 0 || endAt < 0 || endAt < startAt) {
    console.error(`Embed markers for "${block.name}" not found in ${TARGET}.`);
    process.exit(1);
  }

  php = php.slice(0, startAt) + replacement + php.slice(endAt + block.end.length);
  summary.push(`  ${block.name.padEnd(8)} ${block.describe(data)}`);
}

fs.writeFileSync(TARGET, php);

const kb = (Buffer.byteLength(php) / 1024).toFixed(1);
console.log(`Embedded seed data into api/migrate.php (${kb} KB total):`);
console.log(summary.join('\n'));
