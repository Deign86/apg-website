#!/usr/bin/env node
/**
 * Build-time prerender: snapshots every sitemap URL into dist/prerender/<host>/<path>/index.html so
 * crawlers that don't run JavaScript (Bing, AI crawlers, social link previews) get each page's real
 * content and head tags. .htaccess serves a snapshot to crawler/link-preview user agents when one exists
 * for the request's host + path (visitors get the lighter SPA shell); for crawlers that do run JS,
 * src/main.jsx swaps it for the live app once React has rendered the page.
 *
 * Uses the locally installed Chrome (--dump-dom), no npm dependencies. Every *.alphapremiergroup.com
 * host resolves to a local static server for dist/; all other hosts are blocked, so /api calls fail
 * and pages render their built-in fallback content.
 *
 *   node tools/prerender.mjs            (after `vite build`)
 *   CHROME_PATH=/path/to/chrome node tools/prerender.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(DIST, 'prerender');
const DOMAIN = 'alphapremiergroup.com';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const CONCURRENCY = 4;
const BUDGET_MS = 12000; // virtual time each page gets to load lazy chunks and finish entrance animations
const KILL_MS = 60000;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff', '.glb': 'model/gltf-binary',
};

// Runs inside the page just before the DOM is dumped: moves the rendered app into a static
// #prerender block (React will mount into the emptied #root) and drops runtime-only state.
const SNAPSHOT_SCRIPT = `<script data-prerender-only>
setTimeout(() => {
  const root = document.getElementById('root');
  const snap = document.createElement('div');
  snap.id = 'prerender';
  snap.innerHTML = root.innerHTML;
  snap.querySelectorAll('[aria-label="Cookie consent"]').forEach((el) => el.remove());
  snap.querySelectorAll('[data-aos]').forEach((el) => el.classList.add('aos-animate'));
  snap.querySelectorAll('[style*="opacity: 0"]').forEach((el) => { el.style.opacity = ''; });
  // The snapshot is a stand-in: keep its media from competing with the live app's CSS/JS for bandwidth.
  snap.querySelectorAll('video').forEach((el) => { el.removeAttribute('src'); el.removeAttribute('autoplay'); el.setAttribute('preload', 'none'); });
  snap.querySelectorAll('img').forEach((el) => el.setAttribute('loading', 'lazy'));
  root.replaceChildren();
  root.setAttribute('style', 'visibility:hidden;position:absolute;top:0;left:0;right:0');
  root.after(snap);
  document.querySelectorAll('script[src*="googletagmanager"], script[data-prerender-only]').forEach((el) => el.remove());
}, ${BUDGET_MS - 1500});
</script>`;

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]));
}

function startServer() {
  const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').replace('</body>', `${SNAPSHOT_SCRIPT}</body>`);
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (pathname.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json' }).end('{}');
      return;
    }
    const file = path.join(DIST, path.normalize(pathname));
    if (file.startsWith(DIST + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' }).end(shell);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function dumpDom(url, port) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'apg-prerender-'));
  const args = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--mute-audio',
    `--user-data-dir=${profile}`, '--window-size=1366,900',
    `--host-resolver-rules=MAP ${DOMAIN} 127.0.0.1:${port}, MAP *.${DOMAIN} 127.0.0.1:${port}, MAP * ~NOTFOUND`,
    `--virtual-time-budget=${BUDGET_MS}`, '--dump-dom', `http://${url.host}${url.pathname}`,
  ];
  return new Promise((resolve, reject) => {
    const chrome = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'ignore'] });
    let html = '';
    const timer = setTimeout(() => chrome.kill('SIGKILL'), KILL_MS);
    chrome.stdout.on('data', (d) => { html += d; });
    chrome.on('error', reject);
    chrome.on('close', () => {
      clearTimeout(timer);
      fs.rmSync(profile, { recursive: true, force: true });
      if (html.includes('id="prerender"')) resolve(/^<!DOCTYPE/i.test(html.trimStart()) ? html : `<!DOCTYPE html>\n${html}`);
      else reject(new Error(`no snapshot produced for ${url.href}`));
    });
  });
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/index.html not found; run `vite build` first.');
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}; set CHROME_PATH.`);
  fs.rmSync(OUT, { recursive: true, force: true });

  const server = await startServer();
  const { port } = server.address();
  const queue = sitemapUrls();
  const failures = [];
  let done = 0;

  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      try {
        const html = await dumpDom(url, port);
        const dest = path.join(OUT, url.host, url.pathname, 'index.html');
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, html);
        // main.jsx swaps to the live app when it renders an <h1>; without one the swap waits for its 8s fallback.
        const snapshot = html.slice(html.indexOf('id="prerender"'), html.lastIndexOf('<noscript>'));
        const h1 = /<h1[\s>]/.test(snapshot) ? '' : '  (no <h1>: slow swap)';
        console.log(`  ${++done}. ${url.href}  ${Math.round(html.length / 1024)} KB${h1}`);
      } catch (err) {
        failures.push(url.href);
        console.error(`  ✗ ${url.href}: ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  server.close();

  if (failures.length) throw new Error(`${failures.length} page(s) failed to prerender`);
  console.log(`  prerendered ${done} pages into dist/prerender/`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
