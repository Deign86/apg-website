#!/usr/bin/env node
/**
 * Extracts the hardcoded careers and services arrays out of the subsidiary route
 * files into tools/content-seed.json, for api/migrate.php to load into
 * `job_openings` and `service_items`.
 *
 * The arrays are module-local and reference lucide icon components, so we
 * brace-match the literal and evaluate it with icons bound to null and colour
 * constants bound to placeholder strings. Icons and colours are presentation and
 * stay in the components; only content is migrated.
 *
 * Usage: node tools/extract-content-seed.mjs > tools/content-seed.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** Balanced-literal scanner that skips strings, template literals and comments. */
function extractLiteral(src, marker) {
  const at = src.indexOf(marker);
  if (at < 0) throw new Error(`marker not found: ${marker}`);
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
    else if (c === close && --depth === 0) return src.slice(openIdx, i + 1);
  }
  throw new Error(`unbalanced literal for ${marker}`);
}

// Presentation-only identifiers referenced by the data literals.
const ICONS = [
  'Key', 'Building2', 'TrendingUp', 'Sparkles', 'CheckCircle2', 'ArrowRight', 'Clock', 'Target',
  'Compass', 'Eye', 'ShieldCheck', 'Shield', 'Bug', 'Home', 'HardHat', 'Layers', 'Wind',
  'PackageOpen', 'Grid3X3', 'ChevronRight', 'Upload', 'CheckCircle', 'X', 'Menu', 'Phone', 'Mail',
  'MapPin', 'Send', 'MessageCircle', 'BarChart3', 'Users', 'HeadphonesIcon', 'Code2', 'Briefcase',
  'Star', 'Palette', 'Zap', 'Leaf', 'Truck', 'Thermometer', 'Calendar', 'GraduationCap', 'Heart',
  'Linkedin', 'Facebook', 'Instagram', 'Award', 'Cog', 'Monitor', 'Megaphone', 'Camera', 'Film',
  'Lightbulb', 'Globe', 'FileText', 'UserCheck', 'Droplets', 'SprayCan', 'Brush', 'Ruler', 'Wrench',
  'ImageWithFallback', 'GlowCard', 'Glass', 'Pill',
];
const COLORS = ['ACCENT', 'TEAL', 'TEAL2', 'MINT_LIGHT', 'MUTED', 'GOLD', 'CREAM', 'INK'];

// Image identifiers resolve to their public paths, matching the copies made for
// the blog migration so stored URLs stay valid after the JS imports are removed.
const IMAGES = Object.fromEntries([
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [`model${n}`, `/imports/model${n}.jpg`]),
  ...[1, 2, 3, 4].map((n) => [`blog${n}Img`, `/imports/swiftclear-blog-${n}.png`]),
]);

const PRELUDE = [
  ...ICONS.map((n) => `const ${n} = null;`),
  ...COLORS.map((n) => `const ${n} = '#000000';`),
  ...Object.entries(IMAGES).map(([n, v]) => `const ${n} = ${JSON.stringify(v)};`),
].join('\n');

function evaluate(src, marker) {
  const literal = extractLiteral(src, marker);
  // eslint-disable-next-line no-new-func
  return new Function(`${PRELUDE}\nreturn (${literal});`)();
}

const str = (v) => (v === undefined || v === null ? '' : String(v).trim());
const firstStr = (...vals) => {
  for (const v of vals) {
    const s = str(v);
    if (s) return s;
  }
  return '';
};
const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

// --------------------------------------------------------------------- sources

