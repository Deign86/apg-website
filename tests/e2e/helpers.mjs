// Shared browser-suite helpers.
import { test as base, expect } from '@playwright/test';
import { WEB } from '../support/env.mjs';
import { credentials } from '../support/http.mjs';

/**
 * Every spec imports `test` from here: background videos (tens of MB, decoded in software by headless
 * Chrome) are not fetched, which keeps parallel runs from starving the machine. Nothing asserts on them.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(/\.(mp4|webm|mov)(\?|$)/i, (route) => route.abort('blockedbyclient'));
    await use(context);
  },
});
export { expect };

const BLOCKED = /ERR_BLOCKED_BY_CLIENT/;

/** Hides the cookie banner for a context (its own test covers it). */
export async function skipCookieBanner(context) {
  await context.addCookies([{ name: 'apg_consent', value: 'declined', url: WEB }]);
}

/**
 * Collects console errors, uncaught page errors and failed same-origin requests. Requests the app
 * aborts itself (StrictMode double-mount, route changes) are not failures.
 */
export function watchPage(page, origin = WEB) {
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' && !BLOCKED.test(msg.text())) problems.push(`console: ${msg.text().slice(0, 300)}`); });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message.slice(0, 300)}`));
  page.on('response', (res) => {
    if (res.url().startsWith(origin) && res.status() >= 400) problems.push(`HTTP ${res.status()} ${res.url().slice(origin.length)}`);
  });
  page.on('requestfailed', (req) => {
    const error = req.failure()?.errorText ?? '';
    if (req.url().startsWith(origin) && !/ERR_ABORTED|NS_BINDING_ABORTED|ERR_BLOCKED_BY_CLIENT/.test(error)) problems.push(`failed ${req.url().slice(origin.length)} ${error}`);
  });
  return problems;
}

/**
 * page.goto that waits until our own origin is quiet (no request in flight for 400 ms) instead of
 * 'networkidle', which also waits on third-party fonts/photos and streamed video and is far slower.
 */
export async function gotoSettled(page, url, origin = WEB) {
  const inflight = new Set();
  const track = (req) => { if (req.url().startsWith(origin) && req.resourceType() !== 'media') inflight.add(req); };
  const done = (req) => inflight.delete(req);
  page.on('request', track);
  page.on('requestfinished', done);
  page.on('requestfailed', done);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const deadline = Date.now() + 30000;
    let quietSince = Date.now();
    while (Date.now() - quietSince < 400 && Date.now() < deadline) {
      if (inflight.size) quietSince = Date.now();
      await page.waitForTimeout(50);
    }
  } finally {
    page.off('request', track);
    page.off('requestfinished', done);
    page.off('requestfailed', done);
  }
}

/** Content rendered: no error-boundary fallback, and a visible h1 or a main landmark with real text. */
export async function expectRendered(page) {
  await expect(async () => {
    const h1 = await page.locator('h1:visible').first().innerText({ timeout: 1000 }).catch(() => '');
    const main = h1 ? '' : await page.locator('main').first().innerText({ timeout: 1000 }).catch(() => '');
    expect(h1.trim().length > 0 || main.trim().length > 200, 'page has neither a visible h1 nor main content').toBe(true);
  }).toPass({ timeout: 15000 });
  await expect(page.getByRole('alert').filter({ hasText: 'Something went wrong' })).toHaveCount(0);
}

/** Signs the browser context in as a seeded role (API login through the Vite proxy; the context keeps the cookie). */
export async function signIn(page, role = 'superadmin') {
  const { email, password } = credentials(role);
  const res = await page.request.post('/api/admin/auth.php', { data: { email, password }, headers: { Origin: WEB } });
  expect(res.status(), await res.text()).toBe(200);
}

/** Public forms reject submissions made < 3 s after the form opened (bot check): wait out the rest. */
export async function waitForFormTimer(openedAt) {
  const wait = 3300 - (Date.now() - openedAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}
