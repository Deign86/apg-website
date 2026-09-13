/**
 * One-off cleanup: removes the hardcoded careers/services/blog arrays that have
 * been migrated into the database (see api/migrate.php).
 *
 * The same brace-matching scanner used by the extractors, so nested objects,
 * template literals and comments are handled correctly.
 *
 * Usage: node tools/remove-arrays.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Returns [startIndex, endIndexExclusive] of the balanced literal after `marker`. */
function literalRange(src, marker) {
  const at = src.indexOf(marker);
  if (at < 0) return null;
  const openIdx = at + marker.length - 1;
  const open = src[openIdx];
  const close = open === '[' ? ']' : '}';
  let depth = 0;
  let inStr = null;
  let inLine = false;
  let inBlock = false;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && next === '/') { inBlock = false; i++; } continue; }
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '/' && next === '/') { inLine = true; i++; continue; }
    if (c === '/' && next === '*') { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) {
      let end = i + 1;
      while (end < src.length && (src[end] === '\n' || src[end] === '\r')) end++;
      return [at, end];
    }
  }
  throw new Error(`unbalanced literal for ${marker}`);
}

const MANIFEST = [
  { file: 'src/routes/subsidiaries/alpha-realty/app/data.ts', markers: ['export const JOB_OPENINGS: JobOpening[] = [', 'export const REALTY_SERVICES = ['] },
  { file: 'src/routes/subsidiaries/alta-venture/Careers.jsx', markers: ['const JOBS_DATA = ['] },
  { file: 'src/routes/subsidiaries/alta-venture/Services.jsx', markers: ['const SERVICES_DATA = ['] },
  { file: 'src/routes/subsidiaries/Construction.jsx', markers: ['const JOB_LISTINGS = ['] },
  { file: 'src/routes/subsidiaries/dynamic-tree/app/pages/Careers.tsx', markers: ['const OPEN_POSITIONS = ['] },
  { file: 'src/routes/subsidiaries/dynamic-tree/app/pages/Services.tsx', markers: ['const SERVICES = ['] },
  { file: 'src/routes/subsidiaries/dynamic-tree/app/pages/Home.tsx', markers: ['const SERVICES = ['] },
  { file: 'src/routes/subsidiaries/luxe-prime/app/App.tsx', markers: ['const SERVICES = [', 'const CAREERS = [', 'const LUXE_POSITIONS = ['] },
  { file: 'src/routes/subsidiaries/Prime88.jsx', markers: ['const JOBS = ['] },
  { file: 'src/routes/subsidiaries/swift-clear/app/App.tsx', markers: ['const services = [', 'const positions = ['] },
];

const dry = process.argv.includes('--dry');
let totalRemoved = 0;

for (const { file, markers } of MANIFEST) {
  const full = path.join(ROOT, file);
  let src = fs.readFileSync(full, 'utf8');
  const before = src.length;

  // Remove from the bottom up so earlier offsets stay valid.
  const ranges = markers
    .map((m) => literalRange(src, m))
    .filter(Boolean)
    .sort((a, b) => b[0] - a[0]);

  for (const [start, end] of ranges) {
    src = src.slice(0, start) + src.slice(end);
  }

  const removed = before - src.length;
  totalRemoved += removed;
  const label = file.replace('src/routes/subsidiaries/', '');
  if (dry) {
    console.log(`  ${label}: would remove ${ranges.length} literal(s), ${removed} bytes`);
  } else {
    fs.writeFileSync(full, src);
    console.log(`  ${label}: removed ${ranges.length} literal(s), ${removed} bytes`);
  }
}

console.log(`\n${dry ? 'Would remove' : 'Removed'} ${totalRemoved} bytes total.`);