const CAREERS_SOURCES = [
  { enterprise: 'realty',       file: 'src/routes/subsidiaries/alpha-realty/app/data.ts',           marker: 'export const JOB_OPENINGS: JobOpening[] = [' },
  { enterprise: 'alta-venture', file: 'src/routes/subsidiaries/alta-venture/Careers.jsx',           marker: 'const JOBS_DATA = [' },
  { enterprise: 'construction', file: 'src/routes/subsidiaries/Construction.jsx',                   marker: 'const JOB_LISTINGS = [' },
  { enterprise: 'dynamic-tree', file: 'src/routes/subsidiaries/dynamic-tree/app/pages/Careers.tsx', marker: 'const OPEN_POSITIONS = [' },
  { enterprise: 'luxe-prime',   file: 'src/routes/subsidiaries/luxe-prime/app/App.tsx',             marker: 'const LUXE_POSITIONS = [' },
  { enterprise: '88prime',      file: 'src/routes/subsidiaries/Prime88.jsx',                        marker: 'const JOBS = [' },
  { enterprise: 'swiftclear',   file: 'src/routes/subsidiaries/swift-clear/app/App.tsx',            marker: 'const positions = [' },
];

const SERVICES_SOURCES = [
  { enterprise: 'realty',       file: 'src/routes/subsidiaries/alpha-realty/app/data.ts',              marker: 'export const REALTY_SERVICES = [' },
  { enterprise: 'alta-venture', file: 'src/routes/subsidiaries/alta-venture/Services.jsx',             marker: 'const SERVICES_DATA = [' },
  { enterprise: 'dynamic-tree', file: 'src/routes/subsidiaries/dynamic-tree/app/pages/Services.tsx',   marker: 'const SERVICES = [' },
  { enterprise: 'luxe-prime',   file: 'src/routes/subsidiaries/luxe-prime/app/App.tsx',                marker: 'const SERVICES = [' },
  { enterprise: 'swiftclear',   file: 'src/routes/subsidiaries/swift-clear/app/App.tsx',               marker: 'const services = [' },
];

// ------------------------------------------------------------------ normalize

function normalizeCareer(post, enterprise, index) {
  const title = str(post.title);
  if (!title) return null;
  const requirements = list(post.requirements);
  const responsibilities = list(post.responsibilities);
  return {
    enterprise_slug: enterprise,
    title,
    location: firstStr(post.location, post.loc),
    type: firstStr(post.type, 'Full-Time'),
    tag: firstStr(post.department, post.dept, Array.isArray(post.tags) ? post.tags[0] : ''),
    description: firstStr(post.description, post.desc),
    requirements,
    responsibilities,
    salary: firstStr(post.salary, post.sal),
    is_featured: post.featured === true || post.isFeatured === true ? 1 : 0,
    sort_order: index + 1,
  };
}

function normalizeService(item, enterprise, index) {
  const title = str(item.title);
  if (!title) return null;
  const features = list(item.features).length ? list(item.features) : list(item.points);
  const photos = list(item.photos);
  return {
    enterprise_slug: enterprise,
    title,
    summary: firstStr(item.summary, item.short),
    tag: firstStr(item.tag),
    // `long` is the fuller body on swift-clear; `description`/`desc` elsewhere.
    description: firstStr(item.long, item.description, item.desc, item.short),
    price: firstStr(item.price),
    image_url: firstStr(item.image_url, item.image, photos[0]),
    features,
    photos,
    sort_order: index + 1,
  };
}

const out = { careers: [], services: [] };
const report = [];

for (const source of CAREERS_SOURCES) {
  const rows = evaluate(read(source.file), source.marker);
  let n = 0;
  rows.forEach((post, i) => {
    const row = normalizeCareer(post, source.enterprise, i);
    if (row) { out.careers.push(row); n++; }
  });
  report.push(`  careers   ${source.enterprise.padEnd(14)} ${n}`);
}

for (const source of SERVICES_SOURCES) {
  const rows = evaluate(read(source.file), source.marker);
  let n = 0;
  rows.forEach((item, i) => {
    const row = normalizeService(item, source.enterprise, i);
    if (row) { out.services.push(row); n++; }
  });
  report.push(`  services  ${source.enterprise.padEnd(14)} ${n}`);
}

process.stdout.write(JSON.stringify(out, null, 2) + '\n');
process.stderr.write(`Extracted ${out.careers.length} jobs and ${out.services.length} services\n`);
process.stderr.write(report.join('\n') + '\n');
