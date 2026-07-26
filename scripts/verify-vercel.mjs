const base = process.env.VERCEL_PRODUCTION_URL || 'https://apg-website-alpha-deign86s-projects.vercel.app';
const normalized = base.replace(/\/$/, '');
const checks = [
  { path: '/', method: 'GET', expectJson: false },
  { path: '/api/ai/health', method: 'GET', expectJson: true },
  { path: '/api/assets/public-meta?id=00000000-0000-0000-0000-000000000000', method: 'GET', expectJson: true },
  { path: '/api/contact', method: 'GET', expectJson: true },
];
let failed = false;
for (const check of checks) {
  const response = await fetch(normalized + check.path, { method: check.method });
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  const isLoginPage = /Login\s*[–-]\s*Vercel|_next\/static/.test(text);
  const isJson = contentType.toLowerCase().includes('application/json');
  const ok = check.expectJson ? isJson && !isLoginPage : response.ok && !isLoginPage && /<script|index/i.test(text);
  console.log(`${check.method} ${check.path}: ${response.status} ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) failed = true;
}
if (failed) {
  console.error(`Vercel deployment is not serving the APG Vite app/API: ${normalized}`);
  process.exitCode = 1;
}
