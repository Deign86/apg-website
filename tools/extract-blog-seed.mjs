/**
 * One-off extractor: pulls the hardcoded blog arrays out of the 7 subsidiary
 * route files into a single JSON seed file for api/migrate-blogs.php.
 *
 * The arrays are module-local (not exported), and two of them reference Vite
 * asset imports, so we brace-match the literal and evaluate it with the image
 * identifiers bound to their new /imports/... public paths.
 *
 * Usage: node tools/extract-blog-seed.mjs > tools/blog-seed.json
 */
import fs from 'node:fs';

/**
 * Slice out a balanced [ ... ] or { ... } literal that begins at the end of
 * `marker`, skipping over strings, template literals, and comments.
 */
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

function evalLiteral(text, prelude = '') {
  // eslint-disable-next-line no-new-func
  return new Function(`${prelude}\nreturn (${text});`)();
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toSqlDate(display) {
  if (!display) return null;
  const d = new Date(display);
  if (Number.isNaN(d.getTime())) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} 09:00:00`;
}

const read = (rel) => fs.readFileSync(rel, 'utf8');

const SOURCES = [
  {
    enterprise: 'realty',
    file: 'src/routes/subsidiaries/alpha-realty/app/data.ts',
    marker: 'export const BLOG_POSTS: BlogPost[] = [',
    prelude: '',
  },
  {
    enterprise: 'alta-venture',
    file: 'src/routes/subsidiaries/alta-venture/Blogs.jsx',
    marker: 'const BLOG_POSTS = [',
    prelude: '',
  },
  {
    enterprise: 'dynamic-tree',
    file: 'src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx',
    marker: 'const BLOG_POSTS = [',
    prelude: [1, 2, 3, 4, 5, 6, 7].map((n) => `const model${n} = "/imports/model${n}.jpg";`).join('\n'),
  },
  {
    // dynamic-tree keeps its hero article in a separate object rather than
    // inside the array, so it needs its own extraction pass.
    enterprise: 'dynamic-tree',
    file: 'src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx',
    marker: 'const FEATURED_POST = {',
    forceFeatured: true,
    prelude: [1, 2, 3, 4, 5, 6, 7].map((n) => `const model${n} = "/imports/model${n}.jpg";`).join('\n'),
  },
  {
    enterprise: 'swiftclear',
    file: 'src/routes/subsidiaries/swift-clear/app/App.tsx',
    marker: 'const blogs = [',
    prelude: [1, 2, 3, 4].map((n) => `const blog${n}Img = "/imports/swiftclear-blog-${n}.png";`).join('\n'),
  },
];

// Construction and Prime88 reference plain string maps (IMG.* / ASSETS.*),
// so we evaluate those maps first and hand them to the array evaluator.
{
  const src = read('src/routes/subsidiaries/Construction.jsx');
  const IMG = evalLiteral(extractLiteral(src, 'const IMG = {'));
  const posts = evalLiteral(extractLiteral(src, 'const BLOG_POSTS = ['), `const IMG = ${JSON.stringify(IMG)};`);
  const featured = evalLiteral(extractLiteral(src, 'const BLOG_FEATURED = {'), `const IMG = ${JSON.stringify(IMG)};`);
  SOURCES.push({
    enterprise: 'construction',
    file: 'src/routes/subsidiaries/Construction.jsx',
    resolved: [{ ...featured, featured: true }, ...posts],
  });
}
{
  const src = read('src/routes/subsidiaries/Prime88.jsx');
  const ASSETS = evalLiteral(extractLiteral(src, 'const ASSETS = {'));
  const posts = evalLiteral(extractLiteral(src, 'const BLOG_POSTS = ['), `const ASSETS = ${JSON.stringify(ASSETS)};`);
  SOURCES.push({ enterprise: '88prime', file: 'src/routes/subsidiaries/Prime88.jsx', resolved: posts });
}
{
  const src = read('src/routes/subsidiaries/luxe-prime/app/App.tsx');
  const posts = evalLiteral(extractLiteral(src, 'const BLOGS = ['));
  SOURCES.push({ enterprise: 'luxe-prime', file: 'src/routes/subsidiaries/luxe-prime/app/App.tsx', resolved: posts });
}

// ------------------------------------------------------------------ normalize

const used = new Set();
const out = [];

for (const source of SOURCES) {
  const raw = source.resolved ?? evalLiteral(extractLiteral(read(source.file), source.marker), source.prelude);
  const list = Array.isArray(raw) ? raw : [raw];

  for (const post of list) {
    const title = String(post.title ?? '').trim();
    if (!title) continue;

    const content = String(post.content ?? post.body ?? post.excerpt ?? '').trim();
    const excerpt = String(post.excerpt ?? post.summary ?? '').trim();

    let slug = post.slug ? slugify(post.slug) : slugify(title);
    if (!slug) slug = slugify(`${source.enterprise}-article`);
    let candidate = slug;
    let n = 2;
    while (used.has(candidate)) candidate = `${slug}-${n++}`;
    used.add(candidate);

    out.push({
      enterprise_slug: source.enterprise,
      source_file: source.file,
      slug: candidate,
      title,
      excerpt,
      // Preserve the original display casing: the subsidiary pages filter and
      // render these strings verbatim (e.g. "Finance", "CX", "Market Trends").
      category: String(post.category ?? post.cat ?? post.tag ?? 'GENERAL').trim(),
      content: content || title,
      read_time: post.readTime ?? post.read ?? null,
      is_featured: (post.featured === true || post.id === 'blog-featured' || source.forceFeatured) ? 1 : 0,
      published_at: toSqlDate(post.date ?? post.published_at),
      cover_image_url: post.cover_image_url ?? post.image ?? post.img ?? null,
    });
  }
}

process.stdout.write(JSON.stringify(out, null, 2) + '\n');
process.stderr.write(`Extracted ${out.length} articles across ${SOURCES.length} sources\n`);
for (const s of SOURCES) {
  process.stderr.write(`  ${s.enterprise.padEnd(14)} ${out.filter((p) => p.enterprise_slug === s.enterprise).length}\n`);
}
