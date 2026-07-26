const base = (process.env.E2E_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const checks = [
  ['GET', '/', 200],
  ['GET', '/properties', 200],
  ['GET', '/careers', 200],
  ['GET', '/blogs', 200],
  ['GET', '/api/ai/health', 200],
  ['GET', '/api/admin/stats', 401],
];
let failed = false;
for (const [method, path, expected] of checks) {
  const response = await fetch(base + path, { method });
  const ok = response.status === expected;
  console.log(`${method} ${path}: ${response.status} expected ${expected} ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) failed = true;
}
const invalidContact = await fetch(base + '/api/contact', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}),
});
console.log(`POST /api/contact invalid body: ${invalidContact.status} expected 400 ${invalidContact.status === 400 ? 'PASS' : 'FAIL'}`);
if (invalidContact.status !== 400) failed = true;
if (failed) process.exitCode = 1;
